import { BottomNav } from './bottom-nav';
import { SideNav } from './side-nav';

// Same app, two shells: a phone-width single column with a bottom tab bar
// below the lg breakpoint, and a left sidebar with a left-aligned content
// column at lg and above — a different desktop shape than a centered
// top-bar layout. Same routes, same features either way — only the chrome
// around them changes.
//
// `preview` routes the nav to the public `/preview/*` pages instead of the
// login-required app, so the design-preview site can be clicked through
// freely without bouncing to a sign-in screen.

export function MobileFrame({
  children,
  preview = false,
}: {
  children: React.ReactNode;
  preview?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-base-950 text-slate-100 lg:flex-row">
      <SideNav preview={preview} />
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 lg:mx-0 lg:max-w-3xl lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
      <BottomNav preview={preview} />
    </div>
  );
}
