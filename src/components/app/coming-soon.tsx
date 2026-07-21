// Polished placeholder for mobile tabs that are planned but not yet built.
// Keeps the navigation complete and honest without faking functionality.

export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand-teal">
        {icon}
      </div>
      <h1 className="mt-6 text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
        {description}
      </p>
      <span className="mt-6 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
        Coming soon
      </span>
    </div>
  );
}
