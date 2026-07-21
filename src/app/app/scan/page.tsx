import { requirePermission } from '@/lib/auth/authorization';
import { ScanScreen } from '@/components/scan/scan-screen';

export default async function ScanPage() {
  await requirePermission('dashboard:access');
  return <ScanScreen />;
}
