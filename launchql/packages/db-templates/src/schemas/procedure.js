import { change as schema } from './schema';
import { searchSchemas } from '@launchql/db-utils';

export const requires = (res) => [schema(res)];

export const change = ({ schema, procedure }) => [
  'schemas',
  schema,
  'procedures',
  procedure
];

const questions = [
  {
    type: 'autocomplete',
    name: 'schema',
    message: 'enter a schema name',
    source: searchSchemas,
    required: true
  },
  {
    type: 'string',
    name: 'procedure',
    message: 'enter a procedure name',
    required: true
  },
  {
    type: 'list',
    name: 'stability',
    message: 'choose the stability',
    choices: ['STABLE', 'VOLATILE', 'IMMUTABLE', 'IMMUTABLE STRICT'],
    required: true
  },
  {
    type: 'list',
    name: 'lang',
    message: 'choose the language',
    choices: ['sql', 'plpgsql'],
    required: true
  }
];

export default questions;
