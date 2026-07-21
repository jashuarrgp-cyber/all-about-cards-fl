'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartIcon,
  CollectionIcon,
  PeopleIcon,
  ProfileIcon,
  SearchIcon,
} from './icons';

type NavItem = {
  href: string;
  label: string;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  /** Extra path prefixes that should also mark this item active. */
  match?: string[];
};

const ITEMS: NavItem[] = [
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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/5 bg-base-950/85 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (match?.some((m) => pathname.startsWith(m)) ?? false);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  active
                    ? 'text-brand-teal'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
