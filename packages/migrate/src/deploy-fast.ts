// FASTER than deploy-stream
// Time:        1.056 s
import { resolve } from 'path';
import chalk from 'chalk';

import { LaunchQLOptions, PgConfig, errors } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { LaunchQLProject } from './class/launchql';
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
  verbose?: boolean;
  cache?: boolean;
}

const deployFastCache: Record<string, Awaited<ReturnType<typeof packageModule>>> = {};

const getCacheKey = (
  pg: Partial<PgConfig> | undefined,
  name: string,
  database: string
): string => {
  const { host, port, user } = pg ?? {};
  return `${host ?? 'localhost'}:${port ?? 5432}:${user ?? 'user'}:${database}:${name}`;
};


export const deployFast = async (
  options: DeployFastOptions
): Promise<Extensions> => {
  const {
    dir,
    name,
    database,
    opts,
    usePlan,
    verbose = true,
    cache = false
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

        // Cache logic
        const cacheKey = getCacheKey(opts.pg, extension, database);
        if (cache && deployFastCache[cacheKey]) {
          log(chalk.yellow(`⚡ Using cached pkg for ${chalk.bold(extension)}.`));
          await pgPool.query(deployFastCache[cacheKey].sql);
          continue;
        }
        // End Cache logic
        
        // Deploy packaged module
        const pkg = packageModule(localProject.modulePath, { usePlan, extension: false });
        
        log(chalk.magenta(`📂 Deploying local module: ${chalk.bold(extension)}`));
        log(chalk.gray(`→ Path: ${modulePath}`));
        log(chalk.gray(`→ Command: sqitch deploy db:pg:${database}`));
        log(chalk.gray(`> ${pkg.sql}`));
        
        await pgPool.query(pkg.sql);
        // END Deploy packaged module
        
        if (cache) {
          deployFastCache[cacheKey] = pkg;
        }

      }
    } catch (err) {
      error(chalk.red(`\n🛑 Deployment error: ${err instanceof Error ? err.message : err}`));
      console.error(err);
      throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
    }
  }

  log(chalk.green(`\n✅ Deployment complete for module: ${chalk.bold(name)}\n`));

  return extensions;
};
