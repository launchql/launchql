import { resolve } from 'path';

import { LaunchQLProject } from '../class/launchql';
import { errors, LaunchQLOptions } from '@launchql/types';
import { getRootPgPool, Logger } from '@launchql/server-utils';
import { revertCommand } from '@launchql/migrate';

interface Extensions {
  resolved: string[];
  external: string[];
}

const log = new Logger('revert');

export const revert = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string
): Promise<Extensions> => {
  const mod = new LaunchQLProject(dir);

  log.info(`🔍 Gathering modules from ${dir}...`);
  const modules = mod.getModuleMap();

  if (!modules[name]) {
    log.error(`❌ Module "${name}" not found in modules list.`);
    throw new Error(`Module "${name}" does not exist.`);
  }

  log.info(`📦 Resolving dependencies for ${name}...`);
  const extensions: Extensions = mod.getModuleExtensions();

  const pgPool = getRootPgPool({
    ...opts.pg,
    database
  });

  log.success(`🧹 Starting revert process on database ${database}...`);

  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `DROP EXTENSION IF EXISTS "${extension}" CASCADE;`;
        log.warn(`⚠️ Dropping external extension: ${extension}`);
        log.debug(`> ${msg}`);
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        log.info(`📂 Reverting local module: ${extension}`);
        log.debug(`→ Path: ${modulePath}`);
        log.debug(`→ Command: launchql migrate revert db:pg:${database}`);

        try {
          await revertCommand(opts.pg, database, modulePath);
        } catch (revertError) {
          log.error(`❌ Revert failed for module ${extension}`);
          throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
        }
      }
    } catch (e) {
      log.error(`🛑 Error during revert: ${e instanceof Error ? e.message : e}`);
      console.error(e); // optional raw stack trace
      throw errors.DEPLOYMENT_FAILED({ type: 'Revert', module: extension });
    }
  }

  log.success(`✅ Revert complete for ${name}.`);
  return extensions;
};
