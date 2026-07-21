import {
  ChartIcon,
  CollectionIcon,
  PeopleIcon,
  ProfileIcon,
  SearchIcon,
} from './icons';

// Single source of truth for the app's top-level tabs, shared by the mobile
// bottom nav and the desktop top nav so they can never drift out of sync.

export type NavItem = {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Extra path prefixes that should also mark this item active. */
  match?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/app/search', label: 'Search', Icon: SearchIcon },
  {
    href: '/app/collection',
    label: 'Collection',
    Icon: CollectionIcon,
    match: ['/app/scan'],
  },
  {
    href: '/app/portfolio',
    label: 'Portfolio',
    Icon: ChartIcon,
    match: ['/app/market', '/app/ai-centering'],
  },
  { href: '/app/social', label: 'Social', Icon: PeopleIcon },
  { href: '/app/profile', label: 'Profile', Icon: ProfileIcon },
];
