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

export const revert = async (
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

  console.log(chalk.green(`\n🧹 Starting revert process on database ${chalk.bold(database)}...`));

  // Reverse the dependency list
  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `DROP EXTENSION IF EXISTS "${extension}" CASCADE;`;
        console.log(chalk.yellow(`\n⚠️ Dropping external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${msg}`));
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(dir, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Reverting local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch revert db:pg:${database} -y`));

        const cmd = shell.exec(`sqitch revert db:pg:${database} -y`, {
          cwd: modulePath,
          env: process.env,
        });

        if (cmd.code !== 0) {
          console.log(chalk.red(`❌ Revert failed for module ${chalk.bold(extension)}`));
          throw new Error('revert failed');
        }
      }
    } catch (e) {
      console.log(chalk.red(`\n🛑 Error during revert: ${e instanceof Error ? e.message : e}`));
      await pgPool.end();
      process.exit(1);
    }
  }

  console.log(chalk.green(`\n✅ Revert complete for ${chalk.bold(name)}.\n`));
  await pgPool.end();
  return extensions;
};
