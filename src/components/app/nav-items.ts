import {
  ChartIcon,
  CollectionIcon,
  PeopleIcon,
  ProfileIcon,
  SearchIcon,
} from './icons';

// Single source of truth for the app's top-level tabs, shared by the mobile
// bottom nav and the desktop side nav so they can never drift out of sync.

export type NavItem = {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Extra path prefixes that should also mark this item active. */
  match?: string[];
  /**
   * Where this tab points on the public, no-login design preview. The real
   * `href` requires a signed-in session, so on preview pages the nav must
   * link to the matching `/preview/*` page instead — otherwise every click
   * bounces the visitor to a sign-in page. Items with no preview page (e.g.
   * Social, Profile) are shown disabled in preview mode rather than trapping
   * the visitor.
   */
  previewHref?: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/app/search',
    label: 'Search',
    Icon: SearchIcon,
    previewHref: '/preview/search',
  },
  {
    href: '/app/collection',
    label: 'Collection',
    Icon: CollectionIcon,
    match: ['/app/scan'],
    previewHref: '/preview/collection',
  },
  {
    href: '/app/portfolio',
    label: 'Portfolio',
    Icon: ChartIcon,
    match: ['/app/market', '/app/ai-centering'],
    previewHref: '/preview/portfolio',
  },
  {
    href: '/app/social',
    label: 'Social',
    Icon: PeopleIcon,
    previewHref: '/preview/social',
  },
  {
    href: '/app/profile',
    label: 'Profile',
    Icon: ProfileIcon,
    previewHref: '/preview/profile',
  },
];
