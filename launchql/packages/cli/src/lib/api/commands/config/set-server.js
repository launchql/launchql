import { prompt } from 'inquirerer';
import { getConfig, setConfig } from '../../env';

export default async (ctx, args) => {
  const config = await getConfig();
  const { server, endpoint } = await prompt(
    [
      {
        _: true,
        type: 'string',
        name: 'server',
        message: 'enter a server name',
        required: true
      },
      {
        type: 'string',
        name: 'endpoint',
        message: 'enter endpoint',
        required: true
      }
    ],
    args
  );

  config.servers.push({
    name: server,
    endpoint
  });

  await setConfig(config);

  console.log(`added ${server}`);
};
