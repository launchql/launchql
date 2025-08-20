import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { errors } from '@launchql/types';
import { CLIOptions, Inquirerer, Question } from 'inquirerer';
import { extractFirst } from '../utils/argv';
import { selectPackage } from '../utils/module-utils';
import * as path from 'path';
import * as fs from 'fs';
const semver = require('semver');

const log = new Logger('version');

const versionUsageText = `
LaunchQL Version Command:

  lql version [OPTIONS]

  Bump package version and create corresponding tag.

Options:
  --help, -h              Show this help message
  --package <name>        Target specific package
  --cwd <directory>       Working directory (default: current directory)

Examples:
  lql version                                       Prompt for version bump type
  lql version --package mypackage                   Version specific package
`;

export default async (
  argv: Partial<Record<string, any>>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(versionUsageText);
    process.exit(0);
  }

  const { newArgv } = extractFirst(argv);
  
  const cwdResult = await prompter.prompt(newArgv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    }
  ]);
  const cwd = (cwdResult as any).cwd || process.cwd();

  const pkg = new LaunchQLPackage(cwd);

  let packageName: string | undefined;
  
  if (argv.package) {
    packageName = argv.package as string;
    log.info(`Using specified package: ${packageName}`);
  }
  else if (pkg.isInModule()) {
    packageName = pkg.getModuleName();
    log.info(`Using current module: ${packageName}`);
  }
  else if (pkg.isInWorkspace()) {
    packageName = await selectPackage(newArgv, prompter, cwd, 'version', log);
    if (!packageName) {
      throw new Error('No package selected. Cannot version without specifying a target package.');
    }
  } else {
    throw new Error('This command must be run inside a LaunchQL workspace or module.');
  }

  const versionAnswer = await prompter.prompt(newArgv, [
    {
      type: 'autocomplete',
      name: 'bumpType',
      message: 'Select version bump type',
      options: ['patch', 'minor', 'major'],
      required: true
    }
  ]) as any;

  const bumpType = versionAnswer.bumpType;

  try {
    if (argv.package || !pkg.isInModule()) {
      const moduleMap = pkg.getModuleMap();
      const module = moduleMap[packageName];
      if (!module) {
        throw errors.MODULE_NOT_FOUND({ name: packageName });
      }
      
      const workspacePath = pkg.getWorkspacePath()!;
      const absoluteModulePath = path.resolve(workspacePath, module.path);
      
      const originalCwd = process.cwd();
      process.chdir(absoluteModulePath);
      
      try {
        const modulePkg = new LaunchQLPackage(absoluteModulePath);
        const newVersion = await updatePackageVersion(absoluteModulePath, bumpType);
        modulePkg.addTag(`v${newVersion}`, undefined, `Version bump: ${bumpType}`);
        log.info(`Successfully bumped ${packageName} to version ${newVersion} and added tag v${newVersion}`);
      } finally {
        process.chdir(originalCwd);
      }
    } else {
      const newVersion = await updatePackageVersion(pkg.getModulePath()!, bumpType);
      pkg.addTag(`v${newVersion}`, undefined, `Version bump: ${bumpType}`);
      log.info(`Successfully bumped to version ${newVersion} and added tag v${newVersion}`);
    }
  } catch (error) {
    log.error(`Failed to version package: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
  
  return newArgv;
};

async function updatePackageVersion(modulePath: string, bumpType: 'major' | 'minor' | 'patch'): Promise<string> {
  const pkgJsonPath = path.join(modulePath, 'package.json');
  
  if (!fs.existsSync(pkgJsonPath)) {
    throw new Error(`No package.json found at module path: ${modulePath}`);
  }
  
  const pkgData = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const currentVersion = pkgData.version;
  
  if (!currentVersion) {
    throw new Error('No version field found in package.json');
  }
  
  const newVersion = semver.inc(currentVersion, bumpType);
  
  if (!newVersion) {
    throw new Error(`Failed to calculate new ${bumpType} version from ${currentVersion}`);
  }
  
  pkgData.version = newVersion;
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgData, null, 2) + '\n');
  
  return newVersion;
}
