import { deployFast, PgpmPackage } from '@pgpmjs/core';
import { getEnvOptions } from '@pgpmjs/env';
import { getPgPool } from 'pg-cache';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

it('GraphQL query', async () => {
    const newDb = 'db-lql-'+randomUUID();
    const project = new PgpmPackage(process.env.LQL_LAUNCHQL);
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

    const pgPool = getPgPool({ ...opts.pg, database: newDb });

    // we need to query the meta schema!

    //  const builder = new QueryBuilder({
    //     introspection: result
    //   });
      

     // had ot delete this from deployFast()
     await pgPool.end();

});
