import type { Server } from 'node:http';

import { createPresetServicesReleaser, type ReleasablePresetService } from './preset-services';

interface FailedBuild {
  release(): void | PromiseLike<void>;
  getResolvedPreset(): { pgServices?: readonly ReleasablePresetService[] };
}

/**
 * Release a failed build after its schema work has settled, including its own
 * HTTP server if attachment started it. PostGraphile releases Grafserv and schema
 * watching; each preset service releases only its own resources.
 */
export const releaseFailedBuild = async (
  pgl: FailedBuild,
  releasePresetServices = createPresetServicesReleaser(pgl.getResolvedPreset()),
  httpServer?: Server
): Promise<void> => {
  const errors: unknown[] = [];

  try {
    if (httpServer?.listening) {
      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => error ? reject(error) : resolve());
      });
    }
  } catch (error) {
    errors.push(error);
  }

  try {
    await pgl.release();
  } catch (error) {
    errors.push(error);
  }

  try {
    await releasePresetServices();
  } catch (error) {
    errors.push(error);
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Failed to release Graphile build resources');
  }
};
