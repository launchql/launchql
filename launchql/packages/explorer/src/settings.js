import env from './env';

import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

export const getGraphileSettings = ({
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  postgis
}) => {
  const options = getSettings({
    host,
    port,
    schema,
    simpleInflection,
    oppositeBaseNames,
    postgis
  });

  options.pgSettings = async function pgSettings(req) {
    return { role: env.PGUSER };
  };

  return options;
};
