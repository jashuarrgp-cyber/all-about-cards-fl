import Link from 'next/link';
import { businessConfig } from '@/config/business';
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 font-bold text-amber-200">
            {businessConfig.logoPlaceholder}
          </span>
          <span>{businessConfig.displayName}</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          {/* The design preview needs no login and is the one door that
              always opens today; Sign in / Workspace require an account,
              which isn't wired up yet (see PROGRESS.md). */}
          <Link href="/preview/portfolio" className="text-amber-200">
            View preview
          </Link>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/app">Workspace</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-10">{children}</section>
    </main>
  );
}
