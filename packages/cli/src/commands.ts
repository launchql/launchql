import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';

import { readAndParsePackageJson } from './package';
import { extractFirst, usageText } from './utils';
import deploy from './commands/deploy';

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

    switch (command) {
        case 'deploy':
            await deploy(newArgv, prompter, options);
            break;
        default:
            console.error(`Unknown command: ${command}`);
            console.log(usageText);
            process.exit(1);
    }

    prompter.close();
    return argv;
};