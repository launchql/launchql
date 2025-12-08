import express, { Express, Request, Response } from 'express';
import { getPgPool } from 'pg-cache';
import { getJobPgConfig, getJobsCallbackPort } from '@launchql/job-utils';
import { completeJob, failJob } from '@launchql/core';

export function createCallbackServer(): Express {
  const app = express();
  app.use(express.json());

  app.post('/callback', async (req: Request, res: Response) => {
    const workerId = (req.header('x-worker-id') || '').trim();
    const jobId = req.header('x-job-id');
    const status = String(req.body?.status || '').toLowerCase();
    const errorMsg = req.body?.error || req.header('x-job-error');

    if (!workerId || !jobId) {
      return res.status(400).json({ error: 'Missing x-worker-id or x-job-id' });
    }

    const pool = getPgPool(getJobPgConfig());
    try {
      if (status === 'error' || errorMsg === 'true') {
        await failJob(pool as any, { workerId, jobId, message: req.body?.error || 'ERROR' });
      } else {
        await completeJob(pool as any, { workerId, jobId });
      }
      return res.status(204).end();
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Unknown error' });
    }
  });

  app.get('/healthz', (_req, res) => res.status(200).send('OK'));

  return app;
}

export function run() {
  const app = createCallbackServer();
  const port = getJobsCallbackPort();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`job-callback listening on ${port}`);
  });
}

