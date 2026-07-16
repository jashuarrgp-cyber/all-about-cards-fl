-- CreateEnum
CREATE TYPE "CatalogGame" AS ENUM ('POKEMON', 'ONE_PIECE', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('RAW_CARD', 'GRADED_CARD', 'SEALED_PRODUCT');

-- CreateEnum
CREATE TYPE "InventoryOwnershipType" AS ENUM ('COMPANY', 'CONSIGNMENT');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('ACTIVE', 'RESERVED', 'SOLD', 'DAMAGED', 'RETURNED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PurchaseLineInventoryType" AS ENUM ('QUANTITY', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('PURCHASE_RECEIPT', 'MANUAL_ADJUSTMENT_IN', 'MANUAL_ADJUSTMENT_OUT', 'TRANSFER', 'RESERVATION', 'RESERVATION_RELEASE', 'DAMAGE', 'RETURN', 'SALE_ALLOCATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actingUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "requestId" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogProduct" (
    "id" TEXT NOT NULL,
    "game" "CatalogGame" NOT NULL,
    "productType" "ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "setName" TEXT,
    "setCode" TEXT,
    "cardNumber" TEXT,
    "rarity" TEXT,
    "language" TEXT,
    "finish" TEXT,
    "variant" TEXT,
    "manufacturer" TEXT,
    "notes" TEXT,
    "externalReferences" JSONB,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consignor" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consignor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "archivedAt" TIMESTAMP(3),
    "parentLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceChannel" TEXT,
    "externalReference" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(18,2) NOT NULL,
    "tax" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "shipping" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "fees" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(18,2) NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLine" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(18,4) NOT NULL,
    "lineTotal" DECIMAL(18,2) NOT NULL,
    "inventoryType" "PurchaseLineInventoryType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuantityInventoryLot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ownershipType" "InventoryOwnershipType" NOT NULL,
    "consignorId" TEXT,
    "locationId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "acquisitionUnitCost" DECIMAL(18,4) NOT NULL,
    "purchaseLineId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuantityInventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndividualInventoryItem" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ownershipType" "InventoryOwnershipType" NOT NULL,
    "consignorId" TEXT,
    "locationId" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "acquisitionCost" DECIMAL(18,4) NOT NULL,
    "purchaseLineId" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "internalInventoryId" TEXT,
    "notes" TEXT,
    "gradingCompany" TEXT,
    "grade" TEXT,
    "certificationNumber" TEXT,
    "gradingQualifier" TEXT,
    "gradingLabelDetails" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndividualInventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "movementType" "InventoryMovementType" NOT NULL,
    "quantityDelta" INTEGER,
    "quantityInventoryLotId" TEXT,
    "individualInventoryItemId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "relatedPurchaseId" TEXT,
    "relatedPurchaseLineId" TEXT,
    "actingUserId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "externalReference" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "AuditLog_actingUserId_idx" ON "AuditLog"("actingUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "CatalogProduct_game_productType_idx" ON "CatalogProduct"("game", "productType");

-- CreateIndex
CREATE INDEX "CatalogProduct_setCode_cardNumber_idx" ON "CatalogProduct"("setCode", "cardNumber");

-- CreateIndex
CREATE INDEX "CatalogProduct_name_idx" ON "CatalogProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Consignor_displayName_key" ON "Consignor"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_code_key" ON "StorageLocation"("code");

-- CreateIndex
CREATE INDEX "Purchase_purchaseDate_idx" ON "Purchase"("purchaseDate");

-- CreateIndex
CREATE INDEX "Purchase_createdByUserId_idx" ON "Purchase"("createdByUserId");

-- CreateIndex
CREATE INDEX "PurchaseLine_purchaseId_idx" ON "PurchaseLine"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseLine_productId_idx" ON "PurchaseLine"("productId");

-- CreateIndex
CREATE INDEX "QuantityInventoryLot_productId_idx" ON "QuantityInventoryLot"("productId");

-- CreateIndex
CREATE INDEX "QuantityInventoryLot_locationId_idx" ON "QuantityInventoryLot"("locationId");

-- CreateIndex
CREATE INDEX "QuantityInventoryLot_ownershipType_idx" ON "QuantityInventoryLot"("ownershipType");

-- CreateIndex
CREATE INDEX "QuantityInventoryLot_status_idx" ON "QuantityInventoryLot"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IndividualInventoryItem_internalInventoryId_key" ON "IndividualInventoryItem"("internalInventoryId");

-- CreateIndex
CREATE INDEX "IndividualInventoryItem_productId_idx" ON "IndividualInventoryItem"("productId");

-- CreateIndex
CREATE INDEX "IndividualInventoryItem_locationId_idx" ON "IndividualInventoryItem"("locationId");

-- CreateIndex
CREATE INDEX "IndividualInventoryItem_ownershipType_idx" ON "IndividualInventoryItem"("ownershipType");

-- CreateIndex
CREATE INDEX "IndividualInventoryItem_status_idx" ON "IndividualInventoryItem"("status");

-- CreateIndex
CREATE INDEX "IndividualInventoryItem_gradingCompany_certificationNumber_idx" ON "IndividualInventoryItem"("gradingCompany", "certificationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "IndividualInventoryItem_gradingCompany_certificationNumber_key" ON "IndividualInventoryItem"("gradingCompany", "certificationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryMovement_idempotencyKey_key" ON "InventoryMovement"("idempotencyKey");

-- CreateIndex
CREATE INDEX "InventoryMovement_occurredAt_idx" ON "InventoryMovement"("occurredAt");

-- CreateIndex
CREATE INDEX "InventoryMovement_quantityInventoryLotId_idx" ON "InventoryMovement"("quantityInventoryLotId");

-- CreateIndex
CREATE INDEX "InventoryMovement_individualInventoryItemId_idx" ON "InventoryMovement"("individualInventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryMovement_movementType_idx" ON "InventoryMovement"("movementType");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actingUserId_fkey" FOREIGN KEY ("actingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageLocation" ADD CONSTRAINT "StorageLocation_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CatalogProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CatalogProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_consignorId_fkey" FOREIGN KEY ("consignorId") REFERENCES "Consignor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_purchaseLineId_fkey" FOREIGN KEY ("purchaseLineId") REFERENCES "PurchaseLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CatalogProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_consignorId_fkey" FOREIGN KEY ("consignorId") REFERENCES "Consignor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_purchaseLineId_fkey" FOREIGN KEY ("purchaseLineId") REFERENCES "PurchaseLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_quantityInventoryLotId_fkey" FOREIGN KEY ("quantityInventoryLotId") REFERENCES "QuantityInventoryLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_individualInventoryItemId_fkey" FOREIGN KEY ("individualInventoryItemId") REFERENCES "IndividualInventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_relatedPurchaseId_fkey" FOREIGN KEY ("relatedPurchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_relatedPurchaseLineId_fkey" FOREIGN KEY ("relatedPurchaseLineId") REFERENCES "PurchaseLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_actingUserId_fkey" FOREIGN KEY ("actingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Phase 2 inventory and finance safeguards that Prisma cannot express directly.
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_quantity_nonnegative" CHECK ("quantityOnHand" >= 0 AND "quantityReserved" >= 0);
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_reserved_not_above_on_hand" CHECK ("quantityReserved" <= "quantityOnHand");
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_acquisition_cost_nonnegative" CHECK ("acquisitionUnitCost" >= 0);
ALTER TABLE "QuantityInventoryLot" ADD CONSTRAINT "QuantityInventoryLot_ownership_consignor_valid" CHECK (("ownershipType" = 'CONSIGNMENT' AND "consignorId" IS NOT NULL) OR ("ownershipType" = 'COMPANY' AND "consignorId" IS NULL));
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_acquisition_cost_nonnegative" CHECK ("acquisitionCost" >= 0);
ALTER TABLE "IndividualInventoryItem" ADD CONSTRAINT "IndividualInventoryItem_ownership_consignor_valid" CHECK (("ownershipType" = 'CONSIGNMENT' AND "consignorId" IS NOT NULL) OR ("ownershipType" = 'COMPANY' AND "consignorId" IS NULL));
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_money_nonnegative" CHECK (subtotal >= 0 AND tax >= 0 AND shipping >= 0 AND fees >= 0 AND "totalCost" >= 0);
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_quantity_positive" CHECK (quantity > 0);
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_money_nonnegative" CHECK ("unitCost" >= 0 AND "lineTotal" >= 0);
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_one_inventory_reference" CHECK ((("quantityInventoryLotId" IS NOT NULL)::int + ("individualInventoryItemId" IS NOT NULL)::int) = 1);
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_quantity_delta_valid" CHECK (("quantityInventoryLotId" IS NOT NULL AND "quantityDelta" IS NOT NULL AND "quantityDelta" <> 0) OR ("individualInventoryItemId" IS NOT NULL AND "quantityDelta" IS NULL));
