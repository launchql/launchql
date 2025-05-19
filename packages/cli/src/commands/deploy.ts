import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { exec } from 'shelljs';
import chalk from 'chalk';
import { errors, getEnvOptions, LaunchQLOptions } from '@launchql/types';
import { listModules, deploy } from '@launchql/migrate';

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  const questions: Question[] = [
    {
      type: 'text',
      name: 'database',
      message: chalk.cyan('Database name'),
      required: true
    },
    {
      name: 'yes',
      type: 'confirm',
      message: chalk.yellow('Are you sure you want to proceed?'),
      required: true
    }
  ];

  let { database, yes, recursive, createdb, cwd } = await prompter.prompt(argv, questions);

  if (!yes) {
    console.log(chalk.gray('Operation cancelled.'));
    return;
  }

  if (!cwd) {
    cwd = process.cwd();
    console.log(chalk.gray(`Using current directory: ${cwd}`));
  }

  if (createdb) {
    console.log(chalk.blue(`Creating database ${chalk.bold(database)}...`));
    exec(`createdb ${database}`);
  }

  if (recursive) {
    const modules = await listModules(cwd);
    const mods = Object.keys(modules);

    if (!mods.length) {
      console.log(chalk.red('No modules found in the specified directory.'));
      prompter.close();
      throw errors.NOT_FOUND({}, 'No modules found in the specified directory.');
    }

    const { project } = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'project',
        message: chalk.cyan('Choose a project to deploy'),
        options: mods,
        required: true
      }
    ]);
    
    console.log(chalk.green(`Deploying project ${chalk.bold(project)} to database ${chalk.bold(database)}...`));
    const options: LaunchQLOptions = getEnvOptions({
      pg: {
        database
      }
    });
    await deploy(options, project, database, cwd);
    console.log(chalk.green('Deployment complete.'));
  } else {
    console.log(chalk.green(`Running ${chalk.bold(`sqitch deploy db:pg:${database}`)}...`));
    exec(`sqitch deploy db:pg:${database}`);
    console.log(chalk.green('Deployment complete.'));
  }

  return argv;
};
