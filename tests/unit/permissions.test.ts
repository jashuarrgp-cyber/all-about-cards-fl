import { describe, expect, it } from 'vitest';
import { hasPermission, roles, permissions } from '@/lib/auth/permissions';
describe('permissions', () => {
  it('defines expected roles and permissions', () => {
    expect(roles).toContain('OWNER');
    expect(permissions).toContain('admin:access');
  });
  it('grants owner admin access but not customer', () => {
    expect(hasPermission(['OWNER'], 'admin:access')).toBe(true);
    expect(hasPermission(['CUSTOMER'], 'admin:access')).toBe(false);
  });
});

import { parsePagination } from '@/lib/app/query-params';
import {
  availableQuantity,
  individualItemSelect,
  inventoryFilterSchema,
  quantityLotSelect,
} from '@/lib/inventory/queries';
import { catalogFilterSchema } from '@/lib/catalog/queries';

describe('Phase 3A permissions and query helpers', () => {
  it('maps internal read and cost permissions by role', () => {
    expect(hasPermission(['OWNER'], 'cost:read')).toBe(true);
    expect(hasPermission(['MANAGER'], 'inventory:read')).toBe(true);
    expect(hasPermission(['EMPLOYEE'], 'cost:read')).toBe(false);
    expect(hasPermission(['CARD_SHOW_VENDOR'], 'catalog:read')).toBe(true);
    expect(hasPermission(['CONSIGNOR'], 'dashboard:access')).toBe(false);
  });
  it('parses bounded pagination', () => {
    expect(parsePagination({ page: '2', pageSize: '10' })).toMatchObject({
      page: 2,
      pageSize: 10,
      skip: 10,
      take: 10,
    });
    expect(parsePagination({ page: '-1', pageSize: '999' })).toMatchObject({
      page: 1,
      pageSize: 20,
    });
  });
  it('validates filters safely', () => {
    expect(catalogFilterSchema.parse({ game: 'POKEMON' }).game).toBe('POKEMON');
    expect(catalogFilterSchema.parse({ game: 'BAD' }).game).toBeUndefined();
    expect(
      inventoryFilterSchema.parse({ ownershipType: 'COMPANY' }).ownershipType,
    ).toBe('COMPANY');
  });
  it('omits cost selections unless explicitly allowed', () => {
    expect(quantityLotSelect(false)).not.toHaveProperty('acquisitionUnitCost');
    expect(individualItemSelect(false)).not.toHaveProperty('acquisitionCost');
    expect(quantityLotSelect(true)).toHaveProperty('acquisitionUnitCost', true);
    expect(individualItemSelect(true)).toHaveProperty('acquisitionCost', true);
  });
  it('calculates available quantity without going negative', () => {
    expect(availableQuantity(10, 3)).toBe(7);
    expect(availableQuantity(1, 3)).toBe(0);
  });
});
