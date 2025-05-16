import { resolve } from 'path';
import chalk from 'chalk';

import { LaunchQLOptions } from '@launchql/types';
import { getRootPgPool } from '@launchql/server-utils';
import { LaunchQLProject } from './class/launchql';
import { spawnSync } from 'child_process';

const rainbowHues = [30, 60, 120, 180, 240, 275, 300]; // no red (0)
let hueIndex = 0;

function nextRainbowColor() {
  const color = chalk.hsv(rainbowHues[hueIndex % rainbowHues.length], 100, 100);
  hueIndex++;
  return color;
}

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

        const result = spawnSync('sqitch', ['deploy', `db:pg:${database}`], {
          cwd: modulePath,
          env: {
            ...process.env
          },
          encoding: 'utf-8',
          stdio: ['inherit', 'pipe', 'pipe'] // only stdout/stderr are captured
        });

        function printLine(line: string) {
          const trimmed = line.trim();

          if (/^Adding registry tables to db:pg:/i.test(trimmed)) {
            console.log(chalk.bold.yellow(`🗂️  ${trimmed}`));
          } else if (/^Deploying changes to db:pg:/i.test(trimmed)) {
            console.log(chalk.bold.blue(`🚀 ${trimmed}`));
          } else if (/^\+\s+.*\.\.\.*\s+ok$/i.test(trimmed)) {
            // successful deploy step
            const color = nextRainbowColor();
            console.log(color(trimmed));
          } else if (/^\+\s+.*\.\.\.*\s+not ok$/i.test(trimmed)) {
            // failed deploy step
            console.log(chalk.bold.red(`${trimmed}`));
          } else if (/^-\s+.*\.\.\.*\s+ok$/i.test(trimmed)) {
            // revert step success
            console.log(chalk.bold.magenta(`${trimmed}`));
          } else if (/warning/i.test(trimmed)) {
            console.log(chalk.yellow(`⚠️  ${trimmed}`));
          } else if (trimmed.length > 0) {
            console.log(trimmed);
          }
        }

        // Print stdout
        if (result.stdout) {
          for (const line of result.stdout.split('\n')) {
            printLine(line);
          }
        }

        // Print all stderr lines
        if (result.stderr) {
          for (const line of result.stderr.split('\n')) {
            if (/error/i.test(line)) {
              console.log(chalk.red(`❌ ${line}`));
            } else {
              console.log(chalk.gray(line));
            }
          }
        }

        if (result.status !== 0) {
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
