import Worker from './index';

const worker = new Worker({
  tasks: {
    hello: async ({ pgPool, workerId }, job) => {
      console.log('hello');
      await pgPool.query('select 1');
      console.log(JSON.stringify(job, null, 2));
    }
  }
});

worker.listen();
