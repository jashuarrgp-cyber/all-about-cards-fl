import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { TimeClockWidget } from '@/components/team/time-clock-widget';
import { TeamDashboard } from '@/components/team/team-dashboard';
import { sampleTeam } from '@/lib/team/sample';

// Public, no-login preview of the owner "Team" view — where an owner/GM sees
// who's on the clock and how each employee is doing. Uses clearly-labeled
// sample staff. In the real app this area is owner/GM-only.

export const metadata: Metadata = {
  title: 'Team preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function ProfilePreviewPage() {
  return (
    <MobileFrame preview>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview · sample data
      </div>
      <div className="space-y-5 pt-5">
        <TimeClockWidget />
        <TeamDashboard data={sampleTeam} />
      </div>
    </MobileFrame>
  );
}
