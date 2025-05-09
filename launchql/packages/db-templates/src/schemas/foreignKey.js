import { change as schema } from './schema';
import { change as table } from './table';
import { searchSchemas } from '@launchql/db-utils';
import { searchTables } from '@launchql/db-utils';

export const requires = (res) => {
  let { refschema, reftable } = res;
  return [
    schema(res),
    schema({
      schema: refschema,
    }),
    table(res),
    table({
      schema: refschema,
      table: reftable,
    }),
  ];
};

export const change = ({
  schema,
  table,
  column,
}) => [
  'schemas',
  schema,
  'tables',
  table,
  'alterations',
  `add_foreign_key_${column}`,
];

const questions = [
  {
    type: 'autocomplete',
    name: 'schema',
    message: 'enter a schema name',
    source: searchSchemas,
    required: true,
  },
  {
    type: 'autocomplete',
    name: 'table',
    message: 'enter a table name',
    source: searchTables,
    required: true,
  },
  {
    type: 'string',
    name: 'column',
    message: 'enter a column name',
    required: true,
  },
  {
    type: 'autocomplete',
    name: 'refschema',
    message: 'enter a refschema name',
    source: searchSchemas,
    required: true,
  },
  {
    type: 'autocomplete',
    name: 'reftable',
    message: 'enter a reftable name',
    source: (answers, input) => {
      let { refschema } = answers;
      return searchTables({ schema: refschema }, input);
    },
    required: true,
  },
  {
    type: 'string',
    name: 'refcolumn',
    message: 'enter a refcolumn name',
    required: true,
  },
  {
    type: 'string',
    name: 'shardcolumn',
    message: 'enter a shard column (if exists)',
    required: false,
  },
  {
    type: 'list',
    name: 'cascade',
    message: 'choose a delete option',
    choices: [
      'ON DELETE CASCADE',
      'ON DELETE RESTRICT',
      { name: '(none)', value: '' },
    ],
    required: true,
  },
];

export default questions;
