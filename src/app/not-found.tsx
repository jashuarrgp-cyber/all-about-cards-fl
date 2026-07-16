import { Shell } from '@/components/ui/shell';
export default function NotFound() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-300">The requested page does not exist.</p>
    </Shell>
  );
}
