import { execSync } from 'child_process';
import { getSpawnEnvWithPg, getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';

const log = new Logger('sqitch-wrapper');

/**
 * Wrapper for executing sqitch commands
 */
export async function runSqitch(
  command: 'deploy' | 'revert' | 'verify',
  database: string,
  cwd: string
): Promise<void> {
  const pgEnv = getPgEnvOptions();
  const cmd = `sqitch ${command} db:pg:${database}`;
  
  log.info(`Running: ${cmd}`);
  
  execSync(cmd, {
    cwd,
    env: getSpawnEnvWithPg(pgEnv),
    stdio: 'inherit'
  });
}