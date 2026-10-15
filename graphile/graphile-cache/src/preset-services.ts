interface ReleasablePresetService {
  release?: () => void | PromiseLike<void>;
}

/**
 * Own and release the unique pgServices for one resolved preset generation.
 * Success means the public release calls returned successfully (including any
 * promise they expose). Upstream may continue subscriber UNLISTEN/client return
 * in the background; this does not promise that the pool is already idle.
 */
export const createPresetServicesReleaser = (resolvedPreset: {
  pgServices?: readonly ReleasablePresetService[];
}): (() => Promise<void>) => {
  const services = [...new Set(resolvedPreset.pgServices ?? [])];
  let releasePromise: Promise<void> | null = null;

  return (): Promise<void> => {
    if (releasePromise) return releasePromise;
    releasePromise = (async () => {
      const failures: unknown[] = [];
      for (const service of [...services].reverse()) {
        try {
          await service.release?.();
        } catch (error) {
          failures.push(error);
        }
      }
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) throw new AggregateError(failures, 'Graphile service cleanup failed');
    })();
    return releasePromise;
  };
};
