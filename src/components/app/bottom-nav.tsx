'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

// Mobile-only: a persistent bottom tab bar. Hidden on wide screens, where
// SideNav takes over the exact same tabs instead. In `preview` mode the tabs
// link to the public `/preview/*` pages (a signed-in session isn't required
// there); tabs with no preview page are shown disabled so they can't dead-end
// the visitor at a sign-in screen.

export function BottomNav({ preview = false }: { preview?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/5 bg-base-950/85 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {NAV_ITEMS.map(({ href, label, Icon, match, previewHref }) => {
          const target = preview ? previewHref : href;

          // In preview mode a tab with no preview page is shown but disabled.
          if (preview && !target) {
            return (
              <li key={href}>
                <span
                  aria-disabled="true"
                  title={`${label} isn't part of this preview`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700"
                >
                  <Icon aria-hidden />
                </span>
              </li>
            );
          }

          const active = preview
            ? pathname === target
            : pathname === href ||
              pathname.startsWith(`${href}/`) ||
              (match?.some((m) => pathname.startsWith(m)) ?? false);

          return (
            <li key={href}>
              <Link
                href={target ?? href}
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
