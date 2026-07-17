import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testIdentityCookieName } from '@/lib/auth/test-auth';

let activeIdentity: string | undefined;
let pathname = '/app';

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === testIdentityCookieName && activeIdentity
        ? { name, value: activeIdentity }
        : undefined,
  }),
}));

vi.mock('@/lib/auth', () => ({
  auth: async () => null,
  signOut: async () => undefined,
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
  usePathname: () => pathname,
}));

const catalogItems = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Synthetic Electric Mouse',
    game: 'POKEMON',
    productType: 'RAW_CARD',
    setName: 'Demo Set',
    setCode: 'DMO',
    cardNumber: '001',
    language: 'EN',
    finish: null,
    variant: null,
    archivedAt: null,
  },
];
const lot = {
  id: '00000000-0000-4000-8000-000000000301',
  ownershipType: 'COMPANY',
  quantityOnHand: 10,
  quantityReserved: 2,
  status: 'ACTIVE',
  acquisitionUnitCost: '2.5000',
  currency: 'USD',
  purchaseLineId: 'purchase-line-1',
  product: {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Synthetic Electric Mouse',
    game: 'POKEMON',
    productType: 'RAW_CARD',
    setName: 'Demo Set',
    setCode: 'DMO',
    cardNumber: '001',
    language: 'EN',
    finish: null,
    variant: null,
  },
  consignor: null,
  location: { id: 'loc-1', code: 'WH', name: 'Warehouse Shelf A1' },
  movements: [],
};
const item = {
  id: '00000000-0000-4000-8000-000000000401',
  internalInventoryId: 'DEMO-GRADED-001',
  ownershipType: 'CONSIGNMENT',
  status: 'ACTIVE',
  gradingCompany: 'SYNTH',
  grade: '9.5',
  certificationNumber: 'CERT-DEMO-001',
  acquisitionCost: '50.0000',
  currency: 'USD',
  purchaseLineId: 'purchase-line-2',
  product: {
    id: '00000000-0000-4000-8000-000000000103',
    name: 'Synthetic Graded Dragon',
    game: 'POKEMON',
    productType: 'GRADED_CARD',
    setName: null,
    setCode: 'DMO',
    cardNumber: '006',
    language: null,
    finish: null,
    variant: null,
  },
  consignor: { displayName: 'BAM' },
  location: { id: 'loc-2', code: 'BINDER', name: 'Pokémon Binder 01' },
  movements: [],
};

vi.mock('@/lib/catalog/queries', () => ({
  listCatalogProducts: vi.fn(async (raw: Record<string, unknown>) => ({
    items: raw.q === 'missing' ? [] : catalogItems,
    total: raw.q === 'missing' ? 0 : 1,
    filters: {
      q: raw.q as string | undefined,
      game: undefined,
      productType: undefined,
      archived: 'active',
    },
    page: 1,
    pageSize: 20,
    skip: 0,
    take: 20,
    pageCount: 2,
  })),
  getCatalogProductDetail: vi.fn(async (id: string) =>
    id === catalogItems[0].id
      ? {
          ...catalogItems[0],
          rarity: null,
          manufacturer: null,
          notes: null,
          quantityInventoryLots: [lot],
          individualInventoryItems: [],
        }
      : null,
  ),
}));

vi.mock('@/lib/inventory/queries', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/inventory/queries')>();
  return {
    ...actual,
    listInventory: vi.fn(
      async (_raw: Record<string, unknown>, canReadCost: boolean) => ({
        lots: [
          canReadCost
            ? lot
            : omit(lot, ['acquisitionUnitCost', 'currency', 'purchaseLineId']),
        ],
        lotTotal: 1,
        items: [
          canReadCost
            ? item
            : omit(item, ['acquisitionCost', 'currency', 'purchaseLineId']),
        ],
        itemTotal: 1,
        total: 2,
        locations: [lot.location, item.location],
        filters: { type: 'all' },
        page: 1,
        pageSize: 20,
        skip: 0,
        take: 20,
        pageCount: 2,
      }),
    ),
    getDashboardCounts: vi.fn(async () => ({
      catalogCount: 1,
      quantityLotCount: 1,
      individualItemCount: 1,
      totalAvailableUnits: 9,
      reservedUnits: 2,
    })),
    getQuantityLotDetail: vi.fn(async (id: string, canReadCost: boolean) =>
      id === lot.id
        ? {
            ...(canReadCost
              ? lot
              : omit(lot, [
                  'acquisitionUnitCost',
                  'currency',
                  'purchaseLineId',
                ])),
            movements: [],
          }
        : null,
    ),
    getIndividualItemDetail: vi.fn(async (id: string, canReadCost: boolean) =>
      id === item.id
        ? {
            ...(canReadCost
              ? item
              : omit(item, ['acquisitionCost', 'currency', 'purchaseLineId'])),
            movements: [],
          }
        : null,
    ),
  };
});

function omit<T extends Record<string, unknown>>(source: T, keys: string[]) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !keys.includes(key)),
  );
}

async function renderServer(ui: Promise<React.ReactElement>) {
  render(await ui);
}

beforeEach(() => {
  activeIdentity = 'owner';
  pathname = '/app';
});

describe('Phase 3A route and component rendering', () => {
  it('denies unauthenticated users from /app', async () => {
    activeIdentity = undefined;
    const Page = (await import('@/app/app/page')).default;
    await expect(Page()).rejects.toThrow('REDIRECT:/sign-in');
  });

  it('denies users without catalog:read from /app/catalog', async () => {
    activeIdentity = 'customer';
    const Page = (await import('@/app/app/catalog/page')).default;
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'REDIRECT:/unauthorized',
    );
  });

  it('denies users without inventory:read from /app/inventory', async () => {
    activeIdentity = 'customer';
    const Page = (await import('@/app/app/inventory/page')).default;
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'REDIRECT:/unauthorized',
    );
  });

  it('renders catalog products and keeps filters in pagination links', async () => {
    const Page = (await import('@/app/app/catalog/page')).default;
    await renderServer(
      Page({ searchParams: Promise.resolve({ q: 'Electric' }) }),
    );
    expect(screen.getByText('Synthetic Electric Mouse')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Next' }).getAttribute('href'),
    ).toBe('/app/catalog?q=Electric&page=2');
  });

  it('renders catalog no-results state', async () => {
    const Page = (await import('@/app/app/catalog/page')).default;
    await renderServer(
      Page({ searchParams: Promise.resolve({ q: 'missing' }) }),
    );
    expect(
      screen.getByText('No catalog products match these filters.'),
    ).toBeTruthy();
  });

  it('renders quantity lots', async () => {
    const Page = (await import('@/app/app/inventory/page')).default;
    await renderServer(Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('Synthetic Electric Mouse')).toBeTruthy();
  });

  it('renders individual items', async () => {
    const Page = (await import('@/app/app/inventory/page')).default;
    await renderServer(Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText('DEMO-GRADED-001')).toBeTruthy();
  });

  it('hides cost fields for employee and shows them for owner', async () => {
    const Page = (await import('@/app/app/inventory/page')).default;
    activeIdentity = 'employee';
    const { unmount } = render(
      await Page({ searchParams: Promise.resolve({}) }),
    );
    expect(screen.queryByText(/Unit cost/i)).toBeNull();
    expect(screen.queryByText(/^Cost \$/)).toBeNull();
    unmount();
    activeIdentity = 'owner';
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText(/Unit cost/i)).toBeTruthy();
    expect(screen.getByText(/^Cost \$/)).toBeTruthy();
  });

  it('renders mobile navigation links', async () => {
    const { InternalNav } = await import('@/components/app/internal-nav');
    render(<InternalNav />);
    expect(screen.getAllByRole('link', { name: 'Dashboard' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Catalog' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Inventory' })).toHaveLength(2);
  });

  it('loads stable product ID catalog detail', async () => {
    const CatalogDetail = (await import('@/app/app/catalog/[productId]/page'))
      .default;
    await renderServer(
      CatalogDetail({
        params: Promise.resolve({ productId: catalogItems[0].id }),
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Synthetic Electric Mouse' }),
    ).toBeTruthy();
  });

  it('loads stable lot ID quantity-lot detail', async () => {
    const LotDetail = (await import('@/app/app/inventory/lots/[lotId]/page'))
      .default;
    await renderServer(
      LotDetail({ params: Promise.resolve({ lotId: lot.id }) }),
    );
    expect(screen.getByRole('heading', { name: 'Quantity lot' })).toBeTruthy();
  });

  it('loads stable item ID individual-item detail', async () => {
    const ItemDetail = (await import('@/app/app/inventory/items/[itemId]/page'))
      .default;
    await renderServer(
      ItemDetail({ params: Promise.resolve({ itemId: item.id }) }),
    );
    expect(
      screen.getByRole('heading', { name: 'DEMO-GRADED-001' }),
    ).toBeTruthy();
  });

  it('returns not found for an unknown product ID', async () => {
    const CatalogDetail = (await import('@/app/app/catalog/[productId]/page'))
      .default;
    await expect(
      CatalogDetail({
        params: Promise.resolve({ productId: crypto.randomUUID() }),
      }),
    ).rejects.toThrow('NOT_FOUND');
  });

  it('returns not found for an unknown lot ID', async () => {
    const LotDetail = (await import('@/app/app/inventory/lots/[lotId]/page'))
      .default;
    await expect(
      LotDetail({ params: Promise.resolve({ lotId: crypto.randomUUID() }) }),
    ).rejects.toThrow('NOT_FOUND');
  });

  it('returns not found for an unknown item ID', async () => {
    const ItemDetail = (await import('@/app/app/inventory/items/[itemId]/page'))
      .default;
    await expect(
      ItemDetail({ params: Promise.resolve({ itemId: crypto.randomUUID() }) }),
    ).rejects.toThrow('NOT_FOUND');
  });
});
