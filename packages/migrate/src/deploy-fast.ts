// FASTER than deploy-stream
// Time:        1.056 s
import { resolve } from 'path';

import { LaunchQLOptions, PgConfig, errors } from '@launchql/types';
import { getRootPgPool, Logger } from '@launchql/server-utils';
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
    cache = false
  } = options;

  const log = new Logger('deploy-fast');

  const projectRoot = new LaunchQLProject(dir);
  const modules = projectRoot.getModuleMap();

  log.info(`🔍 Gathering modules from ${dir}...`);

  if (!modules[name]) {
    log.error(`❌ Module "${name}" not found.`);
    throw new Error(`Module "${name}" does not exist.`);
  }

  log.info(`📦 Resolving dependencies for ${name}...`);
  const extensions: Extensions = projectRoot.getModuleExtensions();

  const pgPool = getRootPgPool({ ...opts.pg, database });

  log.success(`🚀 Deploying to database: ${database}`);

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        log.info(`📥 Installing external extension: ${extension}`);
        log.debug(`> ${query}`);
        await pgPool.query(query);
      } else {
        const modulePath = resolve(projectRoot.workspacePath, modules[extension].path);
        const localProject = new LaunchQLProject(modulePath);

        const cacheKey = getCacheKey(opts.pg, extension, database);
        if (cache && deployFastCache[cacheKey]) {
          log.warn(`⚡ Using cached pkg for ${extension}.`);
          await pgPool.query(deployFastCache[cacheKey].sql);
          continue;
        }

        const pkg = packageModule(localProject.modulePath, { usePlan, extension: false });

        log.info(`📂 Deploying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: sqitch deploy db:pg:${database}`);
        log.debug(`> ${pkg.sql}`);

        await pgPool.query(pkg.sql);

        if (cache) {
          deployFastCache[cacheKey] = pkg;
        }
      }
    } catch (err) {
      log.error(`🛑 Deployment error: ${err instanceof Error ? err.message : err}`);
      console.error(err); // Preserve stack trace
      throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
    }
  }

  log.success(`✅ Deployment complete for module: ${name}`);
  return extensions;
};
