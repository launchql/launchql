import { PgpmMigrate } from '@pgpmjs/core';
import { parsePlanFile } from '@pgpmjs/core';
import { Logger } from '@pgpmjs/logger';
import { existsSync } from 'fs';
import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { join } from 'path';
import { getPgEnvOptions } from 'pg-env';

import { getTargetDatabase } from '../../utils/database';

const log = new Logger('migrate-list');

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  const cwd = argv.cwd || process.cwd();
  const planPath = join(cwd, 'pgpm.plan');
  
  if (!existsSync(planPath)) {
    log.error(`No pgpm.plan found in ${cwd}`);
    process.exit(1);
  }

  // Get database configuration
  const pgEnv = getPgEnvOptions();
  const targetDatabase = await getTargetDatabase(argv, prompter, {
    message: 'Select database to list migrations'
  });

  const client = new PgpmMigrate({
    host: pgEnv.host,
    port: pgEnv.port,
    user: pgEnv.user,
    password: pgEnv.password,
    database: pgEnv.database
  });

  try {
    // Get all changes from plan file
    const planResult = parsePlanFile(planPath);
    
    if (!planResult.data || planResult.errors.length > 0) {
      log.error('Failed to parse plan file:', planResult.errors);
      process.exit(1);
    }
    
    const plan = planResult.data;
    const allChanges = plan.changes;
    
    // Get deployed changes from database
    const deployedChanges = await client.getDeployedChanges(targetDatabase, plan.package);

    console.log('\n📋 All Changes\n');
    console.log(`Package: ${plan.package}`);
    console.log(`Total Changes: ${allChanges.length}`);
    console.log(`Deployed: ${deployedChanges.length}`);
    console.log(`Pending: ${allChanges.length - deployedChanges.length}\n`);

    // Create a map for quick lookup
    const deployedMap = new Map(deployedChanges.map(c => [c.change_name, c]));

    // List all changes with their status
    const showAll = argv.all || allChanges.length <= 20;
    const changesToShow = showAll ? allChanges : allChanges.slice(0, 20);

    console.log('Status  Change Name                    Dependencies');
    console.log('------  -----------------------------  --------------------------------');

    changesToShow.forEach(change => {
      const deployed = deployedMap.get(change.name);
      const status = deployed ? '✅' : '⏳';
      const deps = change.dependencies.length > 0 ? change.dependencies.join(', ') : '-';
      const depsDisplay = deps.length > 30 ? deps.substring(0, 27) + '...' : deps;
      
      console.log(`${status}      ${change.name.padEnd(30)} ${depsDisplay}`);
    });

    if (!showAll && allChanges.length > 20) {
      console.log(`\n... and ${allChanges.length - 20} more changes. Use --all to see all changes.`);
    }

    // Show summary by status
    if (argv.summary !== false) {
      console.log('\n📊 Summary by Status:\n');
      
      const pending = allChanges.filter(c => !deployedMap.has(c.name));
      const deployed = allChanges.filter(c => deployedMap.has(c.name));
      
      console.log(`✅ Deployed: ${deployed.length}`);
      console.log(`⏳ Pending:  ${pending.length}`);
      
      // Show deployment timeline
      if (deployedChanges.length > 0) {
        const sortedDeployed = [...deployedChanges].sort((a, b) => 
          new Date(a.deployed_at).getTime() - new Date(b.deployed_at).getTime()
        );
        
        const firstDeploy = new Date(sortedDeployed[0].deployed_at);
        const lastDeploy = new Date(sortedDeployed[sortedDeployed.length - 1].deployed_at);
        
        console.log(`\n📅 Deployment Timeline:`);
        console.log(`   First: ${firstDeploy.toLocaleString()}`);
        console.log(`   Last:  ${lastDeploy.toLocaleString()}`);
      }
    }

  } catch (error) {
    log.error('Failed to list changes:', error);
    process.exit(1);
  }
};
