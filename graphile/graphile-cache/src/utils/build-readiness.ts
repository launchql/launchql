export interface GraphileBuildReadiness {
  schemaResult(): void | Promise<void>;
  addTo(): void | PromiseLike<void>;
  ready(): void | PromiseLike<void>;
  release(): void | PromiseLike<void>;
  onReleaseError?(error: unknown): void;
}

/**
 * Wait for schema work before starting transport setup. The caller must defer
 * Grafserv construction to addTo, so a schema failure leaves no setup to drain.
 */
export const awaitGraphileBuildReadiness = async (
  build: GraphileBuildReadiness
): Promise<void> => {
  try {
    await build.schemaResult();
    await build.addTo();
    await build.ready();
  } catch (error) {
    try {
      await build.release();
    } catch (releaseError) {
      const failures = [error, releaseError];
      try {
        build.onReleaseError?.(releaseError);
      } catch (observerError) {
        failures.push(observerError);
      }
      throw new AggregateError(failures, 'Graphile build and cleanup failed', { cause: error });
    }
    throw error;
  }
};
