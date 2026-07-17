'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Unable to load workspace</h1>
      <p className="mt-2 text-slate-300">Please retry or adjust filters.</p>
      <button
        className="mt-4 rounded-xl bg-amber-300 px-4 py-2 font-bold text-slate-950"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
