import path from 'path';

export const FIXTURES_PATH = path.resolve(__dirname, '../../../../__fixtures__');

export const getFixturePath = (...paths: string[]) =>
  path.join(FIXTURES_PATH, ...paths);

export const cleanText = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

export async function teardownAllPools(): Promise<void> {
  const { teardownPgPools } = await import('pg-cache');
  await teardownPgPools();
}

export async function closeDatabasePools(databases: string[]): Promise<void> {
  // For now, we'll rely on the global teardown
  // Individual database pool cleanup can cause issues with pg-cache
}
