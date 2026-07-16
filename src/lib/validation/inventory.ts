import { z } from 'zod';
import {
  CatalogGame,
  InventoryMovementType,
  InventoryOwnershipType,
  ProductType,
} from '@prisma/client';

const uuid = z.string().uuid();
const money = z.union([
  z.string().regex(/^\d+(\.\d{1,4})?$/),
  z.number().nonnegative(),
]);
const currency = z.string().length(3).default('USD');
const ownershipFields = {
  ownershipType: z.nativeEnum(InventoryOwnershipType),
  consignorId: uuid.optional(),
};
const validateOwnership = (
  value: { ownershipType: InventoryOwnershipType; consignorId?: string },
  ctx: z.RefinementCtx,
) => {
  if (value.ownershipType === 'CONSIGNMENT' && !value.consignorId)
    ctx.addIssue({
      code: 'custom',
      message: 'Consignment inventory requires a consignor.',
    });
  if (value.ownershipType === 'COMPANY' && value.consignorId)
    ctx.addIssue({
      code: 'custom',
      message: 'Company inventory cannot reference a consignor.',
    });
};

export const ownershipSchema = z
  .object(ownershipFields)
  .superRefine(validateOwnership);

export const productCreateSchema = z.object({
  game: z.nativeEnum(CatalogGame),
  productType: z.nativeEnum(ProductType),
  name: z.string().min(1),
  setName: z.string().optional(),
  setCode: z.string().optional(),
  cardNumber: z.string().optional(),
  rarity: z.string().optional(),
  language: z.string().optional(),
  finish: z.string().optional(),
  variant: z.string().optional(),
  manufacturer: z.string().optional(),
  notes: z.string().optional(),
  externalReferences: z.record(z.string()).optional(),
});
export const storageLocationCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  parentLocationId: uuid.optional(),
});
export const purchaseLineSchema = z.object({
  productId: uuid,
  quantity: z.number().int().positive(),
  unitCost: money,
  lineTotal: money,
  inventoryType: z.enum(['QUANTITY', 'INDIVIDUAL']),
  notes: z.string().optional(),
});
export const purchaseCreateSchema = z
  .object({
    purchaseDate: z.coerce.date(),
    sourceName: z.string().min(1),
    sourceChannel: z.string().optional(),
    externalReference: z.string().optional(),
    currency,
    subtotal: money,
    tax: money.default('0'),
    shipping: money.default('0'),
    fees: money.default('0'),
    totalCost: money,
    notes: z.string().optional(),
    createdByUserId: uuid.optional(),
    locationId: uuid,
    ownershipType: z
      .nativeEnum(InventoryOwnershipType)
      .default(InventoryOwnershipType.COMPANY),
    consignorId: uuid.optional(),
    lines: z.array(purchaseLineSchema).min(1),
  })
  .superRefine(validateOwnership);
export const quantityReceiptSchema = z
  .object({
    ...ownershipFields,
    productId: uuid,
    locationId: uuid,
    quantity: z.number().int().positive(),
    acquisitionUnitCost: money,
    purchaseLineId: uuid.optional(),
    currency,
  })
  .superRefine(validateOwnership);
export const serializedItemReceiptSchema = z
  .object({
    ...ownershipFields,
    productId: uuid,
    locationId: uuid,
    acquisitionCost: money,
    purchaseLineId: uuid.optional(),
    currency,
    internalInventoryId: z.string().optional(),
    notes: z.string().optional(),
    gradingCompany: z.string().optional(),
    grade: z.string().optional(),
    certificationNumber: z.string().optional(),
    gradingQualifier: z.string().optional(),
    gradingLabelDetails: z.string().optional(),
  })
  .superRefine(validateOwnership);
export const inventoryAdjustmentSchema = z.object({
  lotId: uuid,
  quantityDelta: z
    .number()
    .int()
    .refine((v) => v !== 0),
  movementType: z.nativeEnum(InventoryMovementType),
  notes: z.string().optional(),
  actingUserId: uuid.optional(),
});
export const quantityTransferSchema = z.object({
  lotId: uuid,
  toLocationId: uuid,
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  actingUserId: uuid.optional(),
});
export const itemTransferSchema = z.object({
  itemId: uuid,
  toLocationId: uuid,
  notes: z.string().optional(),
  actingUserId: uuid.optional(),
});
export const reservationSchema = z.object({
  lotId: uuid,
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  actingUserId: uuid.optional(),
});
