import { describe, expect, it } from 'vitest';
import { redact } from '@/lib/logging/logger';
describe('redaction', () => {
  it('redacts sensitive fields', () => {
    expect(redact({ password: 'x', nested: { apiKey: 'y' } })).toEqual({
      password: '[REDACTED]',
      nested: { apiKey: '[REDACTED]' },
    });
  });
});
