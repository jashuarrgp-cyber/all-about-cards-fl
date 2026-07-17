import React from 'react';
export function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <details
      className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4"
      open
    >
      <summary className="cursor-pointer text-sm font-bold text-amber-200">
        Filters
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {children}
        <button className="min-h-11 rounded-xl bg-amber-300 px-4 py-2 font-bold text-slate-950">
          Apply
        </button>
      </div>
    </details>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}
export const inputClass =
  'min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-slate-100';
