import { spawn } from 'child_process';
import { resolve as resolvePath } from 'path';
import { resolve as resolveSql } from '@launchql/db-utils';
import { streamSql } from './utils';
import env from '../env';

export async function sqitch(
  { database, host, password, port, user },
  path = process.cwd(),
  scriptType = 'deploy'
) {
  return new Promise((resolve) => {
    const proc = spawn('sqitch', [scriptType, `db:pg:${database}`], {
      cwd: resolvePath(path),
      env: Object.assign({}, env, {
        PGPASSWORD: password,
        PGUSER: user,
        PGHOST: host,
        PGPORT: port,
        PATH: process.env.PATH
      })
    });
    proc.on('close', (code) => {
      resolve();
    });
  });
}

export async function sqitchFast(
  config,
  path = process.cwd(),
  scriptType = 'deploy'
) {
  const sql = await resolveSql(path, scriptType);
  await streamSql(config, sql);
}
