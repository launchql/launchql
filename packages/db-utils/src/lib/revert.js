import * as shell from 'shelljs';
import { resolve } from 'path';

import { listModules, getExtensionsAndModules } from './modules';

import { skitchPath } from './paths';
import { extDeps } from './deps';

import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PATH } from '@launchql/db-env';

const pg = require('pg');

// should we be parsing the plan file?
// currently assuming only extensions in control file...

export const revert = async (name, database, opts) => {
  const modules = await listModules();
  const path = await skitchPath();
  if (!modules[name]) {
    throw new Error(`module ${name} does not exist!`);
  }
  const extensions = await extDeps(name);

  const pgPool = new pg.Pool({
    connectionString: `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${database}`
  });

  // just reverse it
  extensions.resolved = extensions.resolved.reverse();

  for (let i = 0; i < extensions.resolved.length; i++) {
    const extension = extensions.resolved[i];
    try {
      if (extensions.external.includes(extension)) {
        console.log(`DROP EXTENSION IF EXISTS "${extension}" CASCADE;`);
        await pgPool.query(
          `DROP EXTENSION IF EXISTS "${extension}" CASCADE;`
        );
      } else {
        console.log(modules[extension].path);
        console.log(`sqitch revert db:pg:${database} -y`);
        shell.exec(`sqitch revert db:pg:${database} -y`, {
          cwd: resolve(path, modules[extension].path),
          env: {
            PGUSER,
            PGPASSWORD,
            PGHOST,
            PGPORT,
            PATH
          }
        });
      }
    } catch (e) {
      console.error(e);
      break;
    }
  }
  pgPool.end();

  return extensions;
};
