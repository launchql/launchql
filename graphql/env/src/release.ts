import type { ReleaseOptions } from '@constructive-io/graphql-types';

const RELEASE_ENV: Record<keyof ReleaseOptions, string> = {
  hub: 'CONSTRUCTIVE_RELEASE_HUB',
  constructive: 'CONSTRUCTIVE_RELEASE_CONSTRUCTIVE',
  constructiveDb: 'CONSTRUCTIVE_RELEASE_CONSTRUCTIVE_DB',
  dashboard: 'CONSTRUCTIVE_RELEASE_DASHBOARD',
  functions: 'CONSTRUCTIVE_RELEASE_FUNCTIONS'
};

/**
 * The release tuple is all-or-nothing: absent when no CONSTRUCTIVE_RELEASE_*
 * variable is set, otherwise every field must be a non-empty value.
 */
export const getReleaseEnv = (env: NodeJS.ProcessEnv): ReleaseOptions | undefined => {
  const entries = Object.entries(RELEASE_ENV) as [keyof ReleaseOptions, string][];
  if (entries.every(([, name]) => env[name] === undefined)) {
    return undefined;
  }
  const invalid = entries
    .filter(([, name]) => !env[name]?.trim())
    .map(([, name]) => name);
  if (invalid.length > 0) {
    throw new Error(
      `Incomplete release tuple: ${invalid.join(', ')} must be set to a non-empty value when any CONSTRUCTIVE_RELEASE_* variable is set`
    );
  }
  return Object.fromEntries(
    entries.map(([field, name]) => [field, env[name].trim()])
  ) as unknown as ReleaseOptions;
};
