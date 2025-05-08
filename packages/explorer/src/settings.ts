import { env } from './env';
import { PostGraphileOptions } from 'postgraphile';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

interface SettingsInput {
  host?: string;
  port?: number;
  schema: string | string[];
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  postgis?: boolean;
}

export const getGraphileSettings = ({
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  postgis
}: SettingsInput): PostGraphileOptions => {
  const options = getSettings({
    host,
    port,
    schema,
    simpleInflection,
    oppositeBaseNames,
    postgis
  });

  options.pgSettings = async function pgSettings(_req: any) {
    return { role: env.PGUSER };
  };

  return options;
};
