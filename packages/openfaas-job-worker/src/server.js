import express from 'express';
import bodyParser from 'body-parser';
import * as jobs from '@launchql/job-utils';
import pgPool from './pg';

const app = express();
app.use(bodyParser.json());
app.use((error, req, res, next) => {
  res.status(500).send({ error });
});

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
  const jobName = req.get('X-Function-Name');
  const workerId = req.get('X-Worker-Id');
  const jobId = req.get('X-Job-Id');
  console.log(`Completed task ${jobId} (${jobName}) with success`);
  await jobs.complete(client, { workerId, jobId });
  res
    .set({
      'Content-Type': 'application/json'
    })
    .status(200)
    .send({ workerId, jobId });
});

const fail = withClient(async (client, req, res) => {
  const jobName = req.get('X-Function-Name');
  const workerId = req.get('X-Worker-Id');
  const jobId = req.get('X-Job-Id');
  console.log(
    `Failed task ${jobId} (${jobName}) with error: \n${req.body.message}\n\n`
  );
  await jobs.fail(client, { workerId, jobId, message: req.body.message });
  res
    .set({
      'Content-Type': 'application/json'
    })
    .status(200)
    .send({ workerId, jobId });
});

app.post('*', async (req, res, next) => {
  const jobId = req.get('X-Job-Id');

  if (typeof jobId === 'undefined') {
    console.log('undefined JOB, what is this? healthcheck?');
    console.log(req.url);
    console.log(req.originalUrl);
    return res
      .set({
        'Content-Type': 'application/json'
      })
      .status(200)
      .send('OK');
  }

  if (req.get('X-Job-Error') === 'true') {
    await fail(req, res, next);
  } else {
    await complete(req, res, next);
  }
});

export default app;
