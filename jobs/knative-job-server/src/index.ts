import express from 'express';
import bodyParser from 'body-parser';
import type { Pool, PoolClient } from 'pg';
import * as jobs from '@launchql/job-utils';
import poolManager from '@launchql/job-pg';

type JobRequestBody = {
  message?: string;
  // allow additional fields without typing everything
  [key: string]: unknown;
};

type JobRequest = {
  get(name: string): string | undefined;
  body: JobRequestBody;
  url: string;
  originalUrl: string;
};

type JobResponse = {
  set(headers: Record<string, string>): JobResponse;
  status(code: number): JobResponse;
  json(body: unknown): JobResponse;
  send(body: unknown): JobResponse;
};

type NextFn = (err?: unknown) => void;

type WithClientHandler = (
  client: PoolClient,
  req: JobRequest,
  res: JobResponse,
  next: NextFn
) => Promise<void>;

export default (pgPool: Pool = poolManager.getPool()) => {
  const app = express();
  app.use(bodyParser.json());

  const withClient =
    (cb: WithClientHandler) =>
    async (req: JobRequest, res: JobResponse, next: NextFn) => {
      const client = (await pgPool.connect()) as PoolClient;
      try {
        await cb(client as PoolClient, req, res, next);
      } catch (e) {
        next(e);
      } finally {
        client.release();
      }
    };

  const complete = withClient(async (client, req, res) => {
    const workerId = req.get('X-Worker-Id');
    const jobIdHeader = req.get('X-Job-Id');

    if (!workerId || !jobIdHeader) {
      console.log(
        'server: missing worker/job headers on completion callback',
        { workerId, jobIdHeader }
      );
      res.status(400).json({ error: 'Missing X-Worker-Id or X-Job-Id header' });
      return;
    }

    console.log(`server: Completed task ${jobIdHeader} with success`);
    await jobs.completeJob(client, { workerId, jobId: jobIdHeader });

    res
      .set({
        'Content-Type': 'application/json'
      })
      .status(200)
      .send({ workerId, jobId: jobIdHeader });
  });

  const fail = withClient(async (client, req, res) => {
    const workerId = req.get('X-Worker-Id');
    const jobIdHeader = req.get('X-Job-Id');

    if (!workerId || !jobIdHeader) {
      console.log(
        'server: missing worker/job headers on failure callback',
        { workerId, jobIdHeader }
      );
      res.status(400).json({ error: 'Missing X-Worker-Id or X-Job-Id header' });
      return;
    }

    console.log(
      `server: Failed task ${jobIdHeader} with error: \n${req.body.message}\n\n`
    );

    await jobs.failJob(client, {
      workerId,
      jobId: jobIdHeader,
      message: req.body.message
    });

    res.status(200).json({ workerId, jobId: jobIdHeader });
  });

  app.post('*', async (req: JobRequest, res: JobResponse, next: NextFn) => {
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

  app.use((error: unknown, req: JobRequest, res: JobResponse, next: NextFn) => {
    // TODO check headers for jobId and call fail?
    res.status(500).json({ error });
  });

  return app;
};
