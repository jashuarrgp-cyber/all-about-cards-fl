import { Shell } from '@/components/ui/shell';
import { businessConfig } from '@/config/business';
export default function Home() {
  return (
    <Shell>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
          Phase 1 foundation
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">
          {businessConfig.displayName}
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          A secure application foundation for the future All About Cards FL TCG
          operations platform. Storefront and operational modules arrive in
          later phases.
        </p>
      </div>
    </Shell>
  );
}
