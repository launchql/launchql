import { prompt } from 'inquirerer';
import { getConfig, setCurrentContext } from '../../env';
import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

export default async (ctx, args) => {
  const result = await getConfig();
  const { context } = await prompt(
    [
      {
        type: 'autocomplete',
        name: 'context',
        message: 'enter a context',
        source: makeSearch(result.contexts.map((n) => n.name)),
        required: true
      }
    ],
    args
  );

  const check = result.contexts.find((c) => c.name == context);
  if (!check) {
    throw new Error('context not found');
  }
  await setCurrentContext(context);

  console.log(`using ${context}`);
};
