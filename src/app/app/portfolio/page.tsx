import { requirePermission } from '@/lib/auth/authorization';
import { getPortfolioSnapshot } from '@/lib/portfolio/queries';
import { PortfolioScreen } from '@/components/portfolio/portfolio-screen';
import { TopTabs } from '@/components/app/top-tabs';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  await requirePermission('dashboard:access');
  const data = await getPortfolioSnapshot();

  return (
    <>
      <TopTabs active="portfolio" />
      <div className="pt-6">
        <PortfolioScreen data={data} />
      </div>
    </>
  );
}
