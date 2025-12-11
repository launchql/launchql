import Worker, { WorkerContext, JobRow } from './index';

const worker = new Worker({
  tasks: {
    hello: async (
      { pgPool, workerId }: WorkerContext,
      job: JobRow
    ) => {
      console.log('hello');
      await pgPool.query('select 1');
      console.log(JSON.stringify(job, null, 2));
    }
  }
});

worker.listen();
