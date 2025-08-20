import { LaunchQLPackage, generateControlFileContent } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import fs from 'fs';
import path from 'path';

const syncUsageText = `
LaunchQL Sync Command:

  lql sync [OPTIONS]

  Synchronize artifacts with the new bumped version.

Options:
  --help, -h         Show this help message
  --cwd <directory>  Working directory (default: current directory)

Behavior:
  - Reads package.json version
  - Updates PostgreSQL control file with default_version = '<version>'
  - Generates SQL migration file (sql/<extension>--<version>.sql)

Examples:
  lql sync                    Sync current module
  lql sync --cwd ./my-module  Sync specific module
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(syncUsageText);
    process.exit(0);
  }

  const log = new Logger('sync');
  
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

  log.debug(`Using directory: ${cwd}`);

  const project = new LaunchQLPackage(cwd);

  if (!project.isInModule()) {
    log.error('This command must be run inside a LaunchQL module.');
    process.exit(1);
  }

  try {
    const modPath = project.getModulePath()!;
    const info = project.getModuleInfo();
    
    const pkgJsonPath = path.join(modPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      log.error('package.json not found');
      process.exit(1);
    }

    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const version = pkg.version;

    if (!version) {
      log.error('No version found in package.json');
      process.exit(1);
    }

    log.info(`Syncing artifacts for version ${version}`);

    const controlPath = info.controlFile;
    const requires = project.getRequiredModules();
    
    const controlContent = generateControlFileContent({
      name: info.extname,
      version,
      requires
    });

    fs.writeFileSync(controlPath, controlContent);
    log.success(`Updated control file: ${path.relative(modPath, controlPath)}`);

    const sqlDir = path.join(modPath, 'sql');
    if (!fs.existsSync(sqlDir)) {
      fs.mkdirSync(sqlDir, { recursive: true });
    }

    const sqlFile = path.join(sqlDir, `${info.extname}--${version}.sql`);
    if (!fs.existsSync(sqlFile)) {
      const sqlContent = `-- ${info.extname} extension version ${version}
-- This file contains the SQL commands to create the extension

-- Add your SQL commands here
`;
      fs.writeFileSync(sqlFile, sqlContent);
      log.success(`Created SQL migration file: sql/${info.extname}--${version}.sql`);
    } else {
      log.info(`SQL migration file already exists: sql/${info.extname}--${version}.sql`);
    }

    log.success('Sync completed successfully');

  } catch (error) {
    log.error(`Sync failed: ${error}`);
    process.exit(1);
  }

  return argv;
};
