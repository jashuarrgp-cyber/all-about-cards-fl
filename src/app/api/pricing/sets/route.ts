import { NextResponse } from 'next/server';
import { listPokemonSets } from '@/lib/pricing/pokemon-tcg-provider';

// Public read-only endpoint — same rationale as /api/pricing/search: only
// public set metadata (name, series, release date, card count, official
// logo), never cost, profit, or account data.

// Same freshness guarantee as /api/pricing/search — never statically cached.
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await listPokemonSets({
    apiKey: process.env.POKEMON_TCG_API_KEY || undefined,
  });
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
