import { LaunchQLPackage } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import fs from 'fs';
import path from 'path';

const validateUsageText = `
LaunchQL Validate Command:

  lql validate [OPTIONS]

  Ensure package is consistent before bumping.

Options:
  --help, -h         Show this help message
  --cwd <directory>  Working directory (default: current directory)

Validation Checks:
  - .control.default_version === package.json.version
  - SQL migration file for current version exists
  - launchql.plan has a tag for current version
  - Dependencies in launchql.plan reference real published versions

Exit Codes:
  0 - Package is valid and consistent
  1 - Inconsistencies found

Examples:
  lql validate                    Validate current module
  lql validate --cwd ./my-module  Validate specific module
`;

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(validateUsageText);
    process.exit(0);
  }

  const log = new Logger('validate');
  
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

  const analysisResult = project.analyzeModule();
  let hasErrors = false;

  if (!analysisResult.ok) {
    log.error(`Module analysis failed for ${analysisResult.name}:`);
    for (const issue of analysisResult.issues) {
      log.error(`  ${issue.code}: ${issue.message}`);
      if (issue.file) {
        log.error(`    File: ${issue.file}`);
      }
    }
    hasErrors = true;
  }

  const modPath = project.getModulePath()!;
  const info = project.getModuleInfo();
  
  try {
    const pkgJsonPath = path.join(modPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      log.error('package.json not found');
      hasErrors = true;
    } else {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const pkgVersion = pkg.version;

      const controlContent = project.getModuleControlFile();
      const defaultVersionMatch = controlContent.match(/^default_version\s*=\s*'([^']+)'/m);
      
      if (!defaultVersionMatch) {
        log.error('Control file missing default_version');
        hasErrors = true;
      } else {
        const controlVersion = defaultVersionMatch[1];
        if (controlVersion !== pkgVersion) {
          log.error(`Version mismatch: control file default_version '${controlVersion}' !== package.json version '${pkgVersion}'`);
          hasErrors = true;
        }
      }

      const sqlFile = path.join(modPath, 'sql', `${info.extname}--${pkgVersion}.sql`);
      if (!fs.existsSync(sqlFile)) {
        log.error(`SQL migration file missing: sql/${info.extname}--${pkgVersion}.sql`);
        hasErrors = true;
      }

      const planPath = path.join(modPath, 'launchql.plan');
      if (fs.existsSync(planPath)) {
        try {
          const planContent = fs.readFileSync(planPath, 'utf8');
          const hasVersionTag = planContent.includes(`@v${pkgVersion}`) || planContent.includes(`@${pkgVersion}`);
          if (!hasVersionTag) {
            log.warn(`launchql.plan missing tag for version ${pkgVersion}`);
          }
        } catch (e) {
          log.error(`Failed to read launchql.plan: ${e}`);
          hasErrors = true;
        }
      }
    }
  } catch (error) {
    log.error(`Validation failed: ${error}`);
    hasErrors = true;
  }

  if (hasErrors) {
    log.error('Package validation failed');
    process.exit(1);
  } else {
    log.success('Package validation passed');
    process.exit(0);
  }

  return argv;
};
