import 'server-only';
import type { Prisma, PrismaClient, TimeClockEvent } from '@prisma/client';
import { isAllowed, invalidActionMessage, stateFromLatest } from './status';
import type { ClockAction, ClockStatus } from './types';

// DB-backed time clock. Records are append-only: a correction is a new event
// (with a note and the manager who made it), never an edit — so the history
// stays auditable. Validation runs inside a transaction against the latest
// event, so two quick taps can't produce an impossible sequence (e.g. two
// clock-ins in a row).

type Db = PrismaClient | Prisma.TransactionClient;

/** A user-safe error (its message is fine to show an employee). */
export class TimeClockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeClockError';
  }
}

export interface RecordEventInput {
  userId: string;
  action: ClockAction;
  registerId?: string | null;
  note?: string | null;
  /** Who recorded it — defaults to the employee themselves; set for manager corrections. */
  recordedById?: string | null;
}

export async function getClockStatus(
  db: Db,
  userId: string,
): Promise<ClockStatus> {
  const latest = await db.timeClockEvent.findFirst({
    where: { userId },
    orderBy: { seq: 'desc' },
  });
  return {
    state: stateFromLatest((latest?.type as ClockAction) ?? null),
    since: latest?.occurredAt ?? null,
  };
}

export async function recordClockEvent(
  db: Db,
  input: RecordEventInput,
): Promise<TimeClockEvent> {
  const run = async (tx: Prisma.TransactionClient) => {
    const latest = await tx.timeClockEvent.findFirst({
      where: { userId: input.userId },
      orderBy: { seq: 'desc' },
    });
    const current = stateFromLatest((latest?.type as ClockAction) ?? null);

    if (!isAllowed(current, input.action)) {
      throw new TimeClockError(invalidActionMessage(current, input.action));
    }

    return tx.timeClockEvent.create({
      data: {
        userId: input.userId,
        type: input.action,
        registerId: input.registerId ?? null,
        note: input.note ?? null,
        recordedById: input.recordedById ?? input.userId,
      },
    });
  };

  return '$transaction' in db
    ? db.$transaction(run)
    : run(db as Prisma.TransactionClient);
}

// Convenience wrappers for the four counter actions.
export const clockIn = (db: Db, i: Omit<RecordEventInput, 'action'>) =>
  recordClockEvent(db, { ...i, action: 'CLOCK_IN' });
export const clockOut = (db: Db, i: Omit<RecordEventInput, 'action'>) =>
  recordClockEvent(db, { ...i, action: 'CLOCK_OUT' });
export const startBreak = (db: Db, i: Omit<RecordEventInput, 'action'>) =>
  recordClockEvent(db, { ...i, action: 'BREAK_START' });
export const endBreak = (db: Db, i: Omit<RecordEventInput, 'action'>) =>
  recordClockEvent(db, { ...i, action: 'BREAK_END' });
