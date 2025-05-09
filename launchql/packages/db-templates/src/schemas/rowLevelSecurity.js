import { change as schema } from './schema';
import { change as table } from './table';
import { searchSchemas } from '@launchql/db-utils';
import { searchTables } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res),
  table(res),
];

export const change = ({
  schema,
  table
}) => [
  'schemas',
  schema,
  'tables',
  table,
  'policies',
  `enable_row_level_security`,
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
];

export default questions;
