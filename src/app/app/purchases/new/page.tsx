import { requirePermission } from '@/lib/auth/authorization';
export default async function Page() {
  await requirePermission('purchases:create');
  return (
    <section>
      <h1 className="text-3xl font-bold">New purchase</h1>
      <p>
        Multi-line purchase receiving supports quantity and individual lines;
        server totals are authoritative.
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
