import { exec } from 'child_process';
import { prompt } from 'inquirerer';
import { makeAutocompleteFunctionWithInput } from '@launchql/db-utils';

import { objects, questions, functions } from '../api';
import { lqlEnv } from '../api/env';
// import { Client } from '../api/client';
import { GraphQLClient } from 'graphql-request';

const search = makeAutocompleteFunctionWithInput(objects);

const question = [
  {
    _: true,
    type: 'autocomplete',
    name: 'object',
    message: 'which object type?',
    source: search
  }
];

export const aliases = ['a'];
export default async (argv) => {
  const { object } = await prompt(question, argv);

  const env = await lqlEnv();
  const client = new GraphQLClient(env.GRAPHQL_URL);

  if (!questions[object]) throw new Error(`cannot find ${object}`);
  const { action } = await prompt(questions[object], argv);
  await functions[object][action](client, argv);
};
