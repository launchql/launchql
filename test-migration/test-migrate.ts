import { LaunchQLMigrate } from '@launchql/migrate';
import { deployCommand, revertCommand, verifyCommand } from '@launchql/migrate';
import { Logger } from '@launchql/server-utils';

const log = new Logger('test-migrate');

async function testMigration() {
  const config = {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'test_migrate'
  };

  const cwd = process.cwd();
  
  log.info('Testing LaunchQL Migration System');
  log.info(`Working directory: ${cwd}`);
  log.info(`Database: ${config.database}`);
  
  try {
    // Test 1: Initialize migration schema
    log.info('\n=== Test 1: Initialize migration schema ===');
    const client = new LaunchQLMigrate(config);
    await client.initialize();
    log.success('Migration schema initialized');
    
    // Test 2: Deploy changes
    log.info('\n=== Test 2: Deploy changes ===');
    await deployCommand(config, config.database, cwd);
    log.success('Changes deployed');
    
    // Test 3: Verify deployment
    log.info('\n=== Test 3: Verify deployment ===');
    await verifyCommand(config, config.database, cwd);
    log.success('Deployment verified');
    
    // Test 4: Get status
    log.info('\n=== Test 4: Get status ===');
    const status = await client.status();
    log.info('Status:', JSON.stringify(status, null, 2));
    
    // Test 5: Revert one change
    log.info('\n=== Test 5: Revert one change ===');
    await revertCommand(config, config.database, cwd, { toChange: 'users' });
    log.success('Reverted to users');
    
    // Test 6: Re-deploy
    log.info('\n=== Test 6: Re-deploy ===');
    await deployCommand(config, config.database, cwd);
    log.success('Re-deployed');
    
    // Test 7: Revert all
    log.info('\n=== Test 7: Revert all ===');
    await revertCommand(config, config.database, cwd);
    log.success('All changes reverted');
    
    await client.close();
    log.success('\n✅ All tests passed!');
    
  } catch (error) {
    log.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testMigration().catch(console.error);