import React from 'react';
import { InternalNav } from '@/components/app/internal-nav';
import { requirePermission } from '@/lib/auth/authorization';
import { signOut } from '@/lib/auth';
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission('dashboard:access');
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <a href="/app" className="text-base font-bold no-underline">
            All About Cards FL
          </a>
          <InternalNav />
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
