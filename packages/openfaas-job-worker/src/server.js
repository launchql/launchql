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
  try {
    console.log(req.body);
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

  console.log('complete');
  console.log({
    'X-Error-Url': req.get('X-Error-Url'),
    'X-Callback-Url': req.get('X-Callback-Url'),
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
});

app.post('/error', async (req, res, next) => {
  const client = await pgPool.connect();
  try {
    console.log(req.body);
    const workerId = req.get('X-Worker-Id');
    const jobId = req.get('X-Job-Id');
    const message = req.body.message || 'Error found during job';
    await jobs.complete(client, { workerId, jobId, message });
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

  console.log('error');
  console.log({
    'X-Error-Url': req.get('X-Error-Url'),
    'X-Callback-Url': req.get('X-Callback-Url'),
    'X-Worker-Id': req.get('X-Worker-Id'),
    'X-Job-Id': req.get('X-Job-Id')
  });
});

export default app;
