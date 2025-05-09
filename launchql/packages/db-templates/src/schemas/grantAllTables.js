import { change as schema } from './schema';
import { change as role } from './role';
import { searchSchemas, searchTables, searchRoles } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res)
];

export const change = ({ schema, role }) => [
  'schemas',
  schema,
  'grants',
  `grant_all_tables_to_${role}`.toLowerCase(),
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
    name: 'role',
    message: 'choose the role',
    source: searchRoles,
    required: true,
  },
];
export default questions;
