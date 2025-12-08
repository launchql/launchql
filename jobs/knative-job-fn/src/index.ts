import express, { Request, Response } from 'express';

export interface JobContext {
  jobId: string;
  databaseId: string | null;
  workerId: string | null;
  currentUserId?: string | null;
  callbackUrl: string;
}

export type JobHandler<P = unknown, R = unknown> = (payload: P, ctx: JobContext) => Promise<R>;

export function createJobFunction(handler: JobHandler) {
  const app = express();
  app.use(express.json());

  app.post('*', async (req: Request, res: Response) => {
    const ctx: JobContext = {
      jobId: req.header('x-job-id') || '',
      databaseId: req.header('x-database-id') || null,
      workerId: req.header('x-worker-id') || null,
      currentUserId: req.header('x-current-user-id') || null,
      callbackUrl: req.header('x-callback-url') || '',
    };

    res.status(202).json({ accepted: true, jobId: ctx.jobId });

    try {
      await handler(req.body ?? {}, ctx);
      await fetch(ctx.callbackUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-worker-id': ctx.workerId || '', 'x-job-id': ctx.jobId },
        body: JSON.stringify({ status: 'success' }),
      } as any);
    } catch (e: any) {
      await fetch(ctx.callbackUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-worker-id': ctx.workerId || '', 'x-job-id': ctx.jobId },
        body: JSON.stringify({ status: 'error', error: e?.message || 'Unknown error' }),
      } as any);
    }
  });

  return app;
}

