import { BottomNav } from './bottom-nav';
import { TopNav } from './top-nav';

// Same app, two shells: a phone-width single column with a bottom tab bar
// below the lg breakpoint, and a website-style top nav with a wider,
// comfortable content column at lg and above. Same routes, same features
// either way — only the chrome around them changes.

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-base-950 text-slate-100">
      <TopNav />
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 lg:max-w-5xl lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
