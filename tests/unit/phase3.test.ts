import { describe, expect, it } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';
import {
  inventoryAdjustmentSchema,
  ownershipSchema,
  purchaseLineSchema,
  reservationSchema,
} from '@/lib/validation/inventory';
import { assertPurchaseTotals } from '@/lib/inventory/money';
import { parsePagination } from '@/lib/inventory/pagination';
import { redactAuditValue } from '@/lib/audit/redaction';

describe('Phase 3 permissions', () => {
  it('grants managers operational audit and cost access and denies customers', () => {
    expect(hasPermission(['MANAGER'], 'cost:read')).toBe(true);
    expect(hasPermission(['MANAGER'], 'audit:read')).toBe(true);
    expect(hasPermission(['CUSTOMER'], 'inventory:read')).toBe(false);
  });
});

describe('Phase 3 validation helpers', () => {
  it('validates ownership rules', () => {
    expect(() =>
      ownershipSchema.parse({ ownershipType: 'CONSIGNMENT' }),
    ).toThrow();
    expect(() =>
      ownershipSchema.parse({
        ownershipType: 'COMPANY',
        consignorId: '7c96d862-89b0-4fd1-8ee5-68781ee54346',
      }),
    ).toThrow();
  });
  it('uses decimal-safe purchase totals', () => {
    expect(
      assertPurchaseTotals(
        [{ unitCost: '0.10', quantity: 3, lineTotal: '0.30' }],
        '0.00',
        '0.00',
        '0.00',
        '0.30',
      ).total.toString(),
    ).toBe('0.3');
  });
  it('checks item counts and reason allowlists', () => {
    expect(
      purchaseLineSchema.parse({
        productId: '7c96d862-89b0-4fd1-8ee5-68781ee54346',
        quantity: 2,
        unitCost: '1.00',
        lineTotal: '2.00',
        inventoryType: 'INDIVIDUAL',
      }).quantity,
    ).toBe(2);
    expect(() =>
      inventoryAdjustmentSchema.parse({
        lotId: '7c96d862-89b0-4fd1-8ee5-68781ee54346',
        quantityDelta: 1,
        reason: 'SALE_ALLOCATION',
        notes: 'bad',
      }),
    ).toThrow();
  });
  it('parses pagination and redacts audit secrets', () => {
    expect(parsePagination({ page: '2', pageSize: '25' }).skip).toBe(25);
    expect(
      redactAuditValue({ apiToken: 'secret', nested: { password: 'pw' } }),
    ).toEqual({ apiToken: '[REDACTED]', nested: { password: '[REDACTED]' } });
  });
  it('requires reservation notes for partial reservation status workflows', () => {
    expect(() =>
      reservationSchema.parse({
        lotId: '7c96d862-89b0-4fd1-8ee5-68781ee54346',
        quantity: 1,
      }),
    ).toThrow();
  });
});
