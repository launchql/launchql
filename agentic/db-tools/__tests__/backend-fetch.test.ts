import { createBackendFetch, toolFetch } from '../src/backend-fetch';

const URL_ = 'http://api.example.test/graphql';
const read = { method: 'POST', body: JSON.stringify({ query: 'query Q { databases { nodes { id } } }' }) };
const write = {
  method: 'POST',
  body: JSON.stringify({ query: '# make one\nmutation M($input: X!) { createThing(input: $input) { id } }' }),
};

function systemError(code: string): Error {
  return Object.assign(new Error(code), { code });
}

function respond(status: number): Response {
  return new Response('{}', { status });
}

type Step = Response | Error | 'hang';

function fakeFetch(steps: Step[]) {
  const signals: AbortSignal[] = [];
  const fn = jest.fn(async (_input: RequestInfo | URL, init: RequestInit = {}) => {
    signals.push(init.signal);
    const step = steps.shift() ?? respond(200);
    if (step === 'hang') {
      return new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('The operation was aborted')));
      });
    }
    if (step instanceof Error) throw step;
    return step;
  });
  return { fn: fn as unknown as typeof globalThis.fetch, calls: fn, signals };
}

function backend(steps: Step[], options: Parameters<typeof createBackendFetch>[0] = {}) {
  const fake = fakeFetch(steps);
  const retries: string[] = [];
  const fetch = createBackendFetch({
    fetch: fake.fn,
    retryDelayMs: 1,
    random: () => 0,
    onRetry: (attempt, max) => retries.push(`${attempt}/${max}`),
    ...options,
  });
  return { fetch, ...fake, retries };
}

describe('createBackendFetch', () => {
  it('retries a read on a network error and on 503, then returns the answer', async () => {
    const { fetch, calls, retries } = backend([new TypeError('fetch failed'), respond(503), respond(200)]);
    const response = await fetch(URL_, read);
    expect(response.status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(3);
    expect(retries).toEqual(['1/3', '2/3']);
  });

  it('retries a read on 502 and 504', async () => {
    const { fetch, calls } = backend([respond(502), respond(504), respond(200)]);
    expect((await fetch(URL_, read)).status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(3);
  });

  it('gives up on a read after 3 retries and returns the last 503', async () => {
    const { fetch, calls, retries } = backend([respond(503), respond(503), respond(503), respond(503)]);
    expect((await fetch(URL_, read)).status).toBe(503);
    expect(calls).toHaveBeenCalledTimes(4);
    expect(retries).toEqual(['1/3', '2/3', '3/3']);
  });

  it('does not retry a read on other statuses', async () => {
    const { fetch, calls } = backend([respond(500)]);
    expect((await fetch(URL_, read)).status).toBe(500);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('retries a write when the connection never opened', async () => {
    const { fetch, calls } = backend([systemError('ECONNREFUSED'), respond(200)]);
    expect((await fetch(URL_, write)).status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(2);
  });

  it('finds the connection code in cause and in AggregateError', async () => {
    const undici = Object.assign(new TypeError('fetch failed'), { cause: systemError('ENOTFOUND') });
    const aggregate = new AggregateError([systemError('ECONNREFUSED')], 'connect failed');
    const { fetch, calls } = backend([undici, aggregate, respond(200)]);
    expect((await fetch(URL_, write)).status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(3);
  });

  it('does not retry a write that may have reached the server', async () => {
    const reset = systemError('ECONNRESET');
    const { fetch, calls } = backend([reset]);
    await expect(fetch(URL_, write)).rejects.toBe(reset);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('does not retry a write on 503', async () => {
    const { fetch, calls } = backend([respond(503)]);
    expect((await fetch(URL_, write)).status).toBe(503);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('treats a mutation keyword inside a string or a field as a read', async () => {
    const query = 'query Q { find(name: "mutation {") { mutation } }';
    const { fetch, calls } = backend([respond(503), respond(200)]);
    await fetch(URL_, { method: 'POST', body: JSON.stringify({ query }) });
    expect(calls).toHaveBeenCalledTimes(2);
  });

  it('stops a hung send after the timeout and does not retry it', async () => {
    const { fetch, calls } = backend(['hang'], { timeoutMs: 20 });
    await expect(fetch(URL_, read)).rejects.toThrow(`The backend at ${URL_} did not answer within 0 s.`);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('warns that a timed-out write can still finish', async () => {
    const { fetch } = backend(['hang'], { timeoutMs: 20 });
    await expect(fetch(URL_, write)).rejects.toThrow('The request can still finish on the server.');
  });

  it('passes the caller signal to the send', async () => {
    const controller = new AbortController();
    const { fetch, signals } = backend([respond(200)], { signal: controller.signal });
    await fetch(URL_, read);
    expect(signals[0].aborted).toBe(false);
    controller.abort(new Error('stop'));
    expect(signals[0].aborted).toBe(true);
  });

  it('stops at once when the signal aborts during a send', async () => {
    const controller = new AbortController();
    const reason = new Error('cancelled');
    const { fetch, calls } = backend(['hang'], { signal: controller.signal });
    const pending = fetch(URL_, read);
    setTimeout(() => controller.abort(reason), 5);
    await expect(pending).rejects.toBe(reason);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('stops at once when the signal aborts during the backoff wait', async () => {
    const controller = new AbortController();
    const reason = new Error('cancelled');
    const { fetch, calls } = backend([respond(503)], {
      signal: controller.signal,
      retryDelayMs: 60_000,
      onRetry: () => setTimeout(() => controller.abort(reason), 5),
    });
    await expect(fetch(URL_, read)).rejects.toBe(reason);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('sends nothing when the signal is already aborted', async () => {
    const reason = new Error('cancelled');
    const { fetch, calls } = backend([], { signal: AbortSignal.abort(reason) });
    await expect(fetch(URL_, read)).rejects.toBe(reason);
    expect(calls).not.toHaveBeenCalled();
  });
});

describe('toolFetch', () => {
  it('uses the call signal and reports retries as progress', async () => {
    const progress: string[] = [];
    const controller = new AbortController();
    const fake = fakeFetch([respond(503), respond(200)]);
    const fetch = toolFetch(
      { cwd: '/tmp', signal: controller.signal, onProgress: (message) => progress.push(message) },
      { fetch: fake.fn, retryDelayMs: 1 },
    );
    expect((await fetch(URL_, read)).status).toBe(200);
    expect(progress).toEqual(['Retrying 1/3']);
    controller.abort();
    expect(fake.signals[0].aborted).toBe(true);
  });
});
