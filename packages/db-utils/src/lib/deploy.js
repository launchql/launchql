import * as shell from 'shelljs';
import { resolve } from 'path';

import { listModules } from './modules';

import { skitchPath } from './paths';
import { extDeps } from './deps';

import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PATH } from '@launchql/db-env';

const pg = require('pg');

// should we be parsing the plan file?
// currently assuming only extensions in control file...

export const deploy = async (name, database, opts) => {
  const modules = await listModules();
  const path = await skitchPath();
  if (!modules[name]) {
    throw new Error(`module ${name} does not exist!`);
  }
  const extensions = await extDeps(name);

  const pgPool = new pg.Pool({
    connectionString: `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${database}`
  });

  for (let i = 0; i < extensions.resolved.length; i++) {
    const extension = extensions.resolved[i];
    try {
      if (extensions.external.includes(extension)) {
        console.log(`CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`);
        await pgPool.query(
          `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`
        );
      } else {
        console.log(modules[extension].path);
        console.log(`sqitch deploy db:pg:${database}`);
        const cmd = shell.exec(`sqitch deploy db:pg:${database}`, {
          cwd: resolve(path, modules[extension].path),
          env: {
            PGUSER,
            PGPASSWORD,
            PGHOST,
            PGPORT,
            PATH
          }
        });
        if (cmd.code !== 0) {
          throw new Error('deploy failed');
        }
      }
    } catch (e) {
      pgPool.end();
      process.exit(1);
    }
  }
  pgPool.end();

  return extensions;
};
