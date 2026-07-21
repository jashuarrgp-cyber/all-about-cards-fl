'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

// Desktop-only: a website-style top bar with the same tabs as BottomNav,
// same routes, same active-state logic — just a layout suited to a wide
// screen instead of a phone. Hidden below the lg breakpoint.

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-white/5 bg-base-950/85 backdrop-blur lg:block">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-8 py-3.5">
        <Link href="/app/search" className="text-lg font-bold text-white">
          All About Cards
        </Link>
        <nav>
          <ul className="flex items-center gap-1">
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
                    className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-white/[0.06] text-brand-pink'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
