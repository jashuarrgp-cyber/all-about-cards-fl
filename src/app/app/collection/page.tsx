import { requirePermission } from '@/lib/auth/authorization';
import { ComingSoon } from '@/components/app/coming-soon';
import { CollectionIcon } from '@/components/app/icons';

export default async function CollectionPage() {
  await requirePermission('dashboard:access');
  return (
    <ComingSoon
      title="Collection"
      description="Your full inventory — raw, graded, and sealed — organized into binders and lots. This builds on the inventory data foundation already in place."
      icon={<CollectionIcon />}
    />
  );
}
