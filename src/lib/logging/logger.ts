const sensitive = [/password/i, /token/i, /secret/i, /key/i, /payment/i];
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        sensitive.some((r) => r.test(k)) ? '[REDACTED]' : redact(v),
      ]),
    );
  return value;
}
export function log(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {},
) {
  console[level === 'warn' ? 'warn' : level]({
    level,
    message,
    ...(redact(context) as Record<string, unknown>),
  });
}
