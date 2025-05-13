import { CLIOptions, Inquirerer, OptionValue, Question } from 'inquirerer';
import {
    getAvailableExtensions,
    getExtensionsAndModules,
    getInstalledExtensions,
    getWorkspacePath,
    getModulePath,
    listModules,
    getExtensionInfo,
    writeExtensions
} from '@launchql/migrate';
import { ParsedArgs } from 'minimist';

export default async (
    argv: Partial<ParsedArgs>,
    prompter: Inquirerer,
    _options: CLIOptions
) => {
    const { cwd = process.cwd() } = argv;

    // TODO we need a class for this...
    const workspacePath = await getWorkspacePath(cwd);
    const modulePath = await getModulePath(cwd);
    const moduleMap = await listModules(workspacePath);
    const options = await getAvailableExtensions(moduleMap);
    const info = await getExtensionInfo(modulePath);
    const installed = await getInstalledExtensions(info.controlFile);
    const availOpts = options.filter(a=>a!==info.extname)
    const questions: Question[] = [
        {
            name: 'extensions',
            message: 'which extensions?',
            options: availOpts,
            type: 'checkbox',
            default: installed
        }
    ];
    const answers = await prompter.prompt(argv, questions);
    const extensionsRaw: OptionValue[] = answers.extensions;
    const extensions = extensionsRaw.filter(a=>a.selected).map(ex=>ex.name)

    // TODO we need a class for this...
    await writeExtensions(info.packageDir, extensions);
};