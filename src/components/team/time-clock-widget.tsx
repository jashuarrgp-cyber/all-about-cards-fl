'use client';

import { useState } from 'react';
import { applyAction, isAllowed } from '@/lib/timeclock/status';
import type { ClockAction, ClockState } from '@/lib/timeclock/types';

// Interactive demo of the register clock-in flow. It drives the real
// time-clock state machine (src/lib/timeclock/status.ts) with local state, so
// the buttons obey the real rules — no backend needed for the preview.

const STATE_LABEL: Record<ClockState, string> = {
  OFF: 'Off the clock',
  ON: 'Clocked in',
  ON_BREAK: 'On break',
};

const STATE_DOT: Record<ClockState, string> = {
  OFF: 'bg-slate-500',
  ON: 'bg-brand-up',
  ON_BREAK: 'bg-amber-300',
};

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ACTIONS: { action: ClockAction; label: string; primary?: boolean }[] = [
  { action: 'CLOCK_IN', label: 'Clock in', primary: true },
  { action: 'BREAK_START', label: 'Start break' },
  { action: 'BREAK_END', label: 'End break', primary: true },
  { action: 'CLOCK_OUT', label: 'Clock out' },
];

export function TimeClockWidget({
  employeeName = 'Maria R. (sample)',
}: {
  employeeName?: string;
}) {
  const [state, setState] = useState<ClockState>('OFF');
  const [since, setSince] = useState<string | null>(null);

  const act = (action: ClockAction) => {
    if (!isAllowed(state, action)) return;
    const next = applyAction(state, action);
    setState(next);
    setSince(next === 'OFF' ? null : nowLabel());
  };

  const available = ACTIONS.filter((a) => isAllowed(state, a.action));

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Register clock-in
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            {employeeName}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5">
          <span className={`h-2 w-2 rounded-full ${STATE_DOT[state]}`} />
          <span className="text-xs font-semibold text-slate-200">
            {STATE_LABEL[state]}
            {since ? ` · since ${since}` : ''}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {available.map((a) => (
          <button
            key={a.action}
            type="button"
            onClick={() => act(a.action)}
            className={`rounded-2xl py-3 text-sm font-bold transition ${
              a.primary
                ? 'bg-brand-pink text-base-950'
                : 'bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Demo — tap the buttons to see the flow. On the real register this is a
        4-digit PIN, and every buy/sale/trade is tagged to whoever&apos;s
        clocked in.
      </p>
    </div>
  );
}
