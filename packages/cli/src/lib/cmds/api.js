import { exec } from 'child_process';
import { prompt } from 'inquirerer';
import { makeAutocompleteFunctionWithInput } from '@launchql/db-utils';

import { objects, questions, functions } from '../api';
import { getCurrentContext } from '../api/env';

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
  const env = await getCurrentContext();
  let context;
  if (env && env.server) {
    const headers = {};
    if (env.user.hasOwnProperty('auth')) {
      if (env.user.auth.type === 'basic') {
        let str = `${env.user.auth.username}:${env.user.auth.password}`;
        if (
          typeof window !== 'undefined' &&
          typeof window.btoa === 'function'
        ) {
          str = window.btoa(str);
        } else {
          str = Buffer.from(str).toString('base64');
        }
        headers.authorization = `Basic ${str}`;
      } else if (env.user.auth.type === 'token') {
        headers.authorization = `Bearer ${env.user.auth.accessToken}`;
      }
    }

    const db = new GraphQLClient(
      env.server.endpoints?.db || env.server.endpoint,
      { headers }
    );
    const migrate = new GraphQLClient(
      env.server.endpoints?.migrate || env.server.endpoint,
      { headers }
    );
    const svc = new GraphQLClient(
      env.server.endpoints?.svc || env.server.endpoint,
      { headers }
    );
    const mods = new GraphQLClient(
      env.server.endpoints?.mods || env.server.endpoint,
      { headers }
    );
    context = {
      env,
      db,
      migrate,
      svc,
      mods
    };
  }

  if (!questions[object]) throw new Error(`cannot find ${object}`);
  const { action } = await prompt(questions[object], argv);

  if (typeof functions[object][action] !== 'function') {
    throw new Error(`${action} not found!`);
  }
  try {
    await functions[object][action](context, argv);
  } catch (e) {
    console.error('Error:');
    console.error(e.message);
  }
};
