import { requirePermission } from '@/lib/auth/authorization';
import { TopTabs } from '@/components/app/top-tabs';
import { ComingSoon } from '@/components/app/coming-soon';
import { ChartIcon } from '@/components/app/icons';

export default async function MarketPage() {
  await requirePermission('dashboard:access');
  return (
    <>
      <TopTabs active="market" />
      <ComingSoon
        title="Market"
        description="Market movers, grading plays, and trending cards will live here. We're wiring up live pricing sources in a later phase."
        icon={<ChartIcon />}
      />
    </>
  );
}
