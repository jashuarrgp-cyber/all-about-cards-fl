import { requirePermission } from '@/lib/auth/authorization';
export default async function Page() {
  await requirePermission('inventory:receive');
  return (
    <section>
      <h1 className="text-3xl font-bold">Receive quantity inventory</h1>
      <p>
        Manual quantity receipt requires an active location, ownership, cost,
        currency, and notes.
      </p>
      <form className="mt-4 grid gap-3">
        <input
          name="stableId"
          placeholder="Stable database ID, not row number"
        />
        <textarea name="notes" placeholder="Reason or notes" />
        <button type="submit">Preview server-authorized workflow</button>
      </form>
    </section>
  );
}
