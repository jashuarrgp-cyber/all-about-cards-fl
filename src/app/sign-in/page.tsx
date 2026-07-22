import { Shell } from '@/components/ui/shell';
import { signIn, isGoogleConfigured } from '@/lib/auth';

// Rendered fresh per request so it reflects the current sign-in settings.
// Otherwise Next would prerender it once at build time and keep showing the
// "not turned on yet" version even after Google credentials are added.
export const dynamic = 'force-dynamic';

// Real sign-in page. Once Google credentials are configured (AUTH_GOOGLE_ID /
// AUTH_GOOGLE_SECRET), the "Sign in with Google" button is live. Before that
// — in CI, or before the one-time Google setup — it shows a plain-language
// "not turned on yet" note instead of a dead button.

export default function SignInPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">Sign in</h1>

        {isGoogleConfigured ? (
          <>
            <p className="mt-3 text-slate-300">
              Use your Google account. Signing in the first time creates your
              own private space automatically.
            </p>
            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/app/portfolio' });
              }}
              className="mt-6"
            >
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                Sign in with Google
              </button>
            </form>
          </>
        ) : (
          <p className="mt-3 text-slate-300">
            Sign-in isn&apos;t turned on for this site yet. Google sign-in
            switches on as soon as the one-time setup is finished (see
            PROGRESS.md). In the meantime, the design preview is open to
            everyone — no account needed.
          </p>
        )}
      </div>
    </Shell>
  );
}
