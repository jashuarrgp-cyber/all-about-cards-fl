const url = process.env.DATABASE_URL ?? '';
if (!url.includes('aacfl_test') && !url.includes('localhost')) {
  throw new Error(
    'Refusing to reset a database that does not look like a local test database.',
  );
}
console.log(
  'Use `prisma migrate reset --force` only against isolated local test databases.',
);
