// Shared types for the employee time clock.

/** What an employee is doing right now at the register. */
export type ClockState = 'OFF' | 'ON' | 'ON_BREAK';

/** The four things an employee can do. Values match the Prisma enum. */
export type ClockAction =
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'BREAK_START'
  | 'BREAK_END';

/** Minimal shape of an event needed to reason about state and hours. */
export interface ClockEventLite {
  type: ClockAction;
  occurredAt: Date;
}

export interface ClockStatus {
  state: ClockState;
  /** When the current state began (the latest event's time), or null if never clocked in. */
  since: Date | null;
}

/** Worked and break time for a set of events, in milliseconds. */
export interface ShiftTotals {
  workedMs: number;
  breakMs: number;
}
