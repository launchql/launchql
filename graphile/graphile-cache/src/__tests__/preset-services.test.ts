import { createPresetServicesReleaser } from '../preset-services';

describe('preset service ownership', () => {
  it('releases unique services in reverse order exactly once', async () => {
    const events: string[] = [];
    const first = {
      release: jest.fn(async () => {
        events.push('first');
      }),
    };
    const second = {
      release: jest.fn(async () => {
        events.push('second');
      }),
    };
    const release = createPresetServicesReleaser({
      pgServices: [first, second, first],
    });

    const releases = [release(), release(), release()];
    expect(releases[0]).toBe(releases[1]);
    expect(releases[1]).toBe(releases[2]);
    await Promise.all(releases);

    expect(events).toEqual(['second', 'first']);
    expect(first.release).toHaveBeenCalledTimes(1);
    expect(second.release).toHaveBeenCalledTimes(1);
  });

  it('continues releasing services and preserves the first error', async () => {
    const firstFailure = new Error('second failed');
    const first = { release: jest.fn().mockResolvedValue(undefined) };
    const second = { release: jest.fn().mockRejectedValue(firstFailure) };
    const release = createPresetServicesReleaser({
      pgServices: [first, second],
    });

    await expect(release()).rejects.toBe(firstFailure);
    expect(first.release).toHaveBeenCalledTimes(1);
    expect(second.release).toHaveBeenCalledTimes(1);
  });

  it('accepts a void release without waiting for private background cleanup', async () => {
    let finishCleanup!: () => void;
    let cleaned = false;
    const background = new Promise<void>(resolve => { finishCleanup = resolve; });
    const service = {
      release: jest.fn((): void => {
        void background.then(() => { cleaned = true; });
      }),
    };
    const release = createPresetServicesReleaser({ pgServices: [service] });

    await release();
    expect(service.release).toHaveBeenCalledTimes(1);
    expect(cleaned).toBe(false);
    finishCleanup();
    await background;
    expect(cleaned).toBe(true);
  });

  it('is a safe idempotent no-op when the preset has no services', async () => {
    const release = createPresetServicesReleaser({});

    const first = release();
    expect(release()).toBe(first);
    await first;
  });
});
