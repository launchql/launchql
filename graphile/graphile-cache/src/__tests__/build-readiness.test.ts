import { awaitGraphileBuildReadiness } from '../utils/build-readiness';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};
const nextTurn = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

describe('awaitGraphileBuildReadiness', () => {
  it('waits for schema, attachment and readiness in order', async () => {
    const schema = deferred();
    const attachment = deferred();
    const readiness = deferred();
    const events: string[] = [];
    const schemaResult = jest.fn(() => { events.push('schema'); return schema.promise; });
    const addTo = jest.fn(() => { events.push('addTo'); return attachment.promise; });
    const ready = jest.fn(() => { events.push('ready'); return readiness.promise; });
    const release = jest.fn();
    let complete = false;
    const result = awaitGraphileBuildReadiness({ schemaResult, addTo, ready, release });
    const observed = result.then(() => { complete = true; });
    await nextTurn();
    expect(events).toEqual(['schema']);
    schema.resolve();
    await nextTurn();
    expect(events).toEqual(['schema', 'addTo']);
    attachment.resolve();
    await nextTurn();
    expect(events).toEqual(['schema', 'addTo', 'ready']);
    expect(complete).toBe(false);
    readiness.resolve();
    await observed;
    expect(schemaResult).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();
  });

  it('accepts synchronous void callbacks', async () => {
    await expect(awaitGraphileBuildReadiness({
      schemaResult: () => {}, addTo: () => {}, ready: () => {}, release: () => {},
    })).resolves.toBeUndefined();
  });

  it.each(['resolve', 'reject'] as const)(
    'does not start a failing attachment until the pending schema will %s', async (outcome) => {
      const schema = deferred();
      const schemaFailure = new Error('schema failed');
      const attachmentFailure = new Error('attachment failed');
      const addTo = jest.fn(() => { throw attachmentFailure; });
      const ready = jest.fn();
      const release = jest.fn();
      const observed = awaitGraphileBuildReadiness({
        schemaResult: () => schema.promise, addTo, ready, release,
      }).catch((error: unknown) => error);
      await nextTurn();
      expect(addTo).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
      if (outcome === 'resolve') schema.resolve();
      else schema.reject(schemaFailure);
      expect(await observed).toBe(outcome === 'resolve' ? attachmentFailure : schemaFailure);
      expect(addTo).toHaveBeenCalledTimes(outcome === 'resolve' ? 1 : 0);
      expect(ready).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ['schema', 'throw'], ['schema', 'reject'],
    ['addTo', 'throw'], ['addTo', 'reject'],
    ['ready', 'throw'], ['ready', 'reject'],
  ] as const)('preserves a %s %s and awaits cleanup', async (stage, mode) => {
    const failure = new Error(`${stage} failed`);
    const cleanup = deferred();
    const fail = () => { if (mode === 'throw') throw failure; return Promise.reject(failure); };
    const schemaResult = jest.fn(stage === 'schema' ? fail : () => {});
    const addTo = jest.fn(stage === 'addTo' ? fail : () => {});
    const ready = jest.fn(stage === 'ready' ? fail : () => {});
    const release = jest.fn(() => cleanup.promise);
    let settled = false;
    const observed = awaitGraphileBuildReadiness({ schemaResult, addTo, ready, release })
      .catch((error: unknown) => { settled = true; return error; });
    await nextTurn(); // Strict Jest/Node must observe an immediate rejection.
    expect(schemaResult).toHaveBeenCalledTimes(1);
    if (stage === 'schema') expect(addTo).not.toHaveBeenCalled();
    if (stage !== 'ready') expect(ready).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    cleanup.resolve();
    expect(await observed).toBe(failure);
  });

  it.each(['throw', 'reject'] as const)('retains the original error when cleanup will %s', async (mode) => {
    const failure = new Error('schema failed');
    const cleanupFailure = new Error('cleanup failed');
    const onReleaseError = jest.fn();
    await expect(awaitGraphileBuildReadiness({
      schemaResult: () => { throw failure; }, addTo: () => {}, ready: () => {},
      release: () => { if (mode === 'throw') throw cleanupFailure; return Promise.reject(cleanupFailure); },
      onReleaseError,
    })).rejects.toMatchObject({ errors: [failure, cleanupFailure], cause: failure });
    expect(onReleaseError).toHaveBeenCalledWith(cleanupFailure);
  });

  it('includes reporting failure without replacing the original cause', async () => {
    const failure = new Error('schema failed');
    const cleanupFailure = new Error('cleanup failed');
    const reportingFailure = new Error('reporting failed');
    await expect(awaitGraphileBuildReadiness({
      schemaResult: () => { throw failure; }, addTo: () => {}, ready: () => {},
      release: () => { throw cleanupFailure; },
      onReleaseError: () => { throw reportingFailure; },
    })).rejects.toMatchObject({ errors: [failure, cleanupFailure, reportingFailure], cause: failure });
  });

  it('preserves an undefined schema rejection reason', async () => {
    await expect(awaitGraphileBuildReadiness({
      schemaResult: () => Promise.reject(undefined),
      addTo: () => {}, ready: () => {}, release: () => {},
    })).rejects.toBeUndefined();
  });
});
