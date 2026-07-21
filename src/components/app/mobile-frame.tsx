import { BottomNav } from './bottom-nav';

// Phone-shaped, dark, centered column that hosts the mobile collector
// experience. On wider screens it stays a comfortable single column so the
// layout reads the same everywhere. Includes the persistent bottom nav.

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-base-950 text-slate-100">
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
