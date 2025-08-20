import { LaunchQLPackage, generateControlFileContent } from '@launchql/core';
import { Logger } from '@launchql/logger';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const versionUsageText = `
LaunchQL Version Command:

  lql version [OPTIONS]

  Detect changed packages, bump versions, update dependencies, commit and tag.

Options:
  --help, -h                    Show this help message
  --filter <pattern>            Filter packages by pattern
  --bump <type>                 Bump type: patch|minor|major|prerelease|exact
  --exact <version>             Set exact version (use with --bump exact)
  --cwd <directory>             Working directory (default: current directory)
  --dry-run                     Show what would be done without making changes

Behavior:
  - Detects changed packages since last release/tag
  - Decides bump strategy from conventional commits or --bump flag
  - Updates versions in package.json files
  - Updates internal dependency ranges (respects workspace:* semantics)
  - Runs lql sync per bumped package
  - Stages and commits changes
  - Creates per-package git tags (name@version)

Examples:
  lql version                           Auto-detect changes and bump
  lql version --bump minor              Force minor version bump
  lql version --filter "my-*"           Only process packages matching pattern
  lql version --bump exact --exact 2.0.0  Set exact version
`;

type BumpType = 'patch' | 'minor' | 'major' | 'prerelease' | 'exact';

interface PackageInfo {
  name: string;
  path: string;
  currentVersion: string;
  newVersion: string;
  changed: boolean;
}

function bumpVersion(version: string, bumpType: BumpType, exactVersion?: string): string {
  if (bumpType === 'exact' && exactVersion) {
    return exactVersion;
  }

  const parts = version.split('.').map(Number);
  const [major, minor, patch] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'prerelease':
      return `${major}.${minor}.${patch + 1}-alpha.0`;
    default:
      return version;
  }
}

function updateDependencyRanges(pkgJson: any, packageUpdates: Map<string, string>): boolean {
  let updated = false;
  
  const updateDeps = (deps: Record<string, string> | undefined) => {
    if (!deps) return;
    
    for (const [depName, depVersion] of Object.entries(deps)) {
      if (packageUpdates.has(depName)) {
        const newVersion = packageUpdates.get(depName)!;
        
        if (depVersion.startsWith('workspace:')) {
          continue;
        }
        
        if (depVersion.startsWith('^')) {
          deps[depName] = `^${newVersion}`;
          updated = true;
        } else if (depVersion.startsWith('~')) {
          deps[depName] = `~${newVersion}`;
          updated = true;
        }
      }
    }
  };

  updateDeps(pkgJson.dependencies);
  updateDeps(pkgJson.devDependencies);
  updateDeps(pkgJson.peerDependencies);
  
  return updated;
}

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(versionUsageText);
    return argv;
  }

  const log = new Logger('version');
  
  let { cwd, filter, bump, exact, dryRun } = await prompter.prompt(argv, [
    {
      type: 'text',
      name: 'cwd',
      message: 'Working directory',
      required: false,
      default: process.cwd(),
      useDefault: true
    },
    {
      type: 'text',
      name: 'filter',
      message: 'Package filter pattern',
      required: false,
      when: () => !argv.filter
    },
    {
      type: 'list',
      name: 'bump',
      message: 'Bump type',
      options: ['patch', 'minor', 'major', 'prerelease', 'exact'],
      required: false,
      when: () => !argv.bump
    },
    {
      type: 'text',
      name: 'exact',
      message: 'Exact version',
      required: false,
      when: (answers) => (answers.bump || argv.bump) === 'exact' && !argv.exact
    },
    {
      type: 'confirm',
      name: 'dryRun',
      message: 'Dry run (show changes without applying)?',
      default: false,
      useDefault: true,
      when: () => typeof argv['dry-run'] === 'undefined'
    }
  ]);

  if (argv['dry-run']) dryRun = true;

  log.debug(`Using directory: ${cwd}`);

  const project = new LaunchQLPackage(cwd);
  
  if (!project.isInWorkspace()) {
    throw new Error('This command must be run from a workspace root.');
  }

  try {
    const workspacePath = project.getWorkspacePath()!;
    const moduleMap = project.getModuleMap();
    const packages: PackageInfo[] = [];
    
    for (const [moduleName, moduleInfo] of Object.entries(moduleMap)) {
      if (filter && !moduleName.includes(filter)) {
        continue;
      }
      
      const modulePath = path.join(workspacePath, moduleInfo.path);
      const pkgJsonPath = path.join(modulePath, 'package.json');
      
      if (!fs.existsSync(pkgJsonPath)) {
        log.warn(`No package.json found for module ${moduleName}`);
        continue;
      }
      
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const currentVersion = pkg.version;
      
      if (!currentVersion) {
        log.warn(`No version found in package.json for module ${moduleName}`);
        continue;
      }
      
      let changed = true;
      
      try {
        const lastTag = execSync(`git describe --tags --abbrev=0 --match="${moduleName}@*" 2>/dev/null || echo ""`, {
          cwd: workspacePath,
          encoding: 'utf8'
        }).trim();
        
        if (lastTag) {
          const commitsSince = execSync(`git rev-list --count ${lastTag}..HEAD -- ${moduleInfo.path}`, {
            cwd: workspacePath,
            encoding: 'utf8'
          }).trim();
          
          changed = parseInt(commitsSince) > 0;
        }
      } catch (error) {
        log.debug(`Could not determine changes for ${moduleName}, assuming changed`);
      }
      
      const bumpType = (bump as BumpType) || 'patch';
      const newVersion = bumpVersion(currentVersion, bumpType, exact);
      
      packages.push({
        name: moduleName,
        path: modulePath,
        currentVersion,
        newVersion,
        changed
      });
    }
    
    const changedPackages = packages.filter(pkg => pkg.changed);
    
    if (changedPackages.length === 0) {
      log.info('No packages have changed since last release');
      return argv;
    }
    
    log.info(`Found ${changedPackages.length} changed packages:`);
    for (const pkg of changedPackages) {
      log.info(`  ${pkg.name}: ${pkg.currentVersion} → ${pkg.newVersion}`);
    }
    
    if (dryRun) {
      log.info('Dry run mode - no changes will be made');
      return argv;
    }
    
    const packageUpdates = new Map<string, string>();
    for (const pkg of changedPackages) {
      packageUpdates.set(pkg.name, pkg.newVersion);
    }
    
    for (const pkg of changedPackages) {
      const pkgJsonPath = path.join(pkg.path, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      
      pkgJson.version = pkg.newVersion;
      
      updateDependencyRanges(pkgJson, packageUpdates);
      
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
      log.info(`Updated ${pkg.name} package.json to version ${pkg.newVersion}`);
      
      try {
        const moduleProject = new LaunchQLPackage(pkg.path);
        const info = moduleProject.getModuleInfo();
        const requires = moduleProject.getRequiredModules();
        
        const controlContent = generateControlFileContent({
          name: info.extname,
          version: pkg.newVersion,
          requires
        });
        
        fs.writeFileSync(info.controlFile, controlContent);
        
        const sqlDir = path.join(pkg.path, 'sql');
        if (!fs.existsSync(sqlDir)) {
          fs.mkdirSync(sqlDir, { recursive: true });
        }
        
        const sqlFile = path.join(sqlDir, `${info.extname}--${pkg.newVersion}.sql`);
        if (!fs.existsSync(sqlFile)) {
          const sqlContent = `-- ${info.extname} extension version ${pkg.newVersion}
-- This file contains the SQL commands to create the extension

-- Add your SQL commands here
`;
          fs.writeFileSync(sqlFile, sqlContent);
        }
        
        log.info(`Synced artifacts for ${pkg.name}`);
      } catch (error) {
        log.warn(`Failed to sync ${pkg.name}: ${error}`);
      }
    }
    
    const filesToAdd = [];
    for (const pkg of changedPackages) {
      filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, 'package.json')));
      filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, `${pkg.name}.control`)));
      filesToAdd.push(path.relative(workspacePath, path.join(pkg.path, 'sql', `${pkg.name}--${pkg.newVersion}.sql`)));
    }
    
    for (const file of filesToAdd) {
      try {
        execSync(`git add "${file}"`, { cwd: workspacePath });
      } catch (error) {
        log.debug(`Could not add ${file}: ${error}`);
      }
    }
    
    const commitMessage = 'chore(release): publish';
    execSync(`git commit -m "${commitMessage}"`, { cwd: workspacePath });
    log.info('Committed version updates');
    
    for (const pkg of changedPackages) {
      const tag = `${pkg.name}@${pkg.newVersion}`;
      execSync(`git tag "${tag}"`, { cwd: workspacePath });
      log.info(`Created tag: ${tag}`);
    }
    
    log.success(`Successfully versioned ${changedPackages.length} packages`);

  } catch (error) {
    log.error(`Version command failed: ${error}`);
    throw error;
  }

  return argv;
};
