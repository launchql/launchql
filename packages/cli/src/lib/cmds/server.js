import server from '@launchql/server';
// import { prompt } from '@pyramation/prompt';
import { prompt } from 'inquirerer';

const questions = [
  {
    name: 'simpleInflection',
    message: 'simpleInflection',
    type: 'boolean',
    alias: 's',
    default: true
  },
  {
    name: 'oppositeBaseNames',
    message: 'oppositeBaseNames',
    type: 'boolean',
    alias: 'o',
    default: false
  },
  {
    name: 'postgis',
    message: 'postgis',
    type: 'boolean',
    alias: 'g',
    default: true
  },
  {
    name: 'port',
    message: 'port',
    type: 'number',
    alias: 'p',
    default: 5555
  },
  {
    name: 'origin',
    message: 'origin',
    type: 'string',
    alias: 'o',
    default: 'http://localhost:3000'
  }
];

export default async (argv) => {
  const results = await prompt(questions, argv);
  server(results);
};
