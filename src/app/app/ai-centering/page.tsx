import { requirePermission } from '@/lib/auth/authorization';
import { TopTabs } from '@/components/app/top-tabs';
import { CenteringScreen } from '@/components/centering/centering-screen';

export default async function AiCenteringPage() {
  await requirePermission('dashboard:access');
  return (
    <>
      <TopTabs active="ai-centering" />
      <CenteringScreen />
    </>
  );
}
