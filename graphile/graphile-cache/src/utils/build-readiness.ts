export interface GraphileBuildReadiness {
  schemaResult: Promise<void>;
  addTo(): void | PromiseLike<void>;
  ready(): void | PromiseLike<void>;
  release(): void | PromiseLike<void>;
  onReleaseError?(error: unknown): void;
}

/** Wait for schema construction, HTTP attachment and Grafserv readiness. */
export const awaitGraphileBuildReadiness = async (
  build: GraphileBuildReadiness
): Promise<void> => {
  // Observe schema rejection immediately, even while addTo is still pending.
  // Keeping it as an outcome also lets failure cleanup wait for schema work.
  const schemaOutcome = (async () => {
    try {
      await build.schemaResult;
      return { ready: true as const };
    } catch (error: unknown) {
      return { ready: false as const, error };
    }
  })();
  try {
    await build.addTo();
    const [schema] = await Promise.all([schemaOutcome, build.ready()]);
    if ('error' in schema) throw schema.error;
  } catch (error) {
    // Schema gathering may still be using the services we are about to release.
    await schemaOutcome;
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
