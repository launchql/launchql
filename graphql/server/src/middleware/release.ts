import type { ReleaseOptions } from '@constructive-io/graphql-types';
import type { RequestHandler } from 'express';

export const RELEASE_PATH = '/.well-known/constructive-release';

const RELEASE_FIELDS: (keyof ReleaseOptions)[] = [
  'hub',
  'constructive',
  'constructiveDb',
  'dashboard',
  'functions'
];

export const createReleaseHandler = (release: ReleaseOptions): RequestHandler => {
  const invalid = RELEASE_FIELDS.filter(
    (field) => typeof release[field] !== 'string' || release[field].trim() === ''
  );
  if (invalid.length > 0) {
    throw new Error(
      `Incomplete release tuple: ${invalid.join(', ')} must be a non-empty string`
    );
  }
  const tuple = Object.fromEntries(
    RELEASE_FIELDS.map((field) => [field, release[field]])
  ) as unknown as ReleaseOptions;
  return (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(tuple);
  };
};
