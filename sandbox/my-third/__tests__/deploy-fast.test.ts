import { deployFast, PgpmPackage } from '@pgpmjs/core';
import { resolve } from 'path';
import { getEnvOptions } from '@pgpmjs/env';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { getPgPool } from 'pg-cache';

it('LaunchQL', async () => {
    const db = 'db-'+randomUUID();
    const project = new PgpmPackage(resolve(__dirname+'/../'));
    const opts = getEnvOptions({
        pg: {
            database: db
        }
    })
    execSync(`createdb ${opts.pg.database}`);
    await deployFast({
        opts, 
        name: 'my-third', 
        database: opts.pg.database, 
        dir: project.modulePath,
        usePlan: true,
        verbose: false
    });

        const pgPool = getPgPool({ ...opts.pg, database: db });
        await pgPool.end();
    
});
