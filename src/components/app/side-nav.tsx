'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

// Desktop-only: a left sidebar rather than a top bar — same tabs, same
// routes, same active-state logic as BottomNav, just a different desktop
// navigation shape (deliberately distinct from a horizontal top-bar layout).

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-white/5 bg-base-900/60 lg:flex">
      <Link
        href="/app/search"
        className="px-6 pb-2 pt-8 text-lg font-bold tracking-tight text-white"
      >
        All About Cards
      </Link>
      <nav className="mt-4 flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon, match }) => {
            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`) ||
              (match?.some((m) => pathname.startsWith(m)) ?? false);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand-pink/10 text-brand-pink'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
