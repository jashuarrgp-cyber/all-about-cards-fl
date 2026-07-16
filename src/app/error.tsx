'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="p-6">
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
