import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { getExtensionInfo, getModulePath, getWorkspacePath, makePlan } from '@launchql/migrate';
import chalk from 'chalk';

export default async (
    argv: Partial<Record<string, any>>,
    prompter: Inquirerer,
    _options: CLIOptions
) => {
    const questions: Question[] = [

    ];

    let { cwd } = await prompter.prompt(argv, questions);

    if (!cwd) {
        cwd = process.cwd();
        console.log(chalk.gray(`Using current directory: ${cwd}`));
    }

    const workspacePath = await getWorkspacePath(cwd);
    const modulePath = await getModulePath(cwd);
    const info = await getExtensionInfo(modulePath);

    // apparently this is literally super dumb and simple?
    const plan = await makePlan(workspacePath, modulePath, {
        name: info.extname,
        projects: true,
        uri: info.extname
    });

    console.log(plan);

    return argv;
};
