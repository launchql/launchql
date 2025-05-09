import * as shell from 'shelljs';
import { resolve } from 'path';
import pg from 'pg';
import chalk from 'chalk';

import { listModules } from './modules';
import { extDeps } from './deps';

interface Extensions {
  resolved: string[];
  external: string[];
}

export const verify = async (
  name: string,
  database: string,
  dir: string
): Promise<Extensions> => {
  console.log(chalk.cyan(`\n🔍 Gathering modules from ${chalk.bold(dir)}...`));
  const modules = await listModules(dir);

  if (!modules[name]) {
    console.log(chalk.red(`❌ Module "${name}" not found in modules list.`));
    throw new Error(`Module "${name}" does not exist.`);
  }

  console.log(chalk.cyan(`📦 Resolving dependencies for ${chalk.bold(name)}...`));
  const extensions: Extensions = await extDeps(name, modules);

  const pgPool = new pg.Pool({
    connectionString: `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${database}`,
  });

  console.log(chalk.green(`\n🔎 Verifying deployment of ${chalk.bold(name)} on database ${chalk.bold(database)}...`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
        console.log(chalk.blue(`\n🔍 Verifying external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${query}`));
        await pgPool.query(query, [extension]);
      } else {
        const modulePath = resolve(dir, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Verifying local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch verify db:pg:${database}`));

        const cmd = shell.exec(`sqitch verify db:pg:${database}`, {
          cwd: modulePath,
          env: process.env,
        });

        if (cmd.code !== 0) {
          console.log(chalk.red(`❌ Verification failed for module ${chalk.bold(extension)}`));
          throw new Error('verify failed');
        }
      }
    } catch (e) {
      console.log(chalk.red(`\n🛑 Error during verification: ${e instanceof Error ? e.message : e}`));
      await pgPool.end();
      process.exit(1);
    }
  }

  console.log(chalk.green(`\n✅ Verification complete for ${chalk.bold(name)}.\n`));
  await pgPool.end();
  return extensions;
};
