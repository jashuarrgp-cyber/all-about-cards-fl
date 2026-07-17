import { z } from 'zod';
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export function parsePagination(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const schema = z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(MAX_PAGE_SIZE)
      .default(DEFAULT_PAGE_SIZE),
  });
  const parsed = schema.parse({
    page: searchParams.page,
    pageSize: searchParams.pageSize,
  });
  return {
    ...parsed,
    skip: (parsed.page - 1) * parsed.pageSize,
    take: parsed.pageSize,
  };
}
