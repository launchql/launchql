import { deploy, LaunchQLProject } from '@launchql/migrate';
import { resolve } from 'path';
import { LaunchQLOptions, getEnvOptions } from '@launchql/types';
import { randomInt } from 'crypto';
import { execSync } from 'child_process';

it('LaunchQL', async () => {
    const project = new LaunchQLProject(resolve(__dirname+'/../'));
    console.log(project);

    const plan = project.getModulePlan();
    console.log(plan);

    const opts = getEnvOptions({
        pg: {
            database: 'db-'+randomInt(1000)
        }
    })
    execSync(`createdb ${opts.pg.database}`);
    await deploy(opts, 'my-third', opts.pg.database, project.modulePath);
});