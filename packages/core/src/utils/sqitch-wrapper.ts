import { execSync, spawn } from 'child_process';
import { getSpawnEnvWithPg, getPgEnvOptions, PgConfig } from 'pg-env';
import { Logger } from '@launchql/logger';

const log = new Logger('sqitch-wrapper');

export interface SqitchOptions {
  /** Plan file to use, defaults to 'launchql.plan' */
  planFile?: string;
  /** Additional sqitch arguments */
  args?: string[];
  /** Whether to use execSync (true) or spawn (false) */
  sync?: boolean;
  /** Whether to automatically confirm (for revert) */
  confirm?: boolean;
}

/**
 * Wrapper for executing sqitch commands synchronously
 */
export function runSqitchSync(
  command: 'deploy' | 'revert' | 'verify',
  database: string,
  cwd: string,
  pgConfig: PgConfig,
  options: SqitchOptions = {}
): void {
  const { 
    planFile = 'launchql.plan',
    args = [],
    confirm = false
  } = options;
  
  const confirmArg = confirm && command === 'revert' ? ['-y'] : [];
  const cmd = `sqitch ${command} --plan-file ${planFile} db:pg:${database} ${confirmArg.join(' ')} ${args.join(' ')}`.trim();
  
  log.info(`Running: ${cmd}`);
  
  execSync(cmd, {
    cwd,
    env: getSpawnEnvWithPg(pgConfig),
    stdio: 'inherit'
  });
}

/**
 * Wrapper for executing sqitch commands asynchronously
 */
export async function runSqitch(
  command: 'deploy' | 'revert' | 'verify',
  database: string,
  cwd: string,
  pgConfig: PgConfig,
  options: SqitchOptions = {}
): Promise<number> {
  const { 
    planFile = 'launchql.plan',
    args = [],
    sync = false,
    confirm = false
  } = options;
  
  if (sync) {
    runSqitchSync(command, database, cwd, pgConfig, options);
    return 0;
  }
  
  const sqitchArgs = [command, '--plan-file', planFile, `db:pg:${database}`];
  
  // Add confirmation for revert
  if (confirm && command === 'revert') {
    sqitchArgs.push('-y');
  }
  
  // Add any additional arguments
  if (args.length > 0) {
    sqitchArgs.push(...args);
  }
  
  log.info(`Running: sqitch ${sqitchArgs.join(' ')}`);
  
  const child = spawn('sqitch', sqitchArgs, {
    cwd,
    env: getSpawnEnvWithPg(pgConfig)
  });
  
  return new Promise((resolve, reject) => {
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    
    child.stderr.on('data', (chunk: Buffer | string) => {
      const text = chunk.toString();
      if (/error/i.test(text)) {
        log.error(text);
      } else if (/warning/i.test(text)) {
        log.warn(text);
      } else {
        log.debug(text);
      }
    });
    
    child.stdout.on('data', (data) => {
      log.debug(data.toString().trim());
    });
    
    child.stdout.pipe(process.stdout);
    
    child.on('close', resolve);
    child.on('error', reject);
  });
}