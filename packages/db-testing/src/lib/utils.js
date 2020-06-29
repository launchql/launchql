const Streamify = require('streamify-string');
import { spawn } from 'child_process';

export const setArgs = (config) => {
  let args = [];

  args = Object.entries({
    '-U': config.user,
    '-h': config.host,
    '-p': config.port,
  }).reduce((args, [key, value]) => {
    if (value) args.push(key, `${value}`);
    return args;
  }, args);

  if (config.database) args.push(config.database);
  return args;
};

export async function streamSql(
  config,
  sql = ''
) {
  const args = setArgs(config);
  return new Promise(async resolve => {
    const str = new Streamify(sql);

    const proc = spawn('psql', args, {
      env: { ...process.env, PGPASSWORD: config.password },
    });

    str.pipe(proc.stdin);
    proc.on('close', code => {
      resolve();
    });
  });
}

export async function setTemplate(
  config,
  template = process.cwd()
) {
  if (config.user !== 'postgres') {
    throw new Error('setTemplate requires postgres user');
  }
  const sql = `UPDATE pg_database SET datistemplate = TRUE, datallowconn = FALSE WHERE datname = '${template}'`;
  await streamSql(config, sql);
}
