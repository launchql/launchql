import { change as schema } from './schema';
import { change as procedure } from './procedure';
import { searchSchemas } from '@launchql/db-utils';
import { searchProcedures } from '@launchql/db-utils';
import { searchRoles } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res),
  procedure(res),
];

export const change = ({
  schema,
  table,
  procedure,
  role,
}) => [
  'schemas',
  schema,
  'grants',
  'procedures',
  procedure,
  `grant_execute_to_${role}`,
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
    name: 'procedure',
    message: 'enter a procedure name',
    source: searchProcedures,
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
