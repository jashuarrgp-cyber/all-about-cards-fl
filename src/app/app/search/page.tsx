import { requirePermission } from '@/lib/auth/authorization';
import { SearchScreen } from '@/components/search/search-screen';
import { addSearchResultToCollection } from '@/lib/collection/add-from-search';

export default async function SearchPage() {
  await requirePermission('dashboard:access');
  return <SearchScreen onAddToCollection={addSearchResultToCollection} />;
}
