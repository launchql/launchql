import { deployFast, LaunchQLProject } from '@launchql/migrate';
import { resolve } from 'path';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';
import { getRootPgPool } from '@launchql/server-utils';

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

        const pgPool = getRootPgPool({ ...opts.pg, database: db });
        await pgPool.end();
    
});