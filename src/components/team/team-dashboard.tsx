import type { ClockState } from '@/lib/timeclock/types';
import type { TeamMember, TeamSnapshot } from '@/lib/team/types';
import { formatCount, formatUsd0 } from '@/lib/format';

// Owner/GM Team view: who's on the clock, hours, and per-employee
// performance. Owner-only — cost and profit are shown here, which is fine
// because this screen is never customer-facing.

const STATE_LABEL: Record<ClockState, string> = {
  OFF: 'Off',
  ON: 'On the clock',
  ON_BREAK: 'On break',
};

const STATE_STYLE: Record<ClockState, string> = {
  OFF: 'bg-white/[0.06] text-slate-400',
  ON: 'bg-brand-up/15 text-brand-up',
  ON_BREAK: 'bg-amber-300/15 text-amber-200',
};

function StatusBadge({ state }: { state: ClockState }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATE_STYLE[state]}`}
    >
      {STATE_LABEL[state]}
    </span>
  );
}

function hours(n: number) {
  return `${n.toFixed(n % 1 === 0 ? 0 : 1)}h`;
}

function MemberCard({ member }: { member: TeamMember }) {
  const p = member.performance;
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {member.name}
          </div>
          <div className="text-xs text-slate-500">{member.roleLabel}</div>
        </div>
        <StatusBadge state={member.clockState} />
      </div>

      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span>
          Today <span className="text-white">{hours(member.hoursToday)}</span>
        </span>
        <span>
          Week <span className="text-white">{hours(member.hoursThisWeek)}</span>
        </span>
        {member.sinceLabel && member.clockState !== 'OFF' && (
          <span>
            Since <span className="text-white">{member.sinceLabel}</span>
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center">
        <div>
          <div className="text-sm font-bold tabular-nums text-white">
            {formatCount(p.buys)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Buys
          </div>
        </div>
        <div>
          <div className="text-sm font-bold tabular-nums text-white">
            {formatCount(p.sales)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Sales
          </div>
        </div>
        <div>
          <div className="text-sm font-bold tabular-nums text-white">
            {formatCount(p.trades)}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Trades
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs">
        <span className="text-slate-400">
          Cost paid{' '}
          <span className="text-white tabular-nums">
            {formatUsd0(p.costPaid)}
          </span>
        </span>
        <span className="text-slate-400">
          Profit{' '}
          <span className="text-brand-up tabular-nums">
            {formatUsd0(p.profit)}
          </span>
        </span>
      </div>
    </div>
  );
}

export function TeamDashboard({ data }: { data: TeamSnapshot }) {
  const onNow = data.members.filter((m) => m.clockState !== 'OFF');

  return (
    <div className="space-y-5 pb-6 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="mt-1 text-sm text-slate-500">
          Owner view — who&apos;s working and how everyone&apos;s doing.
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
        <span className="text-sm text-slate-400">On the clock now: </span>
        <span className="text-sm font-semibold text-white">
          {onNow.length} of {data.members.length}
        </span>
      </div>

      <div className="space-y-2">
        {data.members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {data.isSample && (
        <p className="text-center text-[11px] text-slate-500">
          Sample team — real employees and numbers fill in once login is on and
          staff start clocking in.
        </p>
      )}
    </div>
  );
}
