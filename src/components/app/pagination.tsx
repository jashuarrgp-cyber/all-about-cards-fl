import React from 'react';
import Link from 'next/link';
export function Pagination({
  page,
  pageCount,
  previousHref,
  nextHref,
}: {
  page: number;
  pageCount: number;
  previousHref: string;
  nextHref: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <Link
        className={`rounded-xl px-4 py-3 no-underline ${page <= 1 ? 'pointer-events-none bg-white/5 text-slate-500' : 'bg-white/10 text-slate-100'}`}
        href={previousHref}
      >
        Previous
      </Link>
      <span className="text-sm text-slate-300">
        Page {page} of {pageCount}
      </span>
      <Link
        className={`rounded-xl px-4 py-3 no-underline ${page >= pageCount ? 'pointer-events-none bg-white/5 text-slate-500' : 'bg-white/10 text-slate-100'}`}
        href={nextHref}
      >
        Next
      </Link>
    </div>
  );
}
