import { deployFast, LaunchQLProject } from '@launchql/migrate';
import { getEnvOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { introspect } from 'introspectron';
import { QueryBuilder } from '@launchql/query';

it('LaunchQL', async () => {
    const newDb = 'db-lql-'+randomUUID();
    const project = new LaunchQLProject(process.env.LQL_LAUNCHQL);
    const opts = getEnvOptions({
        pg: {
            database: newDb
        }
    })
    execSync(`createdb ${opts.pg.database}`);
    await deployFast({
        opts, 
        name: 'dbs', 
        database: opts.pg.database, 
        dir: project.modulePath,
        usePlan: true,
        verbose: false
    });

    const pgPool = getRootPgPool({ ...opts.pg, database: newDb });

    const result = await introspect(pgPool, {
        schemas: ['collections_public']
     });

    //  console.log(result);

     const builder = new QueryBuilder({
        introspection: result
      });
      

     // had ot delete this from deployFast()
     await pgPool.end();

});