import { resolve } from 'path';
import { spawn } from 'child_process';
import pg from 'pg';
import chalk from 'chalk';

import { getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { LaunchQLProject } from '../class/launchql';
import { getRootPgPool } from '@launchql/server-utils';

interface Extensions {
  resolved: string[];
  external: string[];
}

export const verify = async (
  opts: LaunchQLOptions,
  name: string,
  database: string,
  dir: string
): Promise<Extensions> => {
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

  console.log(chalk.green(`\n🔎 Verifying deployment of ${chalk.bold(name)} on database ${chalk.bold(database)}...`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const query = `SELECT 1/count(*) FROM pg_available_extensions WHERE name = $1`;
        console.log(chalk.blue(`\n🔍 Verifying external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${query}`));
        await pgPool.query(query, [extension]);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Verifying local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch verify db:pg:${database}`));

        const child = spawn('sqitch', ['verify', `db:pg:${database}`], {
          cwd: modulePath,
          env: getSpawnEnvWithPg(opts.pg),
        });

        const exitCode: number = await new Promise((resolve, reject) => {
          child.stdout.setEncoding('utf-8');
          child.stderr.setEncoding('utf-8');

          child.stderr.on('data', (chunk: Buffer | string) => {
            const text = chunk.toString();
            if (/error/i.test(text)) {
              console.error(chalk.red(text));
            } else if (/warning/i.test(text)) {
              console.warn(chalk.yellow(text));
            } else {
              console.error(text);
            }
          });

          child.stdout.pipe(process.stdout);
          child.on('close', resolve);
          child.on('error', reject);
        });

        if (exitCode !== 0) {
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
  return extensions;
};
