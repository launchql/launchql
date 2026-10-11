import { releaseFailedBuild } from '../utils/release-failed-build';

type FailedBuild = Parameters<typeof releaseFailedBuild>[0];

const makeService = (
  release?: () => void | PromiseLike<void>
) => ({ release });

const makeInstance = (
  services?: readonly ReturnType<typeof makeService>[],
  release: FailedBuild['release'] = jest.fn()
): FailedBuild => ({
  release,
  getResolvedPreset: () => ({ pgServices: services }),
});

describe('releaseFailedBuild', () => {
  it('waits for PostGraphile, then releases services in reverse order', async () => {
    const events: string[] = [];
    let finishPostGraphile!: () => void;
    const postGraphileReleased = new Promise<void>((resolve) => {
      finishPostGraphile = resolve;
    });
    let finishSecond!: () => void;
    const secondReleased = new Promise<void>((resolve) => {
      finishSecond = resolve;
    });
    const first = makeService(() => { events.push('first'); });
    const second = makeService(async () => {
      events.push('second');
      await secondReleased;
    });
    const release = jest.fn(async () => {
      events.push('postgraphile');
      await postGraphileReleased;
    });

    const result = releaseFailedBuild(makeInstance([first, second], release));
    await Promise.resolve();
    expect(events).toEqual(['postgraphile']);

    finishPostGraphile();
    await new Promise<void>((resolve) => setImmediate(resolve));
    expect(events).toEqual(['postgraphile', 'second']);

    finishSecond();
    await expect(result).resolves.toBeUndefined();
    expect(events).toEqual(['postgraphile', 'second', 'first']);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('snapshots and deduplicates services before releasing PostGraphile', async () => {
    const releaseService = jest.fn();
    const service = makeService(releaseService);
    const services = [service, makeService(), service];
    const release = jest.fn(() => { services.length = 0; });

    await releaseFailedBuild(makeInstance(services, release));

    expect(releaseService).toHaveBeenCalledTimes(1);
  });

  it('releases PostGraphile when the preset has no services', async () => {
    const release = jest.fn();

    await expect(releaseFailedBuild(makeInstance(undefined, release))).resolves.toBeUndefined();

    expect(release).toHaveBeenCalledTimes(1);
  });

  it('preserves a single release error and still attempts remaining services', async () => {
    const error = new Error('service release failed');
    const releaseFirst = jest.fn();
    const first = makeService(releaseFirst);
    const second = makeService(() => { throw error; });

    await expect(releaseFailedBuild(makeInstance([first, second]))).rejects.toBe(error);

    expect(releaseFirst).toHaveBeenCalledTimes(1);
  });

  it('collects synchronous and asynchronous errors without skipping any releases', async () => {
    const postGraphileError = new Error('PostGraphile release failed');
    const firstError = new Error('first service release failed');
    const secondError = new Error('second service release failed');
    const events: string[] = [];
    const first = makeService(() => {
      events.push('first');
      throw firstError;
    });
    const second = makeService(async () => {
      events.push('second');
      throw secondError;
    });
    const release = () => {
      events.push('postgraphile');
      throw postGraphileError;
    };

    const error = await releaseFailedBuild(makeInstance([first, second], release)).catch(
      (caught: unknown) => caught
    );

    expect(events).toEqual(['postgraphile', 'second', 'first']);
    expect(error).toBeInstanceOf(AggregateError);
    if (!(error instanceof AggregateError)) throw new Error('Expected aggregate cleanup error');
    expect(error.errors).toHaveLength(2);
    expect(error.errors[0]).toBe(postGraphileError);
    expect(error.errors[1]).toBeInstanceOf(AggregateError);
    expect(error.errors[1].errors).toEqual([secondError, firstError]);
  });
});
