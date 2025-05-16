import { resolve } from 'path';
import chalk from 'chalk';

import { LaunchQLOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { LaunchQLProject } from './class/launchql';
import { spawn } from 'child_process';
import { packageModule } from './package';

interface Extensions {
  resolved: string[];
  external: string[];
}

interface DeployFastOptions {
    opts: LaunchQLOptions;
    name: string;
    database: string;
    dir: string;
    usePlan: boolean;  
}

export const deployFast = async (
  options: DeployFastOptions
): Promise<Extensions> => {

  const {
    dir,
    name, 
    database,
    opts,
    usePlan
  } = options;

  const mod = new LaunchQLProject(dir);

  console.log(chalk.cyan(`\n🔍 Gathering modules from ${chalk.bold(dir)}...`));
  const modules = mod.getModuleMap();

  if (!modules[name]) {
    console.log(chalk.red(`❌ Module "${name}" not found in modules list.`));
    throw new Error(`Module "${name}" does not exist.`);
  }

  console.log(chalk.cyan(`📦 Resolving dependencies for ${chalk.bold(name)}...`));
  const extensions: Extensions = mod.getModuleExtensions();

  const pgPool = getRootPgPool({
    ...opts.pg,
    database
  });

  console.log(chalk.green(`\n🚀 Starting deployment to database ${chalk.bold(database)}...`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        console.log(chalk.blue(`\n📥 Installing external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${msg}`));
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Deploying local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch deploy db:pg:${database}`));

        const project = new LaunchQLProject(modulePath);

        const pkg = packageModule(project.modulePath, {
            usePlan,
            extension: false
        });
        console.log(chalk.gray(`> ${pkg.sql}`));
        await pgPool.query(pkg.sql);
      }
    } catch (e) {
      console.log(chalk.red(`\n🛑 Error during deployment: ${e instanceof Error ? e.message : e}`));
      await pgPool.end();
      process.exit(1);
    }
  }

  console.log(chalk.green(`\n✅ Deployment complete for ${chalk.bold(name)}.\n`));
  await pgPool.end();
  return extensions;
};
