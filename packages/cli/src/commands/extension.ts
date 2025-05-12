import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import {
    getAvailableExtensions,
    getExtensionsAndModules,
    getInstalledExtensions,
    getWorkspacePath,
    getModulePath,
    listModules,
    getExtensionInfo
} from '@launchql/migrate';
import { ParsedArgs } from 'minimist';

export default async (
    argv: Partial<ParsedArgs>,
    prompter: Inquirerer,
    _options: CLIOptions
) => {
    const { cwd = process.cwd() } = argv;

    const workspacePath = await getWorkspacePath(cwd);
    const modulePath = await getModulePath(cwd);
    const moduleMap = await listModules(workspacePath);
    const options = await getAvailableExtensions(moduleMap);
    const info = await getExtensionInfo(modulePath);
    const installed = await getInstalledExtensions(info.controlFile);

    console.log(JSON.stringify({installed}, null, 2));
    console.log(JSON.stringify({moduleMap}, null, 2));

    const questions: Question[] = [
        {
            name: 'extensions',
            message: 'which extensions?',
            options,
            type: 'checkbox',
            // default: installed,
            required: true
        }
    ];
    // const answers = await prompter.prompt(argv, questions);

    //   await writeExtensions(extensions);


};