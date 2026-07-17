import { z } from 'zod';
export const pageSizeOptions = [10, 20, 50] as const;
export function parsePagination(input: { page?: unknown; pageSize?: unknown }) {
  const page = z.coerce.number().int().min(1).catch(1).parse(input.page);
  const pageSize = z.coerce
    .number()
    .int()
    .refine((value) => pageSizeOptions.includes(value as 10 | 20 | 50))
    .catch(20)
    .parse(input.pageSize);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
export function paramsToObject(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}
export function pageHref(
  pathname: string,
  search: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search))
    if (value) params.set(key, value);
  params.set('page', String(page));
  return `${pathname}?${params.toString()}`;
}
