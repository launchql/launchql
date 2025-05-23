import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { LaunchQLProject } from '@launchql/core';

export default async (
    argv: Partial<ParsedArgs>,
    prompter: Inquirerer,
    _options: CLIOptions
) => {
    const { cwd = process.cwd() } = argv;

    const project = new LaunchQLProject(cwd);

    if (!project.isInModule()) {
        throw new Error('You must run this command inside a LaunchQL module.');
    }

    if (argv._.length === 0) {
        throw new Error('You must provide a package name to install, e.g. `@launchql/base32`');
    }

    await project.installModules(...argv._);

};
