import { PgpmMigrate } from '@pgpmjs/core';
import { parsePlanFile } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { existsSync } from 'fs';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { join } from 'path';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../../utils/database';

const log = new Logger('migrate-deps');

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  const cwd = argv.cwd || process.cwd();
  const planPath = join(cwd, 'pgpm.plan');
  
  if (!existsSync(planPath)) {
    log.error(`No pgpm.plan found in ${cwd}`);
    process.exit(1);
  }

  // Get specific change to analyze
  let changeName = argv._?.[0] || argv.change;

  const planResult = parsePlanFile(planPath);
  
  if (!planResult.data || planResult.errors.length > 0) {
    log.error('Failed to parse plan file:', planResult.errors);
    process.exit(1);
  }
  
  const plan = planResult.data;
  const allChanges = plan.changes;

  // If no change specified, prompt
  if (!changeName && !argv.all) {
    const answer = await prompter.prompt(argv, [
      {
        type: 'autocomplete',
        name: 'change',
        message: 'Which change do you want to analyze?',
        options: allChanges.map(c => ({
          name: c.name,
          value: c.name,
          description: c.dependencies.length > 0 ? `Depends on: ${c.dependencies.join(', ')}` : 'No dependencies'
        }))
      }
    ]);
    changeName = answer.change;
  }

  try {
    if (argv.all) {
      // Show dependency graph for all changes
      console.log('\n🔗 Dependency Graph\n');
      console.log(`Package: ${plan.package}`);
      console.log(`Total Changes: ${allChanges.length}\n`);

      // Build dependency tree
      const dependencyTree = buildDependencyTree(allChanges);
      
      // Show changes with no dependencies first (roots)
      const roots = allChanges.filter(c => c.dependencies.length === 0);
      console.log('📌 Root Changes (no dependencies):\n');
      roots.forEach(change => {
        console.log(`  • ${change.name}`);
        showDependents(change.name, dependencyTree, '    ');
      });

      // Show orphaned changes (have dependencies but aren't depended on)
      const orphans = allChanges.filter(c => 
        c.dependencies.length > 0 && 
        !allChanges.some(other => other.dependencies.includes(c.name))
      );
      
      if (orphans.length > 0) {
        console.log('\n🔸 Leaf Changes (not depended on by others):\n');
        orphans.forEach(change => {
          console.log(`  • ${change.name} → [${change.dependencies.join(', ')}]`);
        });
      }

    } else {
      // Show dependencies for specific change
      const change = allChanges.find(c => c.name === changeName);
      
      if (!change) {
        log.error(`Change '${changeName}' not found in plan file`);
        process.exit(1);
      }

      console.log(`\n🔍 Dependency Analysis: ${changeName}\n`);

      // Direct dependencies
      if (change.dependencies.length > 0) {
        console.log('📥 Direct Dependencies:');
        change.dependencies.forEach(dep => {
          console.log(`  • ${dep}`);
        });
      } else {
        console.log('📥 Direct Dependencies: None');
      }

      // All dependencies (recursive)
      const allDeps = getAllDependencies(change.name, allChanges);
      if (allDeps.size > 0) {
        console.log(`\n📦 All Dependencies (${allDeps.size} total):`);
        Array.from(allDeps).forEach(dep => {
          console.log(`  • ${dep}`);
        });
      }

      // Dependents (what depends on this)
      const dependents = allChanges.filter(c => c.dependencies.includes(changeName));
      if (dependents.length > 0) {
        console.log(`\n📤 Depended on by (${dependents.length} changes):`);
        dependents.forEach(dep => {
          console.log(`  • ${dep.name}`);
        });
      } else {
        console.log('\n📤 Depended on by: None');
      }

      // Check deployment status if connected to database
      const pgEnv = getPgEnvOptions();
      const targetDatabase = await getTargetDatabase(argv, prompter, {
        message: 'Select database to check deployment status'
      });
      
      const client = new PgpmMigrate({
        host: pgEnv.host,
        port: pgEnv.port,
        user: pgEnv.user,
        password: pgEnv.password,
        database: pgEnv.database
      });

      try {
        const deployedChanges = await client.getDeployedChanges(targetDatabase, plan.package);
        const deployedMap = new Map(deployedChanges.map(c => [c.change_name, c]));

        console.log('\n📊 Deployment Status:');
        
        // Check if this change is deployed
        const isDeployed = deployedMap.has(changeName);
        console.log(`  This change: ${isDeployed ? '✅ Deployed' : '⏳ Not deployed'}`);

        // Check dependencies
        const undeployedDeps = Array.from(allDeps).filter(dep => !deployedMap.has(dep));
        if (undeployedDeps.length > 0) {
          console.log(`  ⚠️  Undeployed dependencies: ${undeployedDeps.join(', ')}`);
        } else if (allDeps.size > 0) {
          console.log('  ✅ All dependencies deployed');
        }

        // Check dependents
        const deployedDependents = dependents.filter(d => deployedMap.has(d.name));
        if (deployedDependents.length > 0) {
          console.log(`  ⚠️  Deployed dependents: ${deployedDependents.map(d => d.name).join(', ')}`);
        }
      } catch (dbError) {
        // Database connection optional for dependency analysis
        log.debug('Could not connect to database for deployment status');
      }
    }

  } catch (error) {
    log.error('Failed to analyze dependencies:', error);
    process.exit(1);
  }
};

function buildDependencyTree(changes: any[]): Map<string, string[]> {
  const tree = new Map<string, string[]>();
  
  changes.forEach(change => {
    change.dependencies.forEach((dep: string) => {
      if (!tree.has(dep)) {
        tree.set(dep, []);
      }
      tree.get(dep)!.push(change.name);
    });
  });
  
  return tree;
}

function showDependents(changeName: string, tree: Map<string, string[]>, indent: string) {
  const dependents = tree.get(changeName) || [];
  dependents.forEach(dep => {
    console.log(`${indent}└─ ${dep}`);
    showDependents(dep, tree, indent + '   ');
  });
}

function getAllDependencies(changeName: string, changes: any[]): Set<string> {
  const deps = new Set<string>();
  const change = changes.find(c => c.name === changeName);
  
  if (!change) return deps;
  
  function addDeps(change: any) {
    change.dependencies.forEach((dep: string) => {
      if (!deps.has(dep)) {
        deps.add(dep);
        const depChange = changes.find(c => c.name === dep);
        if (depChange) {
          addDeps(depChange);
        }
      }
    });
  }
  
  addDeps(change);
  return deps;
}
