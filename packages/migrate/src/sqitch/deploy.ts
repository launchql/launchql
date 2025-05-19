import { resolve } from 'path';
import chalk from 'chalk';

import { errors, getSpawnEnvWithPg, LaunchQLOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { LaunchQLProject } from '../class/launchql';
import { spawn } from 'child_process';

interface Extensions {
  resolved: string[];
  external: string[];
}

export const deploy = async (
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

  console.log(chalk.green(`\n🚀 Starting deployment to database ${chalk.bold(database)}...`));

  for (const extension of extensions.resolved) {
    try {
      if (extensions.external.includes(extension)) {
        const msg = `CREATE EXTENSION IF NOT EXISTS "${extension}" CASCADE;`;
        console.log(chalk.blue(`\n📥 Installing external extension: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`> ${msg}`));
        await pgPool.query(msg);
      } else {
        const modulePath = resolve(mod.workspacePath, modules[extension].path);
        console.log(chalk.magenta(`\n📂 Deploying local module: ${chalk.bold(extension)}`));
        console.log(chalk.gray(`→ Path: ${modulePath}`));
        console.log(chalk.gray(`→ Command: sqitch deploy db:pg:${database}`));

        const child = spawn('sqitch', ['deploy', `db:pg:${database}`], {
          cwd: modulePath,
          env: getSpawnEnvWithPg(opts.pg)
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
          console.log(chalk.red(`❌ Deployment failed for module ${chalk.bold(extension)}`));
          throw errors.DEPLOYMENT_FAILED({ module: extension });
        }

      }
    } catch (err) {
      console.log(chalk.red(`\n🛑 Error during deployment: ${err instanceof Error ? err.message : err}`));
      console.error(err);
      throw errors.DEPLOYMENT_FAILED({ module: extension });
    }
  }

  console.log(chalk.green(`\n✅ Deployment complete for ${chalk.bold(name)}.\n`));
  return extensions;
};
