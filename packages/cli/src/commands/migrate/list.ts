import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { LaunchQLMigrate } from '@launchql/migrate';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { join } from 'path';
import { existsSync } from 'fs';
import { parsePlanFile, getChangesInOrder } from '@launchql/migrate';
import { getTargetDatabase } from '../../utils/database';

const log = new Logger('migrate-list');

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  const cwd = argv.cwd || process.cwd();
  const planPath = join(cwd, 'sqitch.plan');
  
  if (!existsSync(planPath)) {
    log.error(`No sqitch.plan found in ${cwd}`);
    process.exit(1);
  }

  // Get database configuration
  const pgEnv = getPgEnvOptions();
  const targetDatabase = await getTargetDatabase(argv, prompter, {
    message: 'Select database to list migrations'
  });

  const client = new LaunchQLMigrate({
    host: pgEnv.host,
    port: pgEnv.port,
    user: pgEnv.user,
    password: pgEnv.password,
    database: pgEnv.database
  });

  try {
    // Get all changes from plan file
    const plan = parsePlanFile(planPath);
    const allChanges = getChangesInOrder(planPath);
    
    // Get deployed changes from database
    const deployedChanges = await client.getDeployedChanges(targetDatabase, plan.project);

    console.log('\n📋 All Changes\n');
    console.log(`Project: ${plan.project}`);
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