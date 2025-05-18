import { resolve } from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';

import { LaunchQLProject } from '../class/launchql';
import { getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';

interface Extensions {
  resolved: string[];
  external: string[];
}

export const revert = async (
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

  console.log(chalk.green(`\n🧹 Starting revert process on database ${chalk.bold(database)}...`));

  const reversedExtensions = [...extensions.resolved].reverse();

  for (const extension of reversedExtensions) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `DROP EXTENSION IF EXISTS "${extension}" CASCADE;`;
        console.log(chalk.yellow(`\n⚠️ Dropping external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${msg}`));
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Reverting local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch revert db:pg:${database} -y`));

        const child = spawn('sqitch', ['revert', `db:pg:${database}`, '-y'], {
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
  return extensions;
};
