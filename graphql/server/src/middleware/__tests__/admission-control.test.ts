import type { RequestProtection } from '@constructive-io/express-context';
import { DEFAULT_REQUEST_PROTECTION, RefusalRecorder } from '@constructive-io/express-context';
import { EventEmitter } from 'events';
import type { NextFunction, Request, Response } from 'express';

import { installRefusalRecorder } from '../../refusals/recorder';
import { createAdmissionControlMiddleware } from '../admission-control';

const protection = (overrides: Partial<RequestProtection>): RequestProtection => ({
  ...DEFAULT_REQUEST_PROTECTION,
  ...overrides
});

interface Captured {
  status?: number;
  headers: Record<string, string>;
  body?: any;
}

/** A response that records what was sent and can emit `finish`/`close`. */
class FakeResponse extends EventEmitter {
  captured: Captured = { headers: {} };

  status(code: number): this {
    this.captured.status = code;
    return this;
  }

  set(headers: Record<string, string>): this {
    Object.assign(this.captured.headers, headers);
    return this;
  }

  json(body: unknown): this {
    this.captured.body = body;
    this.emit('finish');
    return this;
  }

  asResponse(): Response {
    return this as unknown as Response;
  }
}

interface FakeReqInit {
  databaseId?: string;
  protection?: RequestProtection;
  ip?: string;
  forwardedFor?: string;
  path?: string;
  trustProxy?: boolean;
}

const fakeReq = (init: FakeReqInit = {}): Request =>
  ({
    method: 'POST',
    baseUrl: '',
    path: init.path ?? '/graphql',
    databaseId: init.databaseId ?? 'db-1',
    requestProtection: init.protection,
    headers: init.forwardedFor ? { 'x-forwarded-for': init.forwardedFor } : {},
    socket: { remoteAddress: init.ip ?? '10.0.0.1' },
    app: { get: (key: string) => (key === 'trust proxy' ? init.trustProxy : undefined) }
  }) as unknown as Request;

/** Send one request through the middleware, resolving when it settles. */
const send = (
  middleware: ReturnType<typeof createAdmissionControlMiddleware>,
  req: Request
): { res: FakeResponse; next: jest.Mock; done: Promise<void> } => {
  const res = new FakeResponse();
  const next = jest.fn();
  const done = middleware(req, res.asResponse(), next as unknown as NextFunction) as Promise<void>;
  return { res, next, done };
};

describe('createAdmissionControlMiddleware', () => {
  it('admits a request under both bounds', async () => {
    const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
    const { next, res, done } = send(middleware, fakeReq());
    await done;

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.captured.status).toBeUndefined();
  });

  it('falls back to platform defaults when protection did not resolve', async () => {
    const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
    const { next, done } = send(middleware, fakeReq({ protection: undefined }));
    await done;

    expect(next).toHaveBeenCalledTimes(1);
  });

  describe('per-caller rate', () => {
    it('refuses the caller past rateLimitRpm + rateLimitBurst with a 429', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 1 });

      for (let i = 0; i < 2; i++) {
        const admitted = send(middleware, fakeReq({ protection: bounds }));
        await admitted.done;
        admitted.res.emit('finish');
        expect(admitted.next).toHaveBeenCalledTimes(1);
      }

      const { res, next, done } = send(middleware, fakeReq({ protection: bounds }));
      await done;

      expect(next).not.toHaveBeenCalled();
      expect(res.captured.status).toBe(429);
      expect(res.captured.headers['Retry-After']).toBeDefined();
      expect(res.captured.body.errors[0].extensions.code).toBe('RATE_LIMITED');
    });

    it('does not spend one caller\u2019s budget on another', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 0 });

      const first = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await first.done;
      first.res.emit('finish');

      const refused = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await refused.done;
      expect(refused.res.captured.status).toBe(429);

      const other = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await other.done;
      expect(other.next).toHaveBeenCalledTimes(1);
    });

    it('keys separate routes separately', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 0 });

      const graphql = send(middleware, fakeReq({ protection: bounds, path: '/graphql' }));
      await graphql.done;
      graphql.res.emit('finish');

      const fn = send(middleware, fakeReq({ protection: bounds, path: '/fn/hello' }));
      await fn.done;
      expect(fn.next).toHaveBeenCalledTimes(1);
    });

    it('cannot be evaded with a forged X-Forwarded-For', async () => {
      // One trusted hop: our ingress appended 203.0.113.7, and the caller's own
      // leftmost entry changes every request.
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 1 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 0 });

      const first = send(
        middleware,
        fakeReq({ protection: bounds, forwardedFor: '9.9.9.9, 203.0.113.7' })
      );
      await first.done;
      first.res.emit('finish');
      expect(first.next).toHaveBeenCalledTimes(1);

      const forged = send(
        middleware,
        fakeReq({ protection: bounds, forwardedFor: '8.8.8.8, 203.0.113.7' })
      );
      await forged.done;
      expect(forged.next).not.toHaveBeenCalled();
      expect(forged.res.captured.status).toBe(429);
    });

    it('trusts one hop when Express is configured to trust a proxy', async () => {
      const middleware = createAdmissionControlMiddleware();
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 0 });

      const first = send(
        middleware,
        fakeReq({ protection: bounds, trustProxy: true, forwardedFor: '9.9.9.9, 203.0.113.7' })
      );
      await first.done;
      first.res.emit('finish');

      const second = send(
        middleware,
        fakeReq({ protection: bounds, trustProxy: true, forwardedFor: '7.7.7.7, 203.0.113.7' })
      );
      await second.done;
      expect(second.res.captured.status).toBe(429);
    });
  });

  describe('per-database concurrency', () => {
    it('refuses with a 429 once the width bound is reached and waiting is off', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 0 });

      const held = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await held.done;
      expect(held.next).toHaveBeenCalledTimes(1);

      const refused = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await refused.done;

      expect(refused.next).not.toHaveBeenCalled();
      expect(refused.res.captured.status).toBe(429);
      expect(refused.res.captured.headers['Retry-After']).toBe('1');
      expect(refused.res.captured.body.errors[0].extensions.code).toBe('CONCURRENCY_LIMIT_REACHED');
    });

    it('admits a queued request when the in-flight one finishes', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 1_000 });

      const held = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await held.done;

      const queued = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await Promise.resolve();
      expect(queued.next).not.toHaveBeenCalled();

      held.res.emit('finish');
      await queued.done;
      expect(queued.next).toHaveBeenCalledTimes(1);
      expect(queued.res.captured.status).toBeUndefined();
    });

    it('releases the slot when the client hangs up mid-flight', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 0 });

      const aborted = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await aborted.done;
      aborted.res.emit('close');

      const next = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await next.done;
      expect(next.next).toHaveBeenCalledTimes(1);
    });

    it('does not leak the slot when the client hangs up while queued', async () => {
      const middleware = createAdmissionControlMiddleware();
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 1_000 });

      const held = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await held.done;

      const queued = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await Promise.resolve();
      expect(queued.next).not.toHaveBeenCalled();

      // The queued client gives up before a slot comes free.
      queued.res.emit('close');
      held.res.emit('finish');
      await queued.done;

      // Nobody is there to handle the request, so it must not start...
      expect(queued.next).not.toHaveBeenCalled();
      expect(queued.res.captured.status).toBeUndefined();

      // ...and the slot it would have been handed is free for the next caller.
      const next = send(
        middleware,
        fakeReq({ protection: protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 0 }), ip: '10.0.0.3' })
      );
      await next.done;
      expect(next.next).toHaveBeenCalledTimes(1);
      expect(next.res.captured.status).toBeUndefined();
    });

    it('refuses a request that waited out maxQueueWaitMs', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 20 });

      const held = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await held.done;

      const timedOut = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await timedOut.done;

      expect(timedOut.next).not.toHaveBeenCalled();
      expect(timedOut.res.captured.status).toBe(429);
      expect(timedOut.res.captured.body.errors[0].extensions.context).toMatchObject({
        limit: 1
      });

      held.res.emit('finish');
    });

    it('bounds each database separately', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 0 });

      const first = send(middleware, fakeReq({ protection: bounds, databaseId: 'db-a' }));
      await first.done;

      const other = send(middleware, fakeReq({ protection: bounds, databaseId: 'db-b' }));
      await other.done;
      expect(other.next).toHaveBeenCalledTimes(1);

      const refused = send(middleware, fakeReq({ protection: bounds, databaseId: 'db-a' }));
      await refused.done;
      expect(refused.res.captured.status).toBe(429);
    });

    it('does not leave a slot held when the response both finishes and closes', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ maxConcurrentRequests: 2, maxQueueWaitMs: 0 });

      const first = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.1' }));
      await first.done;
      first.res.emit('finish');
      first.res.emit('close');

      const second = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.2' }));
      await second.done;
      const third = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.3' }));
      await third.done;

      // A double release would have freed two slots for one request, letting a
      // third in over the bound.
      expect(second.next).toHaveBeenCalledTimes(1);
      expect(third.next).toHaveBeenCalledTimes(1);
      const fourth = send(middleware, fakeReq({ protection: bounds, ip: '10.0.0.4' }));
      await fourth.done;
      expect(fourth.res.captured.status).toBe(429);
    });
  });

  describe('refusal recording', () => {
    let sink: jest.Mock;
    let recorder: RefusalRecorder;

    beforeEach(() => {
      sink = jest.fn(async (): Promise<void> => undefined);
      recorder = new RefusalRecorder({ sink, intervalMs: 60_000, jitterMs: 0 });
      installRefusalRecorder(recorder);
    });

    afterEach(() => {
      installRefusalRecorder(null);
    });

    it('counts a rate-limit refusal keyed by tenant, route and anonymised source', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 1 });
      for (let i = 0; i < 2; i++) {
        const admitted = send(middleware, fakeReq({ protection: bounds, ip: '203.0.113.7' }));
        await admitted.done;
        admitted.res.emit('finish');
      }

      const refused = send(middleware, fakeReq({ protection: bounds, ip: '203.0.113.7' }));
      await refused.done;
      expect(refused.res.captured.status).toBe(429);

      await recorder.flush();
      expect(sink).toHaveBeenCalledTimes(1);
      expect(sink.mock.calls[0][0]).toEqual([
        expect.objectContaining({
          database_id: 'db-1',
          lane: 'graphql',
          reason: 'rate_limited',
          route_key: 'POST /graphql',
          source_bucket: '203.0.113.0/24',
          count: 1
        })
      ]);
    });

    it('distinguishes an immediate concurrency refusal from a queue timeout', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const immediate = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 0 });
      const held = send(middleware, fakeReq({ protection: immediate, ip: '10.0.0.1' }));
      await held.done;
      const refused = send(middleware, fakeReq({ protection: immediate, ip: '10.0.0.2' }));
      await refused.done;
      expect(refused.res.captured.status).toBe(429);

      const waits = protection({ maxConcurrentRequests: 1, maxQueueWaitMs: 20 });
      const timedOut = send(middleware, fakeReq({ protection: waits, ip: '10.0.0.3' }));
      await timedOut.done;
      expect(timedOut.res.captured.status).toBe(429);
      held.res.emit('finish');

      await recorder.flush();
      const reasons = sink.mock.calls[0][0].map((r: { reason: string }) => r.reason).sort();
      expect(reasons).toEqual(['concurrency_saturated', 'queue_timeout']);
    });

    it('still refuses when the recorder is broken', async () => {
      installRefusalRecorder({
        record: () => {
          throw new Error('recorder exploded');
        }
      } as unknown as RefusalRecorder);
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const bounds = protection({ rateLimitRpm: 1, rateLimitBurst: 1 });
      for (let i = 0; i < 2; i++) {
        const admitted = send(middleware, fakeReq({ protection: bounds }));
        await admitted.done;
        admitted.res.emit('finish');
      }

      const refused = send(middleware, fakeReq({ protection: bounds }));
      await refused.done;
      expect(refused.res.captured.status).toBe(429);
      expect(refused.res.captured.body.errors[0].extensions.code).toBe('RATE_LIMITED');
    });

    it('does not record admitted requests', async () => {
      const middleware = createAdmissionControlMiddleware({ trustedProxyHops: 0 });
      const { done, res } = send(middleware, fakeReq());
      await done;
      res.emit('finish');
      expect(recorder.stats().keys).toBe(0);
    });
  });
});
