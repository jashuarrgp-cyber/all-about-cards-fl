import Link from 'next/link';
import { requireAuthenticatedUser } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
import type { Permission } from '@/lib/auth/permissions';

const links: { href: string; label: string; permission: Permission }[] = [
  { href: '/app', label: 'Dashboard', permission: 'dashboard:access' },
  { href: '/app/catalog', label: 'Catalog', permission: 'catalog:read' },
  { href: '/app/inventory', label: 'Inventory', permission: 'inventory:read' },
  { href: '/app/purchases', label: 'Purchases', permission: 'purchases:read' },
  { href: '/app/locations', label: 'Locations', permission: 'locations:read' },
  { href: '/app/movements', label: 'Movements', permission: 'movements:read' },
  { href: '/app/audit', label: 'Audit', permission: 'audit:read' },
];

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthenticatedUser();
  const visibleLinks = links.filter((link) =>
    hasPermission(user.roles, link.permission),
  );
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4">
        <nav
          className="mx-auto flex max-w-6xl flex-wrap gap-4"
          aria-label="Internal navigation"
        >
          {visibleLinks.map((link) => (
            <Link
              className="text-sm font-medium text-sky-300"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
