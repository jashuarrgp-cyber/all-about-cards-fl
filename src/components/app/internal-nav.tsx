'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const links = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/catalog', label: 'Catalog' },
  { href: '/app/inventory', label: 'Inventory' },
];
export function InternalNav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="hidden gap-2 md:flex">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== '/app' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold no-underline ${active ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
              href={link.href}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur md:hidden">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== '/app' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              className={`rounded-2xl px-3 py-3 text-center text-xs font-bold no-underline ${active ? 'bg-amber-300 text-slate-950' : 'text-slate-200'}`}
              href={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
