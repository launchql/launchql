import { awaitGraphileBuildReadiness } from '../utils/build-readiness';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

// Give unhandled rejections a full event-loop turn to surface in Jest.
const nextTurn = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe('awaitGraphileBuildReadiness', () => {
  it.each(['schema', 'ready'] as const)('waits when %s is the last prerequisite', async (last) => {
    const schema = deferred();
    const attachment = deferred();
    const readiness = deferred();
    const ready = jest.fn(() => readiness.promise);
    const release = jest.fn();
    let resolved = false;
    const build = awaitGraphileBuildReadiness({
      schemaResult: schema.promise,
      addTo: () => attachment.promise,
      ready,
      release,
    });
    const observed = build.then(() => { resolved = true; });

    await nextTurn();
    expect(ready).not.toHaveBeenCalled();
    attachment.resolve();
    (last === 'schema' ? readiness : schema).resolve();
    await nextTurn();
    expect(ready).toHaveBeenCalledTimes(1);
    expect(resolved).toBe(false);

    (last === 'schema' ? schema : readiness).resolve();
    await expect(build).resolves.toBeUndefined();
    await observed;
    expect(release).not.toHaveBeenCalled();
  });

  it('accepts synchronous void operations', async () => {
    await expect(awaitGraphileBuildReadiness({
      schemaResult: Promise.resolve(),
      addTo: () => {},
      ready: () => {},
      release: () => {},
    })).resolves.toBeUndefined();
  });

  it.each([
    ['addTo', 'throw', 'resolve'],
    ['addTo', 'reject', 'reject'],
    ['ready', 'throw', 'reject'],
    ['ready', 'reject', 'resolve'],
  ] as const)('waits for schema after %s %s (schema will %s)', async (stage, mode, schemaResult) => {
    const schema = deferred();
    const cleanup = deferred();
    const failure = new Error(`${stage} failed`);
    const fail = (): void | Promise<void> => {
      if (mode === 'throw') throw failure;
      return Promise.reject(failure);
    };
    const ready = jest.fn(stage === 'ready' ? fail : () => {});
    const release = jest.fn(() => cleanup.promise);
    let rejected = false;
    const observed = awaitGraphileBuildReadiness({
      schemaResult: schema.promise,
      addTo: stage === 'addTo' ? fail : () => {},
      ready,
      release,
    }).catch((error: unknown) => {
      rejected = true;
      return error;
    });

    await nextTurn();
    expect(release).not.toHaveBeenCalled();
    if (stage === 'addTo') expect(ready).not.toHaveBeenCalled();
    if (schemaResult === 'resolve') schema.resolve();
    else schema.reject(new Error('schema also failed'));
    await nextTurn();
    expect(release).toHaveBeenCalledTimes(1);
    expect(rejected).toBe(false);

    cleanup.resolve();
    expect(await observed).toBe(failure);
  });

  it.each(['resolve', 'reject'] as const)('observes early schema failure while addTo will %s', async (attachmentResult) => {
    const schema = deferred();
    const attachment = deferred();
    const schemaFailure = new Error('schema failed');
    const attachmentFailure = new Error('attachment failed');
    const release = jest.fn();
    const observed = awaitGraphileBuildReadiness({
      schemaResult: schema.promise,
      addTo: () => attachment.promise,
      ready: () => {},
      release,
    }).catch((error: unknown) => error);

    schema.reject(schemaFailure);
    await nextTurn();
    expect(release).not.toHaveBeenCalled();
    if (attachmentResult === 'resolve') attachment.resolve();
    else attachment.reject(attachmentFailure);

    expect(await observed).toBe(attachmentResult === 'resolve' ? schemaFailure : attachmentFailure);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('observes both schema and Grafserv rejections', async () => {
    const schemaFailure = new Error('schema failed');
    const readyFailure = new Error('Grafserv failed');
    const release = jest.fn();
    await expect(awaitGraphileBuildReadiness({
      schemaResult: Promise.reject(schemaFailure),
      addTo: () => {},
      ready: () => Promise.reject(readyFailure),
      release,
    })).rejects.toBe(readyFailure);
    await nextTurn();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('waits for Grafserv to settle before releasing a failed schema', async () => {
    const ready = deferred();
    const failure = new Error('schema failed');
    const release = jest.fn();
    const observed = awaitGraphileBuildReadiness({
      schemaResult: Promise.reject(failure),
      addTo: () => {},
      ready: () => ready.promise,
      release,
    }).catch((error: unknown) => error);

    await nextTurn();
    expect(release).not.toHaveBeenCalled();
    ready.resolve();
    expect(await observed).toBe(failure);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it.each(['throw', 'reject'] as const)('retains the original error when release will %s', async (mode) => {
    const failure = new Error('schema failed');
    const cleanupFailure = new Error('release failed');
    const onReleaseError = jest.fn();
    await expect(awaitGraphileBuildReadiness({
      schemaResult: Promise.reject(failure),
      addTo: () => {},
      ready: () => {},
      release: () => {
        if (mode === 'throw') throw cleanupFailure;
        return Promise.reject(cleanupFailure);
      },
      onReleaseError,
    })).rejects.toMatchObject({ errors: [failure, cleanupFailure], cause: failure });
    expect(onReleaseError).toHaveBeenCalledWith(cleanupFailure);
  });

  it('includes a reporting failure without replacing the original cause', async () => {
    const failure = new Error('schema failed');
    const cleanupFailure = new Error('release failed');
    const reportingFailure = new Error('reporting failed');
    await expect(awaitGraphileBuildReadiness({
      schemaResult: Promise.reject(failure),
      addTo: () => {},
      ready: () => {},
      release: () => { throw cleanupFailure; },
      onReleaseError: () => { throw reportingFailure; },
    })).rejects.toMatchObject({ errors: [failure, cleanupFailure, reportingFailure], cause: failure });
  });
});
