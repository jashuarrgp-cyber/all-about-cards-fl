import { requirePermission } from '@/lib/auth/authorization';
import { ComingSoon } from '@/components/app/coming-soon';
import { ProfileIcon } from '@/components/app/icons';

export default async function ProfilePage() {
  await requirePermission('dashboard:access');
  return (
    <ComingSoon
      title="Profile"
      description="Account, roles, and workspace settings. Team and permission management is available to owners and administrators."
      icon={<ProfileIcon />}
    />
  );
}
