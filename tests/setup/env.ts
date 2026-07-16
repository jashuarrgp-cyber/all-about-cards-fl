process.env.APP_URL ??= 'http://localhost:3000';
process.env.DATABASE_URL ??=
  'postgresql://aacfl:aacfl@localhost:5432/aacfl_test?schema=public';
process.env.AUTH_SECRET ??= 'test-secret-value-with-at-least-32-characters';
process.env.LOG_LEVEL ??= 'info';
process.env.TEST_ENV ??= 'true';
