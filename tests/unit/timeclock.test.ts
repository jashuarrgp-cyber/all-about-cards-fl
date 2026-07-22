import { describe, expect, it } from 'vitest';
import {
  applyAction,
  invalidActionMessage,
  isAllowed,
  stateFromLatest,
  summarizeShift,
} from '@/lib/timeclock/status';
import type { ClockEventLite } from '@/lib/timeclock/types';

describe('time clock state machine', () => {
  it('derives current state from the most recent event type', () => {
    expect(stateFromLatest(null)).toBe('OFF');
    expect(stateFromLatest('CLOCK_IN')).toBe('ON');
    expect(stateFromLatest('BREAK_START')).toBe('ON_BREAK');
    expect(stateFromLatest('BREAK_END')).toBe('ON');
    expect(stateFromLatest('CLOCK_OUT')).toBe('OFF');
  });

  it('allows only sensible transitions', () => {
    expect(isAllowed('OFF', 'CLOCK_IN')).toBe(true);
    expect(isAllowed('OFF', 'CLOCK_OUT')).toBe(false);
    expect(isAllowed('OFF', 'BREAK_START')).toBe(false);
    expect(isAllowed('ON', 'CLOCK_IN')).toBe(false);
    expect(isAllowed('ON', 'BREAK_START')).toBe(true);
    expect(isAllowed('ON', 'CLOCK_OUT')).toBe(true);
    expect(isAllowed('ON_BREAK', 'BREAK_END')).toBe(true);
    expect(isAllowed('ON_BREAK', 'CLOCK_OUT')).toBe(true);
    expect(isAllowed('ON_BREAK', 'BREAK_START')).toBe(false);
  });

  it('applyAction returns the resulting state for a valid move', () => {
    expect(applyAction('OFF', 'CLOCK_IN')).toBe('ON');
    expect(applyAction('ON', 'BREAK_START')).toBe('ON_BREAK');
    expect(applyAction('ON_BREAK', 'BREAK_END')).toBe('ON');
    expect(applyAction('ON', 'CLOCK_OUT')).toBe('OFF');
  });

  it('applyAction throws a friendly message for an invalid move', () => {
    expect(() => applyAction('ON', 'CLOCK_IN')).toThrow(
      "You're already clocked in.",
    );
    expect(() => applyAction('OFF', 'BREAK_START')).toThrow(
      'Clock in before starting a break.',
    );
  });

  it('gives distinct, plain-language reasons for each bad action', () => {
    expect(invalidActionMessage('OFF', 'CLOCK_OUT')).toBe(
      "You're not clocked in.",
    );
    expect(invalidActionMessage('ON_BREAK', 'BREAK_START')).toBe(
      "You're already on a break.",
    );
    expect(invalidActionMessage('ON', 'BREAK_END')).toBe(
      "You're not on a break.",
    );
  });
});

describe('summarizeShift', () => {
  const at = (hhmm: string) => new Date(`2026-07-22T${hhmm}:00Z`);

  it('counts worked time minus breaks for a normal shift', () => {
    const events: ClockEventLite[] = [
      { type: 'CLOCK_IN', occurredAt: at('09:00') },
      { type: 'BREAK_START', occurredAt: at('12:00') }, // 3h worked
      { type: 'BREAK_END', occurredAt: at('12:30') }, // 30m break
      { type: 'CLOCK_OUT', occurredAt: at('17:00') }, // 4.5h worked
    ];
    const { workedMs, breakMs } = summarizeShift(events);
    expect(workedMs / 3_600_000).toBeCloseTo(7.5); // 3 + 4.5
    expect(breakMs / 3_600_000).toBeCloseTo(0.5);
  });

  it('sorts events by time before totalling', () => {
    const events: ClockEventLite[] = [
      { type: 'CLOCK_OUT', occurredAt: at('17:00') },
      { type: 'CLOCK_IN', occurredAt: at('09:00') },
    ];
    expect(summarizeShift(events).workedMs / 3_600_000).toBeCloseTo(8);
  });

  it('ignores a still-open shift (clocked in, not yet out)', () => {
    const events: ClockEventLite[] = [
      { type: 'CLOCK_IN', occurredAt: at('09:00') },
    ];
    expect(summarizeShift(events)).toEqual({ workedMs: 0, breakMs: 0 });
  });
});
