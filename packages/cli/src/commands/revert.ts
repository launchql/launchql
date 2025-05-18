import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { exec } from 'shelljs';
import { listModules, revert } from '@launchql/migrate';
import chalk from 'chalk';
import { getEnvOptions, LaunchQLOptions } from '@launchql/types';

export default async (
    argv: Partial<Record<string, any>>,
    prompter: Inquirerer,
    _options: CLIOptions
) => {
    const questions: Question[] = [
        {
            name: 'database',
            message: chalk.cyan('Database name'),
            type: 'text',
            required: true
        },
        {
            name: 'yes',
            type: 'confirm',
            message: chalk.yellow('Are you sure you want to proceed?'),
            required: true
        }
    ];

    let { database, yes, recursive, cwd } = await prompter.prompt(argv, questions);

    if (!yes) {
        console.log(chalk.gray('Operation cancelled.'));
        return;
    }

    if (!cwd) {
        cwd = process.cwd();
        console.log(chalk.gray(`Using current directory: ${cwd}`));
    }

    if (recursive) {
        const modules = await listModules(cwd);
        const mods = Object.keys(modules);

        if (!mods.length) {
            console.log(chalk.red('No modules found to revert.'));
            prompter.close();
            process.exit(1);
        }

        const { project } = await prompter.prompt(argv, [
            {
                type: 'autocomplete',
                name: 'project',
                message: chalk.cyan('Choose a project to revert'),
                options: mods,
                required: true
            }
        ]);

        console.log(chalk.green(`Reverting project ${chalk.bold(project)} on database ${chalk.bold(database)}...`));
        const options: LaunchQLOptions = getEnvOptions({
            pg: {
                database
            }
        });

        await revert(options, project, database, cwd);
        console.log(chalk.green('Revert complete.'));
    } else {
        console.log(chalk.green(`Running ${chalk.bold(`sqitch revert db:pg:${database} -y`)}...`));
        exec(`sqitch revert db:pg:${database} -y`);
        console.log(chalk.green('Revert complete.'));
    }

    return argv;
};
