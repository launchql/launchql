import express from 'express';
import bodyParser from 'body-parser';
import * as jobs from '@launchql/job-utils';
import pgPool from './pg';
import env from './env';

const app = express();
app.use(bodyParser.json());
app.use((error, req, res, next) => {
  res.status(500).send({ error });
});

app.post('/complete', async (req, res, next) => {
  const client = await pgPool.connect();
  const jobError = req.get('X-Job-Error');
  console.log({ jobError });
  console.log(req.body);

  if (jobError === 'true') {
    console.error(
      'failed job'
      // `Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
      // { err, stack: err.stack }
    );

    try {
      const workerId = req.get('X-Worker-Id');
      const jobId = req.get('X-Job-Id');
      await jobs.fail(client, { workerId, jobId, message: req.body.error });
      res
        .set({
          'Content-Type': 'application/json'
        })
        .status(200)
        .send({ workerId, jobId });
    } catch (e) {
      next(e);
    } finally {
      client.release();
    }
  } else {
    console.error(
      'successful job'
      // `Failed task ${job.id} (${job.task_identifier}) with error ${err.message} (${duration}ms)`,
      // { err, stack: err.stack }
    );

    // console.log(
    //   `Completed task ${job.id} (${job.task_identifier}) with success (${duration}ms)`
    // );

    try {
      const workerId = req.get('X-Worker-Id');
      const jobId = req.get('X-Job-Id');
      await jobs.complete(client, { workerId, jobId });
      res
        .set({
          'Content-Type': 'application/json'
        })
        .status(200)
        .send({ workerId, jobId });
    } catch (e) {
      next(e);
    } finally {
      client.release();
    }
  }
});

export default app;
