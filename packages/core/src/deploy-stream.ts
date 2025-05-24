import { resolve } from 'path';

import { errors, LaunchQLOptions } from '@launchql/types';
import { getRootPgPool, Logger } from '@launchql/server-utils';
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
}

export const deployStream = async (
  options: DeployFastOptions
): Promise<Extensions> => {
  const {
    dir,
    name,
    database,
    opts,
    usePlan
  } = options;

  const log = new Logger('deploy-stream');

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
        const pkg = packageModule(localProject.modulePath, { usePlan, extension: false });

        log.info(`📂 Deploying local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: sqitch deploy db:pg:${database}`);
        log.debug(`> ${pkg.sql}`);

        await streamSql({
          database,
          host: opts.pg.host,
          user: opts.pg.user,
          password: opts.pg.password,
          port: opts.pg.port
        }, pkg.sql);
      }
    } catch (err) {
      log.error(`🛑 Deployment error: ${err instanceof Error ? err.message : err}`);
      console.error(err); // keep stack trace
      throw errors.DEPLOYMENT_FAILED({ type: 'Deployment', module: extension });
    }
  }

  log.success(`✅ Deployment complete for module: ${name}`);
  return extensions;
};
