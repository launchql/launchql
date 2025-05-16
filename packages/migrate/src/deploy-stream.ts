// SLOWER than deploy-fast
// Time:        1.193 s, estimated 2 s
import { resolve } from 'path';
import chalk from 'chalk';

import { LaunchQLOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { LaunchQLProject } from './class/launchql';
import { packageModule } from './package';
import { streamSql } from './stream-sql';

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
  verbose?: boolean;
}

export const deployStream = async (
  options: DeployFastOptions
): Promise<Extensions> => {
  const {
    dir,
    name,
    database,
    opts,
    usePlan,
    verbose = true
  } = options;

  const log = (...args: any[]) => verbose && console.log(...args);
  const error = (...args: any[]) => verbose && console.error(...args);

  const projectRoot = new LaunchQLProject(dir);
  const modules = projectRoot.getModuleMap();

  log(chalk.cyan(`\n🔍 Gathering modules from ${chalk.bold(dir)}...`));

  if (!modules[name]) {
    error(chalk.red(`❌ Module "${name}" not found.`));
    throw new Error(`Module "${name}" does not exist.`);
  }

  log(chalk.cyan(`📦 Resolving dependencies for ${chalk.bold(name)}...`));
  const extensions: Extensions = projectRoot.getModuleExtensions();

  const pgPool = getRootPgPool({ ...opts.pg, database });

  log(chalk.green(`\n🚀 Deploying to database: ${chalk.bold(database)}\n`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        log(chalk.blue(`📥 Installing external extension: ${chalk.bold(extension)}`));
        log(chalk.gray(`> ${query}`));
        await pgPool.query(query);
      } else {
        const modulePath = resolve(projectRoot.workspacePath, modules[extension].path);
        const localProject = new LaunchQLProject(modulePath);
        const pkg = packageModule(localProject.modulePath, { usePlan, extension: false });

        log(chalk.magenta(`📂 Deploying local module: ${chalk.bold(extension)}`));
        log(chalk.gray(`→ Path: ${modulePath}`));
        log(chalk.gray(`→ Command: sqitch deploy db:pg:${database}`));
        log(chalk.gray(`> ${pkg.sql}`));

        // await pgPool.query(pkg.sql);
        await streamSql({
            database,
            host: opts.pg.host,
            user: opts.pg.user,
            password: opts.pg.password,
            port: opts.pg.port
        }, pkg.sql)
      }
    } catch (err) {
      error(chalk.red(`\n🛑 Deployment error: ${err instanceof Error ? err.message : err}`));
      await pgPool.end();
      process.exit(1);
    }
  }

  log(chalk.green(`\n✅ Deployment complete for module: ${chalk.bold(name)}\n`));
//   await pgPool.end();

  return extensions;
};
