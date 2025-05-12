import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { readAndParsePackageJson } from './package';
import { extractFirst, usageText } from './utils';

import deploy from './commands/deploy';
import server from './commands/server';
import explorer from './commands/explorer';
import verify from './commands/verify';
import revert from './commands/revert';
import init from './commands/init';

export const commands = async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
    if (argv.version || argv.v) {
        const pkg = readAndParsePackageJson()
        console.log(pkg.version);
        process.exit(0);
    }

    const { first: command, newArgv } = extractFirst(argv);

    if (argv.help || argv.h || command === 'help' || !command) {
        console.log(usageText);
        process.exit(0);
    }

    let { cwd } = await prompter.prompt(argv, [
        {
            type: 'text',
            name: 'cwd',
            message: 'Working directory',
            required: false,
            default: process.cwd(),
            useDefault: true
        }
    ]);

    console.log({argv});

    switch (command) {
        case 'deploy':
            await deploy(newArgv, prompter, options);
            break;
        case 'verify':
            await verify(newArgv, prompter, options);
            break;
        case 'revert':
            await revert(newArgv, prompter, options);
            break;
        case 'init':
            await init(newArgv, prompter, options);
            break;
        case 'server':
            await server(newArgv, prompter, options);
            break;
        case 'explorer':
            await explorer(newArgv, prompter, options);
            break;
        default:
            console.error(`Unknown command: ${command}`);
            console.log(usageText);
            process.exit(1);
    }

    prompter.close();
    return argv;
};