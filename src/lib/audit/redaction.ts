const sensitive =
  /(secret|password|credential|authorization|token|cookie|key)/i;
export function redactAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAuditValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        sensitive.test(k) ? '[REDACTED]' : redactAuditValue(v),
      ]),
    );
  }
  return value;
}
export function safeJson(value: unknown) {
  return JSON.stringify(redactAuditValue(value), null, 2);
}
