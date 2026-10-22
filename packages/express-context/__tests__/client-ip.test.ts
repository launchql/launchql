import type { NextFunction, Request, Response } from 'express';

import { clientIpMiddleware, clientIpOf } from '../src/client-ip';

const req = (forwardedFor?: string, socketIp = '10.0.0.1'): Request =>
  ({
    headers: forwardedFor !== undefined ? { 'x-forwarded-for': forwardedFor } : {},
    socket: { remoteAddress: socketIp }
  }) as unknown as Request;

const run = (hops: number, request: Request): Request => {
  const next = jest.fn() as unknown as NextFunction;
  clientIpMiddleware(hops)(request, {} as Response, next);
  expect(next).toHaveBeenCalledTimes(1);
  return request;
};

describe('clientIpMiddleware', () => {
  describe('with no trusted proxy (0 hops)', () => {
    it('uses the socket peer and ignores X-Forwarded-For', () => {
      expect(run(0, req('1.2.3.4')).clientIp).toBe('10.0.0.1');
      expect(run(0, req('1.2.3.4, 203.0.113.7')).clientIp).toBe('10.0.0.1');
      expect(run(0, req()).clientIp).toBe('10.0.0.1');
    });
  });

  describe('behind one trusted hop', () => {
    it('reads the entry our proxy appended, not the forged leftmost one', () => {
      expect(run(1, req('1.2.3.4, 203.0.113.7')).clientIp).toBe('203.0.113.7');
    });

    it('does not let a caller rotate the address per request', () => {
      const seen = ['5.5.5.5', '6.6.6.6'].map(
        (forged) => run(1, req(`${forged}, 203.0.113.7`)).clientIp
      );
      expect(new Set(seen)).toEqual(new Set(['203.0.113.7']));
    });

    it('falls back to the socket peer when the header is absent or malformed', () => {
      expect(run(1, req()).clientIp).toBe('10.0.0.1');
      expect(run(1, req(' , ,')).clientIp).toBe('10.0.0.1');
    });
  });

  it('falls back to the socket peer when the chain is shorter than the hop count', () => {
    expect(run(2, req('1.2.3.4')).clientIp).toBe('10.0.0.1');
  });

  it('treats a non-positive or non-numeric hop count as no trusted proxy', () => {
    expect(run(-1, req('1.2.3.4')).clientIp).toBe('10.0.0.1');
    expect(run(Number.NaN, req('1.2.3.4')).clientIp).toBe('10.0.0.1');
  });
});

describe('clientIpOf', () => {
  it('returns the address the middleware resolved', () => {
    expect(clientIpOf(run(1, req('1.2.3.4, 203.0.113.7')))).toBe('203.0.113.7');
  });

  it('never reads the header when the middleware has not run', () => {
    expect(clientIpOf(req('1.2.3.4'))).toBe('10.0.0.1');
  });
});
