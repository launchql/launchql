import { deploy, PgpmPackage } from '@pgpmjs/core';
import { resolve } from 'path';
import { getEnvOptions } from '@pgpmjs/env';
import { randomUUID } from 'crypto';
import { execSync } from 'child_process';

it('LaunchQL', async () => {
    const project = new PgpmPackage(resolve(__dirname+'/../'));
    console.log(project);

    const plan = project.getModulePlan();
    console.log(plan);

    const opts = getEnvOptions({
        pg: {
            database: 'db-'+randomUUID()
        }
    })
    execSync(`createdb ${opts.pg.database}`);
    await deploy(opts, 'my-third', opts.pg.database, project.modulePath);
});
