import { Shell } from '@/components/ui/shell';
import { requireAdministratorAccess } from '@/lib/auth/authorization';
export default async function AdminPage() {
  await requireAdministratorAccess();
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="mt-3 text-slate-300">
        Administrative foundation is ready for future user, permission, and
        system settings work. Operational business modules are intentionally
        deferred.
      </p>
    </Shell>
  );
}
