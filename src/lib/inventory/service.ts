import 'server-only';
import {
  Prisma,
  PrismaClient,
  InventoryMovementType,
  InventoryStatus,
  PurchaseLineInventoryType,
} from '@prisma/client';
import {
  inventoryAdjustmentSchema,
  itemTransferSchema,
  purchaseCreateSchema,
  quantityTransferSchema,
  reservationSchema,
  serializedItemReceiptSchema,
} from '@/lib/validation/inventory';

type Db = PrismaClient | Prisma.TransactionClient;
const isolationLevel = Prisma.TransactionIsolationLevel.Serializable;
const toDecimal = (value: string | number | Prisma.Decimal) =>
  new Prisma.Decimal(value);

async function audit(
  db: Db,
  action: string,
  entityType: string,
  entityId: string | null,
  actingUserId?: string,
  afterState?: unknown,
) {
  await db.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      actingUserId,
      afterState: afterState as Prisma.InputJsonValue,
    },
  });
}

export async function receivePurchaseIntoInventory(
  prisma: PrismaClient,
  input: unknown,
) {
  const data = purchaseCreateSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          purchaseDate: data.purchaseDate,
          sourceName: data.sourceName,
          sourceChannel: data.sourceChannel,
          externalReference: data.externalReference,
          currency: data.currency,
          subtotal: toDecimal(data.subtotal),
          tax: toDecimal(data.tax),
          shipping: toDecimal(data.shipping),
          fees: toDecimal(data.fees),
          totalCost: toDecimal(data.totalCost),
          notes: data.notes,
          createdByUserId: data.createdByUserId,
          lines: {
            create: data.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitCost: toDecimal(line.unitCost),
              lineTotal: toDecimal(line.lineTotal),
              inventoryType: line.inventoryType as PurchaseLineInventoryType,
              notes: line.notes,
            })),
          },
        },
        include: { lines: true },
      });
      for (const line of purchase.lines) {
        if (line.inventoryType === 'QUANTITY')
          await receiveQuantityInventory(
            tx,
            {
              productId: line.productId,
              locationId: data.locationId,
              ownershipType: data.ownershipType,
              consignorId: data.consignorId,
              quantity: line.quantity,
              acquisitionUnitCost: line.unitCost.toString(),
              purchaseLineId: line.id,
              currency: purchase.currency,
            },
            purchase.id,
            data.createdByUserId,
          );
      }
      await audit(
        tx,
        'inventory.purchase.receive',
        'Purchase',
        purchase.id,
        data.createdByUserId,
        { purchaseId: purchase.id },
      );
      return purchase;
    },
    { isolationLevel },
  );
}

export async function receiveQuantityInventory(
  db: Db,
  input: unknown,
  purchaseId?: string,
  actingUserId?: string,
) {
  const data = (
    await import('@/lib/validation/inventory')
  ).quantityReceiptSchema.parse(input);
  const lot = await db.quantityInventoryLot.create({
    data: {
      productId: data.productId,
      locationId: data.locationId,
      ownershipType: data.ownershipType,
      consignorId: data.consignorId,
      quantityOnHand: data.quantity,
      acquisitionUnitCost: toDecimal(data.acquisitionUnitCost),
      purchaseLineId: data.purchaseLineId,
      currency: data.currency,
    },
  });
  await db.inventoryMovement.create({
    data: {
      movementType: InventoryMovementType.PURCHASE_RECEIPT,
      quantityDelta: data.quantity,
      quantityInventoryLotId: lot.id,
      toLocationId: data.locationId,
      relatedPurchaseId: purchaseId,
      relatedPurchaseLineId: data.purchaseLineId,
      actingUserId,
    },
  });
  return lot;
}

export async function receiveSerializedItem(
  prisma: PrismaClient,
  input: unknown,
  purchaseId?: string,
  actingUserId?: string,
) {
  const data = serializedItemReceiptSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const item = await tx.individualInventoryItem.create({
        data: { ...data, acquisitionCost: toDecimal(data.acquisitionCost) },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: InventoryMovementType.PURCHASE_RECEIPT,
          individualInventoryItemId: item.id,
          toLocationId: item.locationId,
          relatedPurchaseId: purchaseId,
          relatedPurchaseLineId: item.purchaseLineId,
          actingUserId,
        },
      });
      await audit(
        tx,
        'inventory.item.receive',
        'IndividualInventoryItem',
        item.id,
        actingUserId,
        { itemId: item.id },
      );
      return item;
    },
    { isolationLevel },
  );
}

export async function adjustQuantityInventory(
  prisma: PrismaClient,
  input: unknown,
) {
  const data = inventoryAdjustmentSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const lot = await tx.quantityInventoryLot.findUniqueOrThrow({
        where: { id: data.lotId },
      });
      const next = lot.quantityOnHand + data.quantityDelta;
      if (next < lot.quantityReserved)
        throw new Error(
          'Inventory adjustment would make stock negative or over-reserved.',
        );
      const updated = await tx.quantityInventoryLot.update({
        where: { id: lot.id },
        data: { quantityOnHand: next, version: { increment: 1 } },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: data.reason,
          quantityDelta: data.quantityDelta,
          quantityInventoryLotId: lot.id,
          fromLocationId: data.quantityDelta < 0 ? lot.locationId : undefined,
          toLocationId: data.quantityDelta > 0 ? lot.locationId : undefined,
          actingUserId: data.actingUserId,
          notes: data.notes,
        },
      });
      await audit(
        tx,
        'inventory.quantity.adjust',
        'QuantityInventoryLot',
        lot.id,
        data.actingUserId,
        { quantityOnHand: updated.quantityOnHand },
      );
      return updated;
    },
    { isolationLevel },
  );
}

export async function transferQuantityInventory(
  prisma: PrismaClient,
  input: unknown,
) {
  const data = quantityTransferSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const from = await tx.quantityInventoryLot.findUniqueOrThrow({
        where: { id: data.lotId },
      });
      if (from.locationId === data.toLocationId)
        throw new Error('Source and destination locations must differ.');
      const destination = await tx.storageLocation.findFirst({
        where: { id: data.toLocationId, archivedAt: null },
      });
      if (!destination) throw new Error('Destination location must be active.');
      if (from.quantityReserved > 0)
        throw new Error('Reserved inventory cannot be transferred.');
      if (from.quantityOnHand - from.quantityReserved < data.quantity)
        throw new Error('Insufficient available inventory to transfer.');
      const target = await tx.quantityInventoryLot.create({
        data: {
          productId: from.productId,
          ownershipType: from.ownershipType,
          consignorId: from.consignorId,
          locationId: data.toLocationId,
          quantityOnHand: data.quantity,
          acquisitionUnitCost: from.acquisitionUnitCost,
          purchaseLineId: from.purchaseLineId,
          currency: from.currency,
        },
      });
      await tx.quantityInventoryLot.update({
        where: { id: from.id },
        data: {
          quantityOnHand: { decrement: data.quantity },
          version: { increment: 1 },
        },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: InventoryMovementType.TRANSFER,
          quantityDelta: -data.quantity,
          quantityInventoryLotId: from.id,
          fromLocationId: from.locationId,
          toLocationId: data.toLocationId,
          actingUserId: data.actingUserId,
          notes: data.notes,
        },
      });
      return target;
    },
    { isolationLevel },
  );
}

export async function transferIndividualItem(
  prisma: PrismaClient,
  input: unknown,
) {
  const data = itemTransferSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const item = await tx.individualInventoryItem.findUniqueOrThrow({
        where: { id: data.itemId },
      });
      if (item.locationId === data.toLocationId)
        throw new Error('Source and destination locations must differ.');
      const destination = await tx.storageLocation.findFirst({
        where: { id: data.toLocationId, archivedAt: null },
      });
      if (!destination) throw new Error('Destination location must be active.');
      const updated = await tx.individualInventoryItem.update({
        where: { id: item.id },
        data: { locationId: data.toLocationId },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: InventoryMovementType.TRANSFER,
          individualInventoryItemId: item.id,
          fromLocationId: item.locationId,
          toLocationId: data.toLocationId,
          actingUserId: data.actingUserId,
          notes: data.notes,
        },
      });
      return updated;
    },
    { isolationLevel },
  );
}

export async function reserveQuantity(prisma: PrismaClient, input: unknown) {
  const data = reservationSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const lot = await tx.quantityInventoryLot.findUniqueOrThrow({
        where: { id: data.lotId },
      });
      if (lot.quantityReserved + data.quantity > lot.quantityOnHand)
        throw new Error('Reserved quantity cannot exceed quantity on hand.');
      const updated = await tx.quantityInventoryLot.update({
        where: { id: lot.id },
        data: {
          quantityReserved: { increment: data.quantity },
          status: InventoryStatus.RESERVED,
          version: { increment: 1 },
        },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: InventoryMovementType.RESERVATION,
          quantityDelta: -data.quantity,
          quantityInventoryLotId: lot.id,
          fromLocationId: lot.locationId,
          actingUserId: data.actingUserId,
          notes: data.notes,
        },
      });
      return updated;
    },
    { isolationLevel },
  );
}

export async function releaseReservedQuantity(
  prisma: PrismaClient,
  input: unknown,
) {
  const data = reservationSchema.parse(input);
  return prisma.$transaction(
    async (tx) => {
      const lot = await tx.quantityInventoryLot.findUniqueOrThrow({
        where: { id: data.lotId },
      });
      if (lot.quantityReserved < data.quantity)
        throw new Error('Cannot release more than reserved quantity.');
      const updated = await tx.quantityInventoryLot.update({
        where: { id: lot.id },
        data: {
          quantityReserved: { decrement: data.quantity },
          status:
            lot.quantityReserved === data.quantity
              ? InventoryStatus.ACTIVE
              : InventoryStatus.RESERVED,
          version: { increment: 1 },
        },
      });
      await tx.inventoryMovement.create({
        data: {
          movementType: InventoryMovementType.RESERVATION_RELEASE,
          quantityDelta: data.quantity,
          quantityInventoryLotId: lot.id,
          toLocationId: lot.locationId,
          actingUserId: data.actingUserId,
          notes: data.notes,
        },
      });
      return updated;
    },
    { isolationLevel },
  );
}
