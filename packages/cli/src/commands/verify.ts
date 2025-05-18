import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { exec } from 'shelljs';
import { listModules, verify } from '@launchql/migrate';
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
        }
    ];

    let { database, recursive, cwd } = await prompter.prompt(argv, questions);

    if (!cwd) {
        cwd = process.cwd();
        console.log(chalk.gray(`Using current directory: ${cwd}`));
    }

    if (recursive) {
        const modules = await listModules(cwd);
        const mods = Object.keys(modules);

        if (!mods.length) {
            console.log(chalk.red('No modules found to verify.'));
            prompter.close();
            process.exit(1);
        }

        const { project } = await prompter.prompt(argv, [
            {
                type: 'autocomplete',
                name: 'project',
                message: chalk.cyan('Choose a project to verify'),
                options: mods,
                required: true
            }
        ]);

        const options: LaunchQLOptions = getEnvOptions({
            pg: {
                database
            }
        });

        console.log(chalk.green(`Verifying project ${chalk.bold(project)} on database ${chalk.bold(database)}...`));
        await verify(options, project, database, cwd);
        console.log(chalk.green('Verify complete.'));
    } else {
        console.log(chalk.green(`Running ${chalk.bold(`sqitch verify db:pg:${database}`)}...`));
        exec(`sqitch verify db:pg:${database}`);
        console.log(chalk.green('Verify complete.'));
    }

    return argv;
};
