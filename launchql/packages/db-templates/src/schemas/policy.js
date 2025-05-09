import { change as schema } from './schema';
import { change as rowLevelSecurity } from './rowLevelSecurity';
import { change as table } from './table';
import { change as role } from './role';
import { searchSchemas, searchTables, searchRoles } from '@launchql/db-utils';

export const requires = (res) => [
  schema(res),
  table(res),
  rowLevelSecurity(res),
];

export const change = ({
  schema,
  table,
  action,
  role,
  policy,
}) => [
  'schemas',
  schema,
  'tables',
  table,
  'policies',
  policy
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
    name: 'action',
    message: 'which action(s)?',
    choices: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    required: true,
  },
  {
    type: 'string',
    name: 'policy',
    message: 'choose a policy name',
    required: true,
    filter: (val) => val.toLowerCase()
  },
  {
    type: 'checkbox',
    name: 'role',
    message: 'choose role (optional)',
    choices: ['authenticated', 'anonymous', 'administrator'],
    required: false,
  },
  {
    type: 'checkbox',
    name: 'grant',
    message: 'choose role for grant (optional)',
    choices: ['authenticated', 'anonymous', 'administrator'],
    required: false,
  }
];

export default questions;
