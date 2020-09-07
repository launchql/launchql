import express from 'express';
import bodyParser from 'body-parser';
import * as jobs from '@launchql/job-utils';
import poolManager from '@launchql/job-pg';

export default (pgPool = poolManager.getPool()) => {
  const app = express();
  app.use(bodyParser.json());

  const withClient = (cb) => async (req, res, next) => {
    const client = await pgPool.connect();
    try {
      await cb(client, req, res, next);
    } catch (e) {
      next(e);
    } finally {
      client.release();
    }
  };

  const complete = withClient(async (client, req, res) => {
    const workerId = req.get('X-Worker-Id');
    const jobId = req.get('X-Job-Id');
    console.log(`server: Completed task ${jobId} with success`);
    await jobs.completeJob(client, { workerId, jobId });
    res
      .set({
        'Content-Type': 'application/json'
      })
      .status(200)
      .send({ workerId, jobId });
  });

  const fail = withClient(async (client, req, res) => {
    const workerId = req.get('X-Worker-Id');
    const jobId = req.get('X-Job-Id');
    console.log(
      `server: Failed task ${jobId} with error: \n${req.body.message}\n\n`
    );
    await jobs.failJob(client, { workerId, jobId, message: req.body.message });
    res.status(200).json({ workerId, jobId });
  });

  app.post('*', async (req, res, next) => {
    const jobId = req.get('X-Job-Id');

    if (typeof jobId === 'undefined') {
      console.log('server: undefined JOB, what is this? healthcheck?');
      console.log(req.url);
      console.log(req.originalUrl);
      return res.status(200).json('OK');
    }

    if (req.get('X-Job-Error') === 'true') {
      await fail(req, res, next);
    } else {
      await complete(req, res, next);
    }
  });

  app.use((error, req, res, next) => {
    // TODO check headers for jobId and call fail?
    res.status(500).json({ error });
  });

  return app;
};
