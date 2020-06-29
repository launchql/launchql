import { change as schema } from './schema';
import { change as table } from './table';
import { searchSchemas } from '@launchql/db-utils';
import { searchRoles } from '@launchql/db-utils';
import { searchTables } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res),
  table(res),
];

export const change = ({ schema, table, actions, role }) => [
  'schemas',
  schema,
  'tables',
  table,
  'grants',
  `grant_${actions.join('_')}_to_${role}`.toLowerCase(),
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
    type: 'checkbox',
    name: 'actions',
    message: 'choose the actions',
    choices: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    required: true,
  },
  {
    type: 'autocomplete',
    name: 'role',
    message: 'choose the role',
    source: searchRoles,
    required: true,
  },
];
export default questions;
