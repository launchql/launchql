interface ReleasableService {
  release?(): void | PromiseLike<void>;
}

interface FailedBuild {
  release(): void | PromiseLike<void>;
  getResolvedPreset(): { pgServices?: readonly ReleasableService[] };
}

/**
 * Release a failed build after its schema work has settled. PostGraphile releases
 * Grafserv and schema watching; each service releases only its own resources.
 */
export const releaseFailedBuild = async (
  pgl: FailedBuild
): Promise<void> => {
  const services = [...new Set(pgl.getResolvedPreset().pgServices ?? [])];
  const errors: unknown[] = [];

  try {
    await pgl.release();
  } catch (error) {
    errors.push(error);
  }

  for (const service of services.reverse()) {
    try {
      await service.release?.();
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Failed to release Graphile build resources');
  }
};
