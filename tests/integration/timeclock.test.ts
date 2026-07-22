import { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  clockIn,
  clockOut,
  endBreak,
  getClockStatus,
  recordClockEvent,
  startBreak,
  TimeClockError,
} from '@/lib/timeclock/service';

// Requires a real PostgreSQL connection — runs in CI, not in a sandbox
// without a database. Mirrors the reset/base pattern of the other
// integration tests.

const prisma = new PrismaClient();

async function reset() {
  await prisma.timeClockEvent.deleteMany();
}

async function makeUser() {
  return prisma.user.create({
    data: { email: `${crypto.randomUUID()}@example.test` },
  });
}

beforeEach(reset);

describe('time clock service', () => {
  it('clocks in and reports ON status', async () => {
    const user = await makeUser();
    await clockIn(prisma, { userId: user.id, registerId: 'R1' });

    const status = await getClockStatus(prisma, user.id);
    expect(status.state).toBe('ON');
    expect(status.since).toBeInstanceOf(Date);
  });

  it('rejects a second clock-in with a friendly message', async () => {
    const user = await makeUser();
    await clockIn(prisma, { userId: user.id });
    await expect(clockIn(prisma, { userId: user.id })).rejects.toThrow(
      'already clocked in',
    );
  });

  it('runs a full shift and records every event in order', async () => {
    const user = await makeUser();
    await clockIn(prisma, { userId: user.id });
    await startBreak(prisma, { userId: user.id });
    await endBreak(prisma, { userId: user.id });
    await clockOut(prisma, { userId: user.id });

    const events = await prisma.timeClockEvent.findMany({
      where: { userId: user.id },
      orderBy: { seq: 'asc' },
    });
    expect(events.map((e) => e.type)).toEqual([
      'CLOCK_IN',
      'BREAK_START',
      'BREAK_END',
      'CLOCK_OUT',
    ]);
    expect((await getClockStatus(prisma, user.id)).state).toBe('OFF');
  });

  it('defaults recordedBy to the employee, and lets a manager log a correction', async () => {
    const employee = await makeUser();
    const manager = await makeUser();

    const self = await clockIn(prisma, { userId: employee.id });
    expect(self.recordedById).toBe(employee.id);

    const correction = await recordClockEvent(prisma, {
      userId: employee.id,
      action: 'CLOCK_OUT',
      recordedById: manager.id,
      note: 'forgot to clock out',
    });
    expect(correction.recordedById).toBe(manager.id);
    expect(correction.note).toBe('forgot to clock out');
  });

  it("won't start a break while off the clock", async () => {
    const user = await makeUser();
    await expect(
      startBreak(prisma, { userId: user.id }),
    ).rejects.toBeInstanceOf(TimeClockError);
  });
});
