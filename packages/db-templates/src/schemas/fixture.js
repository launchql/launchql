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
  table,
  name,
}) => [
  'schemas',
  schema,
  'tables',
  table,
  'fixtures',
  `${Date.now()}_fixture`,
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
