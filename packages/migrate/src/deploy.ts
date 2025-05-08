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

export const deploy = async (
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

  console.log(chalk.green(`\n🚀 Starting deployment to database ${chalk.bold(database)}...`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        console.log(chalk.blue(`\n📥 Installing external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${msg}`));
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(dir, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Deploying local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch deploy db:pg:${database}`));

        const cmd = shell.exec(`sqitch deploy db:pg:${database}`, {
          cwd: modulePath,
          env: process.env,
        });

        if (cmd.code !== 0) {
          console.log(chalk.red(`❌ Deployment failed for module ${chalk.bold(extension)}`));
          throw new Error('deploy failed');
        }
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
