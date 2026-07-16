import { Shell } from '@/components/ui/shell';
export default function SignInPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-3 text-slate-300">
        Authentication is configured for secure provider-based sign-in after
        deployment settings are supplied.
      </p>
    </Shell>
  );
}
