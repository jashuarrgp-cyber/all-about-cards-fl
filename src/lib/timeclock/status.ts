import type {
  ClockAction,
  ClockEventLite,
  ClockState,
  ShiftTotals,
} from './types';

// Pure time-clock logic — no database, no framework. The clock is a small,
// linear state machine, so the current state is fully determined by the most
// recent event's type. Keeping this here (and DB-free) makes every rule
// unit-testable.

const LATEST_TYPE_TO_STATE: Record<ClockAction, ClockState> = {
  CLOCK_IN: 'ON',
  BREAK_START: 'ON_BREAK',
  BREAK_END: 'ON',
  CLOCK_OUT: 'OFF',
};

/** Current state from the most recent event type (null = no events yet). */
export function stateFromLatest(latestType: ClockAction | null): ClockState {
  return latestType ? LATEST_TYPE_TO_STATE[latestType] : 'OFF';
}

// Which states each action is allowed from.
const ALLOWED_FROM: Record<ClockAction, ClockState[]> = {
  CLOCK_IN: ['OFF'],
  CLOCK_OUT: ['ON', 'ON_BREAK'],
  BREAK_START: ['ON'],
  BREAK_END: ['ON_BREAK'],
};

const RESULT_STATE: Record<ClockAction, ClockState> = {
  CLOCK_IN: 'ON',
  CLOCK_OUT: 'OFF',
  BREAK_START: 'ON_BREAK',
  BREAK_END: 'ON',
};

export function isAllowed(current: ClockState, action: ClockAction): boolean {
  return ALLOWED_FROM[action].includes(current);
}

/** The state after an allowed action. Throws for a disallowed one. */
export function applyAction(
  current: ClockState,
  action: ClockAction,
): ClockState {
  if (!isAllowed(current, action)) {
    throw new Error(invalidActionMessage(current, action));
  }
  return RESULT_STATE[action];
}

/** A friendly, employee-facing reason an action isn't allowed right now. */
export function invalidActionMessage(
  current: ClockState,
  action: ClockAction,
): string {
  switch (action) {
    case 'CLOCK_IN':
      return current === 'ON_BREAK'
        ? "You're clocked in and on a break."
        : "You're already clocked in.";
    case 'CLOCK_OUT':
      return "You're not clocked in.";
    case 'BREAK_START':
      return current === 'OFF'
        ? 'Clock in before starting a break.'
        : "You're already on a break.";
    case 'BREAK_END':
      return current === 'OFF'
        ? "You're not clocked in."
        : "You're not on a break.";
  }
}

/**
 * Total worked and break time across a chronological run of events. Handles a
 * normal shift (in → break → back → out) and gracefully ignores a dangling
 * open segment (e.g. still clocked in) by simply not counting it.
 */
export function summarizeShift(events: ClockEventLite[]): ShiftTotals {
  const sorted = [...events].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
  );
  let workedMs = 0;
  let breakMs = 0;
  let workStart: Date | null = null;
  let breakStart: Date | null = null;

  for (const event of sorted) {
    switch (event.type) {
      case 'CLOCK_IN':
        workStart = event.occurredAt;
        break;
      case 'BREAK_START':
        if (workStart) {
          workedMs += event.occurredAt.getTime() - workStart.getTime();
          workStart = null;
        }
        breakStart = event.occurredAt;
        break;
      case 'BREAK_END':
        if (breakStart) {
          breakMs += event.occurredAt.getTime() - breakStart.getTime();
          breakStart = null;
        }
        workStart = event.occurredAt;
        break;
      case 'CLOCK_OUT':
        if (workStart) {
          workedMs += event.occurredAt.getTime() - workStart.getTime();
          workStart = null;
        }
        if (breakStart) {
          breakMs += event.occurredAt.getTime() - breakStart.getTime();
          breakStart = null;
        }
        break;
    }
  }

  return { workedMs, breakMs };
}
