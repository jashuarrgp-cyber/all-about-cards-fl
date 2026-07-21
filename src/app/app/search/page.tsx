import { requirePermission } from '@/lib/auth/authorization';
import { ComingSoon } from '@/components/app/coming-soon';
import { SearchIcon } from '@/components/app/icons';

export default async function SearchPage() {
  await requirePermission('dashboard:access');
  return (
    <ComingSoon
      title="Search"
      description="Browse the catalog by game and look up any product. This tab connects to the catalog built in earlier phases."
      icon={<SearchIcon />}
    />
  );
}
