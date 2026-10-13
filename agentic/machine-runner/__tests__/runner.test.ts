import { decodeFrame, Frame, MAX_PATH_REQUESTS_IN_FLIGHT } from '@constructive-db/machine-protocol';
import { Logger } from '@pgpmjs/logger';
import { WebSocket } from 'ws';

import { EnrollmentRunner } from '../src';
import * as files from '../src/files';

afterEach(() => jest.restoreAllMocks());

/** A socket that records what the runner sends. */
function fakeSocket(): { ws: WebSocket; sent: Frame[] } {
  const sent: Frame[] = [];
  const ws = {
    readyState: WebSocket.OPEN,
    send: (raw: string) => sent.push(decodeFrame(raw)),
    close: jest.fn()
  } as unknown as WebSocket;
  return { ws, sent };
}

describe('path requests in flight', () => {
  it(`answers ${MAX_PATH_REQUESTS_IN_FLIGHT} at once and refuses one more, by its request id`, async () => {
    const releases: Array<() => void> = [];
    jest.spyOn(files, 'listPath').mockImplementation(
      () => new Promise(resolve => releases.push(() => resolve([])))
    );
    const runner = new EnrollmentRunner({
      enrollment: { machineId: 'm', relayUrl: 'ws://127.0.0.1:1', token: 't', database: 'd' },
      policy: { allowedCommands: [], cwd: process.cwd() },
      logger: new Logger('runner-test')
    });
    const { ws, sent } = fakeSocket();
    const handle = (requestId: string) =>
      (runner as any).handleFrame(ws, { type: 'path_list', requestId, path: '' });

    for (let i = 0; i <= MAX_PATH_REQUESTS_IN_FLIGHT; i++) handle(`r${i}`);
    expect(sent).toEqual([
      expect.objectContaining({
        type: 'error',
        requestId: `r${MAX_PATH_REQUESTS_IN_FLIGHT}`,
        code: 'TOO_MANY_PATH_REQUESTS'
      })
    ]);

    for (const release of releases) release();
    await new Promise(resolve => setImmediate(resolve));
    expect(sent.filter(frame => frame.type === 'path_listing')).toHaveLength(
      MAX_PATH_REQUESTS_IN_FLIGHT
    );

    // Answered requests free their slots.
    handle('again');
    releases[releases.length - 1]();
    await new Promise(resolve => setImmediate(resolve));
    expect(sent[sent.length - 1]).toMatchObject({ type: 'path_listing', requestId: 'again' });
  });
});
