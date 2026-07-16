import { Shell } from '@/components/ui/shell';
export default function UnauthorizedPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Unauthorized</h1>
      <p className="mt-3 text-slate-300">
        Your account does not have permission to access that area.
      </p>
    </Shell>
  );
}
