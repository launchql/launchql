import { resolve } from 'node:path';

import { parseValueArgs } from '../process';
import { runBenchmarkSuite, writeJsonAtomically } from '../run';
import type { BenchmarkSuiteDefinition } from '../types';

const main = async (): Promise<void> => {
  const { values } = parseValueArgs(process.argv.slice(2));
  const databaseUrl = values.get('database-url');
  const output = values.get('output');
  if (!databaseUrl || !output) throw new Error('--database-url and --output are required');
  const repetitions = Number(values.get('repetitions') ?? 1);
  const scale = Number(values.get('scale') ?? 0.01);
  const concurrency = Number(values.get('concurrency') ?? 1);
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new Error('concurrency must be between 1 and 16');
  }
  if (!Number.isSafeInteger(repetitions) || repetitions < 1 || repetitions > 50 || !Number.isFinite(scale) || scale <= 0) {
    throw new Error('repetitions must be 1–50 and scale must be positive');
  }
  const suite: BenchmarkSuiteDefinition = {
    name: 'unpatched-graphile-connection-lifecycle',
    cases: ['idle', 'subscribed', 'startup-race', 'cache', 'cache-subscribed', 'failed-build', 'replacement'].map(mode => ({
      name: mode,
      workerConfig: { mode, cycles: Math.max(1, Math.ceil((['idle', 'subscribed', 'startup-race'].includes(mode) ? 2000 : 256) * scale)), concurrency },
      ...(['cache', 'cache-subscribed', 'replacement'].includes(mode) ? { expectedSchemaGroup: 'lifecycle' } : {}),
    })),
  };
  const report = await runBenchmarkSuite(suite, {
    databaseUrl, repetitions, seed: 1747, order: null, workerTimeoutMs: 300_000,
  }, resolve(__dirname, 'worker.js'));
  await writeJsonAtomically(output, report);
  process.stdout.write(`${JSON.stringify({ output, validation: report.validation })}\n`);
  if (report.validation.errors.length) process.exitCode = 1;
};

void main().catch(error => { console.error(error); process.exitCode = 1; });
