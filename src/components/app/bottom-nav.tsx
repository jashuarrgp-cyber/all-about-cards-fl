'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

// Mobile-only: a persistent bottom tab bar. Hidden on wide screens, where
// TopNav takes over the exact same tabs instead.

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/5 bg-base-950/85 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map(({ href, label, Icon, match }) => {
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
                    ? 'text-brand-pink'
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
