import { requirePermission } from '@/lib/auth/authorization';
export default async function Page() {
  await requirePermission('locations:manage');
  return (
    <section>
      <h1 className="text-3xl font-bold">New location</h1>
      <p>Create a unique active storage location with optional parent.</p>
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
