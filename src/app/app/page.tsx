import { Shell } from '@/components/ui/shell';
import { requirePermission } from '@/lib/auth/authorization';
export default async function AppPage() {
  await requirePermission('dashboard:access');
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Workspace</h1>
      <p className="mt-3 text-slate-300">
        Authenticated workspace foundation is ready. Inventory, purchasing,
        sales, ecommerce, consignments, and point-of-sale modules will be added
        in later phases.
      </p>
    </Shell>
  );
}
