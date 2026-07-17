import { requirePermission } from '@/lib/auth/authorization';
export default async function Page() {
  await requirePermission('catalog:manage');
  return (
    <section>
      <h1 className="text-3xl font-bold">New product</h1>
      <p>Create and archive catalog products using stable product IDs.</p>
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
