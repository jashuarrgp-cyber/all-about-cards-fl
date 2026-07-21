import { NextResponse, type NextRequest } from 'next/server';
import { searchPokemonCards } from '@/lib/pricing/pokemon-tcg-provider';

// Public read-only endpoint: it returns only public card names and public
// market prices (no internal cost, no profit, no account or business data),
// so it does not need requirePermission() the way internal pages do. This
// keeps the labeled design preview working without login, matching the
// other /preview/* routes.
//
// Reads POKEMON_TCG_API_KEY directly (it's optional) rather than importing
// the shared strict server-env schema, which would force this route to also
// require unrelated secrets like DATABASE_URL and AUTH_SECRET at build time.

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? '';
  const result = await searchPokemonCards(query, {
    apiKey: process.env.POKEMON_TCG_API_KEY || undefined,
  });
  return NextResponse.json(result);
}
