'use server';

import { requirePermission } from '@/lib/auth/authorization';
import { prisma } from '@/lib/db/prisma';
import {
  addCardFromSearch,
  type AddFromSearchInput,
} from '@/lib/collection/add-from-search-service';

export type { AddFromSearchInput };

export interface AddFromSearchResult {
  ok: boolean;
  error?: string;
}

export async function addSearchResultToCollection(
  input: AddFromSearchInput,
): Promise<AddFromSearchResult> {
  const user = await requirePermission('dashboard:access');
  try {
    await addCardFromSearch(prisma, input, user.id);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Could not add this to your collection right now.',
    };
  }
}
