import { requirePermission } from '@/lib/auth/authorization';
import { ComingSoon } from '@/components/app/coming-soon';
import { PeopleIcon } from '@/components/app/icons';

export default async function SocialPage() {
  await requirePermission('dashboard:access');
  return (
    <ComingSoon
      title="Social"
      description="Customers, consignors, and card-show contacts in one place. Relationship features arrive alongside the sales and consignment phase."
      icon={<PeopleIcon />}
    />
  );
}
