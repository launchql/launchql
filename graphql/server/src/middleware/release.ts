import type { ReleaseOptions } from '@constructive-io/graphql-types';
import type { RequestHandler } from 'express';

export const RELEASE_PATH = '/.well-known/constructive-release';

export const createReleaseHandler = (release: ReleaseOptions): RequestHandler => {
  const tuple: ReleaseOptions = {
    hub: release.hub,
    constructive: release.constructive,
    constructiveDb: release.constructiveDb,
    dashboard: release.dashboard,
    functions: release.functions
  };
  return (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(tuple);
  };
};
