import { getJob, failJob, completeJob } from '../../src/db';

class MockPool {
  public last: { text: string; values: any[] } | null = null;
  async query(text: string, values?: any[]) {
    this.last = { text, values: values ?? [] };
    return { rows: [null] } as any;
  }
}

describe('@launchql/jobs-core db helpers', () => {
  it('builds get_job SQL with array param', async () => {
    const pool = new MockPool();
    await getJob((pool as any), {
      workerId: 'worker-1',
      supportedTaskNames: ['a', 'b'],
      schema: 'app_jobs',
    });
    expect(pool.last?.text).toMatch(/SELECT \* FROM "app_jobs"\."get_job"\(\$1, \$2::text\[\]\);/);
    expect(pool.last?.values).toEqual(['worker-1', ['a', 'b']]);
  });

  it('builds get_job SQL with NULL array when supportAny', async () => {
    const pool = new MockPool();
    await getJob((pool as any), {
      workerId: 'worker-2',
      supportedTaskNames: null,
    });
    expect(pool.last?.text).toMatch(/get_job\(\$1, \$2::text\[\]\);/);
    expect(pool.last?.values).toEqual(['worker-2', null]);
  });

  it('builds fail_job and complete_job SQL', async () => {
    const pool = new MockPool();
    await failJob((pool as any), { workerId: 'w', jobId: 1, message: 'oops', schema: 'app_jobs' });
    expect(pool.last?.text).toContain('"app_jobs"."fail_job"($1, $2, $3)');
    expect(pool.last?.values).toEqual(['w', 1, 'oops']);

    await completeJob((pool as any), { workerId: 'w', jobId: 2, schema: 'app_jobs' });
    expect(pool.last?.text).toContain('"app_jobs"."complete_job"($1, $2)');
    expect(pool.last?.values).toEqual(['w', 2]);
  });
});

