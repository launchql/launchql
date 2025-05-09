import { PostGraphileOptions } from 'postgraphile';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';
import { LaunchQLOptions } from '@launchql/types';
import { getMergedOptions } from '@launchql/types';

export const getGraphileSettings = (rawOpts: LaunchQLOptions): PostGraphileOptions => {
  const opts = getMergedOptions(rawOpts);

  const baseOptions = getSettings(opts);

  baseOptions.pgSettings = async function pgSettings(_req: any) {
    return { role: opts.pg?.user ?? 'postgres' };
  };

  return baseOptions;
};
