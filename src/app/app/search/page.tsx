import { requirePermission } from '@/lib/auth/authorization';
import { SearchScreen } from '@/components/search/search-screen';

export default async function SearchPage() {
  await requirePermission('dashboard:access');
  return <SearchScreen />;
}
