import fs from 'fs';
import os from 'os';
import path from 'path';

import { DEFAULT_TEMPLATE_URL, runCreateGenApp } from '../../pgpm/dist/commands/init/create-gen-app';

/**
 * Jest global setup: pre-warm the create-gen-app cache against the remote
 * boilerplate repo so individual tests don't pay the clone/render cost.
 */
module.exports = async function globalSetup() {
  // Ensure deterministic git config behavior in tests
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-cache-warm-'));
  const workspaceDir = path.join(tmpDir, 'cache-warm-ws');

  try {
    await runCreateGenApp({
      templateUrl: DEFAULT_TEMPLATE_URL,
      branch: undefined,
      fromPath: 'workspace',
      outputDir: workspaceDir,
      // Provide all known placeholders to avoid prompts
      answers: {
        moduleName: 'cache-warm-ws',
        repoName: 'cache-warm-ws',
        packageIdentifier: 'cache-warm-ws',
        fullName: 'CI Test User',
        email: 'ci@example.com',
        username: 'ci',
        access: 'public',
        license: 'MIT'
      },
      noTty: true
    });
  } catch (err) {
    // Keep tests running even if cache warm fails; they'll clone on demand
    // eslint-disable-next-line no-console
    console.warn('[globalSetup] cache warm failed; tests may run slower:', (err as Error).message);
  } finally {
    // Best-effort cleanup to avoid tmp bloat
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
};
