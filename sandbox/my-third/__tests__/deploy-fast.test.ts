import { deployFast, LaunchQLProject } from '@launchql/core';
import { resolve } from 'path';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { getPgPool } from 'pg-cache';

it('LaunchQL', async () => {
    const db = 'db-'+randomUUID();
    const project = new LaunchQLProject(resolve(__dirname+'/../'));
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