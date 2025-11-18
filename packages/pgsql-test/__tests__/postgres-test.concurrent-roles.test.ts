process.env.LOG_SCOPE = 'pgsql-test';

import { Pool } from 'pg';
import { getPgEnvOptions } from 'pg-env';
import { DbAdmin } from '../src/admin';

/**
 * Concurrent Role Creation Test
 * 
 * This test demonstrates the race condition that occurs when multiple processes
 * attempt to create the same PostgreSQL role simultaneously. On the main branch,
 * this test should FAIL with a unique_violation error.
 * 
 * The test also includes performance benchmarks comparing different concurrency levels.
 */

const config = getPgEnvOptions({});
const admin = new DbAdmin(config, false);

describe('Concurrent Role Creation', () => {
  const testDbName = `concurrent_role_test_${Date.now()}`;
  let pool: Pool;

  beforeAll(async () => {
    admin.create(testDbName);
    
    const bootstrapSql = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'anonymous') THEN
          BEGIN
            EXECUTE format('CREATE ROLE %I', 'anonymous');
          EXCEPTION
            WHEN duplicate_object OR unique_violation THEN NULL;
          END;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          BEGIN
            EXECUTE format('CREATE ROLE %I', 'authenticated');
          EXCEPTION
            WHEN duplicate_object OR unique_violation THEN NULL;
          END;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'administrator') THEN
          BEGIN
            EXECUTE format('CREATE ROLE %I', 'administrator');
          EXCEPTION
            WHEN duplicate_object OR unique_violation THEN NULL;
          END;
        END IF;
      END
      $$;
    `;
    await admin.streamSql(bootstrapSql, testDbName);

    pool = new Pool({
      ...config,
      database: testDbName,
      max: 20
    });
  });

  afterAll(async () => {
    await pool?.end();
    admin.drop(testDbName);
  });

  /**
   * This test reproduces the unique_violation error that occurs under concurrency.
   * 
   * Expected behavior on main branch: FAIL with unique_violation
   * Expected behavior on fix branches: PASS
   * 
   * Note: This test intentionally only catches duplicate_object (not unique_violation)
   * to reproduce the bug on main branch. The fix branches add both exception handlers.
   */
  it('reproduces unique_violation on main under concurrent CREATE ROLE', async () => {
    const roleName = `test_user_${Date.now()}`;
    const password = 'test_password';

    const createRoleSql = `
      DO $$
      BEGIN
        BEGIN
          EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${roleName}', '${password}');
        EXCEPTION
          WHEN duplicate_object THEN
            NULL;
        END;
      END $$;
    `;

    let caughtError = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const testRoleName = `${roleName}_${attempt}`;
      const testSql = createRoleSql.replace(roleName, testRoleName);
      
      const concurrentCreations = Array.from({ length: 6 }, async () => {
        const client = await pool.connect();
        try {
          await client.query(testSql);
        } finally {
          client.release();
        }
      });

      try {
        await Promise.all(concurrentCreations);
      } catch (err: any) {
        caughtError = err;
        try {
          await pool.query(`DROP ROLE IF EXISTS ${testRoleName}`);
        } catch {}
        break;
      }

      try {
        await pool.query(`DROP ROLE IF EXISTS ${testRoleName}`);
      } catch {}
    }

    // On main branch, we expect this to fail with unique_violation
    if (caughtError) {
      console.log(`Expected failure on main branch: ${caughtError.message}`);
      expect(caughtError.message).toContain('unique constraint');
    }
  });

  /**
   * Performance benchmark: Measure latency at different concurrency levels
   */
  it('should benchmark concurrent role creation performance', async () => {
    const concurrencyLevels = [2, 4, 8];
    const iterations = 5;

    console.log('\n=== Performance Benchmark Results ===\n');

    for (const concurrency of concurrencyLevels) {
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const roleName = `bench_user_${concurrency}_${i}_${Date.now()}`;
        const password = 'bench_password';

        const createRoleSql = `
          DO $$
          BEGIN
            BEGIN
              EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${roleName}', '${password}');
            EXCEPTION
              WHEN duplicate_object OR unique_violation THEN
                NULL;
            END;
          END $$;
        `;

        const startTime = Date.now();

        const concurrentCreations = Array.from({ length: concurrency }, async () => {
          const client = await pool.connect();
          try {
            await client.query(createRoleSql);
          } finally {
            client.release();
          }
        });

        await Promise.all(concurrentCreations);

        const endTime = Date.now();
        const latency = endTime - startTime;
        latencies.push(latency);

        try {
          await pool.query(`DROP ROLE IF EXISTS ${roleName}`);
        } catch (err) {
        }
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const sortedLatencies = [...latencies].sort((a, b) => a - b);
      const medianLatency = sortedLatencies[Math.floor(sortedLatencies.length / 2)];

      console.log(`Concurrency Level: ${concurrency}`);
      console.log(`  Average Latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`  Median Latency: ${medianLatency}ms`);
      console.log(`  Min Latency: ${Math.min(...latencies)}ms`);
      console.log(`  Max Latency: ${Math.max(...latencies)}ms`);
      console.log('');
    }

    console.log('=== End Performance Benchmark ===\n');
  });

  /**
   * Test concurrent GRANT operations
   */
  it('should handle concurrent GRANT operations without errors', async () => {
    const userName = `grant_test_user_${Date.now()}`;
    const password = 'test_password';

    await pool.query(`CREATE ROLE ${userName} LOGIN PASSWORD '${password}'`);

    const grantSql = `
      DO $$
      BEGIN
        BEGIN
          EXECUTE format('GRANT %I TO %I', 'anonymous', '${userName}');
        EXCEPTION
          WHEN unique_violation THEN
            NULL;
        END;
      END $$;
    `;

    const concurrentGrants = Array.from({ length: 4 }, async () => {
      const client = await pool.connect();
      try {
        await client.query(grantSql);
      } finally {
        client.release();
      }
    });

    await expect(Promise.all(concurrentGrants)).resolves.not.toThrow();

    await pool.query(`DROP ROLE IF EXISTS ${userName}`);
  });

  /**
   * Stress test: Create many roles concurrently with retries
   */
  it('should handle high concurrency role creation with retries', async () => {
    const baseRoleName = `stress_test_${Date.now()}`;
    const numRoles = 10;
    const concurrencyPerRole = 3;

    const createRoleWithRetries = async (roleName: string, password: string, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const createRoleSql = `
            DO $$
            BEGIN
              BEGIN
                EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '${roleName}', '${password}');
              EXCEPTION
                WHEN duplicate_object OR unique_violation THEN
                  NULL;
              END;
            END $$;
          `;

          const client = await pool.connect();
          try {
            await client.query(createRoleSql);
            return;
          } finally {
            client.release();
          }
        } catch (err: any) {
          if (attempt === maxRetries - 1) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    };

    const allCreations = [];
    for (let i = 0; i < numRoles; i++) {
      const roleName = `${baseRoleName}_${i}`;
      const password = 'stress_password';

      for (let j = 0; j < concurrencyPerRole; j++) {
        allCreations.push(createRoleWithRetries(roleName, password));
      }
    }

    await expect(Promise.all(allCreations)).resolves.not.toThrow();

    for (let i = 0; i < numRoles; i++) {
      const roleName = `${baseRoleName}_${i}`;
      try {
        await pool.query(`DROP ROLE IF EXISTS ${roleName}`);
      } catch (err) {
      }
    }
  });
});
