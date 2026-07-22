import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { ComingSoon } from '@/components/app/coming-soon';
import { PeopleIcon } from '@/components/app/icons';

// Public, no-login preview of the Social tab (currently a placeholder).

export const metadata: Metadata = {
  title: 'Social preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function SocialPreviewPage() {
  return (
    <MobileFrame preview>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview
      </div>
      <ComingSoon
        title="Social"
        description="Customers, consignors, and card-show contacts in one place. Relationship features arrive alongside the sales and consignment phase."
        icon={<PeopleIcon />}
      />
    </MobileFrame>
  );
}
