import { CLIOptions, Inquirerer } from 'inquirerer';
import { ParsedArgs } from 'minimist';
import { LaunchQLMigrate } from '@launchql/migrate';
import { getPgEnvOptions } from 'pg-env';
import { Logger } from '@launchql/logger';
import { join } from 'path';
import { existsSync } from 'fs';
import { parsePlanFile } from '@launchql/sqitch-parser';
import { getTargetDatabase } from '../../utils/database';
const log = new Logger('migrate-status');

export default async (argv: Partial<ParsedArgs>, prompter: Inquirerer, options: CLIOptions) => {
  const cwd = argv.cwd || process.cwd();
  const planPath = join(cwd, 'launchql.plan');
  
  if (!existsSync(planPath)) {
    log.error(`No launchql.plan found in ${cwd}`);
    process.exit(1);
  }

  // Get database configuration
  const pgEnv = getPgEnvOptions();
  const targetDatabase = await getTargetDatabase(argv, prompter, {
    message: 'Select database to check migration status'
  });

  const client = new LaunchQLMigrate({
    host: pgEnv.host,
    port: pgEnv.port,
    user: pgEnv.user,
    password: pgEnv.password,
    database: pgEnv.database
  });

  try {
    // Parse plan file to get project name
    const planResult = parsePlanFile(planPath);
    
    if (!planResult.data || planResult.errors.length > 0) {
      log.error('Failed to parse plan file:', planResult.errors);
      process.exit(1);
    }
    
    const plan = planResult.data;
    
    // Switch to target database
    const targetClient = new LaunchQLMigrate({
      host: pgEnv.host,
      port: pgEnv.port,
      user: pgEnv.user,
      password: pgEnv.password,
      database: targetDatabase
    });
    
    const statusResults = await targetClient.status(plan.project);
    
    console.log('\n📊 Migration Status\n');
    console.log(`Database: ${targetDatabase}`);
    
    if (statusResults.length > 0) {
      const status = statusResults[0];
      console.log(`Project: ${status.project}`);
      console.log(`Total Deployed: ${status.totalDeployed}`);
      
      if (status.lastChange) {
        console.log(`Last Change: ${status.lastChange}`);
        console.log(`Last Deployed: ${status.lastDeployed.toLocaleString()}`);
      } else {
        console.log('No changes deployed yet');
      }
    } else {
      console.log(`Project: ${plan.project}`);
      console.log('No deployment history found');
    }

    // Show recent changes
    const recentChanges = await targetClient.getRecentChanges(targetDatabase, 5);
    if (recentChanges.length > 0) {
      console.log('\n📋 Recent Changes:\n');
      recentChanges.forEach((change: any) => {
        const status = change.deployed_at ? '✅' : '⏳';
        const date = change.deployed_at ? new Date(change.deployed_at).toLocaleString() : 'Not deployed';
        console.log(`${status} ${change.change_name.padEnd(30)} ${date}`);
      });
    }

    // Show pending changes
    const pendingChanges = await targetClient.getPendingChanges(planPath, targetDatabase);
    if (pendingChanges.length > 0) {
      console.log(`\n⏳ Pending Changes: ${pendingChanges.length}\n`);
      pendingChanges.slice(0, 5).forEach((change: string) => {
        console.log(`   - ${change}`);
      });
      if (pendingChanges.length > 5) {
        console.log(`   ... and ${pendingChanges.length - 5} more`);
      }
    } else {
      console.log('\n✅ All changes deployed');
    }

  } catch (error) {
    log.error('Failed to get migration status:', error);
    process.exit(1);
  }
};