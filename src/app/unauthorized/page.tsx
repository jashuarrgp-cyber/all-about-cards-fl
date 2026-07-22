import { Shell } from '@/components/ui/shell';

// Shown when someone is signed in but their account hasn't been granted
// access yet. A brand-new Google sign-in lands here until an owner/admin
// enables the account — so the message explains that plainly rather than
// sounding like an error.

export default function UnauthorizedPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">You&apos;re signed in</h1>
        <p className="mt-3 text-slate-300">
          Your account doesn&apos;t have access to this area yet. If this is
          your business account, it needs to be enabled once as the owner (see
          docs/SETUP_LOGIN.md); after that you&apos;ll go straight in. Customer
          spaces arrive in a later phase.
        </p>
      </div>
    </Shell>
  );
}
