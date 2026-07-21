import { requirePermission } from '@/lib/auth/authorization';
import { TopTabs } from '@/components/app/top-tabs';
import { ComingSoon } from '@/components/app/coming-soon';
import { ScanIcon } from '@/components/app/icons';

export default async function AiCenteringPage() {
  await requirePermission('dashboard:access');
  return (
    <>
      <TopTabs active="ai-centering" />
      <ComingSoon
        title="AI Centering"
        description="Scan a card to detect its borders and measure centering. The camera-based capture flow is a dedicated build coming in a later round."
        icon={<ScanIcon />}
      />
    </>
  );
}
