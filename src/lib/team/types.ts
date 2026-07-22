import type { ClockState } from '@/lib/timeclock/types';

// Owner/GM "Team" view — one row per employee. Cost/profit numbers are
// allowed here because this screen is owner-only and never customer-facing.

export interface EmployeePerformance {
  buys: number;
  sales: number;
  trades: number;
  costPaid: number;
  profit: number;
}

export interface TeamMember {
  id: string;
  name: string;
  roleLabel: string;
  clockState: ClockState;
  /** Human label for when the current state began, e.g. "9:04 AM". */
  sinceLabel: string | null;
  hoursToday: number;
  hoursThisWeek: number;
  performance: EmployeePerformance;
}

export interface TeamSnapshot {
  members: TeamMember[];
  /** True when the numbers are labeled sample data, not live. */
  isSample: boolean;
}
