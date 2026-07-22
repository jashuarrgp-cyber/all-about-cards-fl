import type { Metadata } from 'next';
import { MobileFrame } from '@/components/app/mobile-frame';
import { ComingSoon } from '@/components/app/coming-soon';
import { ProfileIcon } from '@/components/app/icons';

// Public, no-login preview of the Profile tab (currently a placeholder).

export const metadata: Metadata = {
  title: 'Profile preview — All About Cards FL',
  robots: { index: false, follow: false },
};

export default function ProfilePreviewPage() {
  return (
    <MobileFrame preview>
      <div className="rounded-b-2xl bg-brand-pink/10 px-4 py-1.5 text-center text-[11px] font-medium text-brand-pink">
        Design preview
      </div>
      <ComingSoon
        title="Profile"
        description="Account, roles, and workspace settings. Team and permission management is available to owners and administrators."
        icon={<ProfileIcon />}
      />
    </MobileFrame>
  );
}
