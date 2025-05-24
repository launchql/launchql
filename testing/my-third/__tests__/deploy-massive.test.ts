import { deployFast, LaunchQLProject } from '@launchql/core';
import { getEnvOptions } from '@launchql/types';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

it('dashboard', async () => {
    const project = new LaunchQLProject(process.env.LQL_DASHBOARD);
    const opts = getEnvOptions({
        pg: {
            database: 'db-dbe-'+randomUUID()
        }
    })
    execSync(`createdb ${opts.pg.database}`);
    await deployFast({
        opts, 
        name: 'dashboard', 
        database: opts.pg.database, 
        dir: project.modulePath,
        usePlan: true,
        verbose: false
    });
});

it('LaunchQL', async () => {
    const project = new LaunchQLProject(process.env.LQL_LAUNCHQL);
    const opts = getEnvOptions({
        pg: {
            database: 'db-lql-'+randomUUID()
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
});