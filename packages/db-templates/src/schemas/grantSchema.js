import { change as schema } from './schema';
import { searchSchemas } from '@launchql/db-utils';
import { searchRoles } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res),
];

export const change = ({
  schema,
  table,
  role,
}) => [
  'schemas',
  schema,
  'grants',
  `grant_schema_to_${role}`,
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
