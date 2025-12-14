import { LaunchQLOptions } from '@launchql/types';
import { getEnvOptions } from '@launchql/env';
import { getGraphileSettings as getSettings } from 'graphile-settings';
import { PostGraphileOptions } from 'postgraphile';

export const getGraphileSettings = (rawOpts: LaunchQLOptions): PostGraphileOptions => {
  const opts = getEnvOptions(rawOpts);

  const baseOptions = getSettings(opts);

  baseOptions.pgSettings = async function pgSettings(_req: any) {
    return { role: opts.pg?.user ?? 'postgres' };
  };

  return baseOptions;
};
