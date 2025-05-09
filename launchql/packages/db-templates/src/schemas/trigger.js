import { change as schema } from './schema'
import { change as table } from './table'
import { searchSchemas } from '@launchql/db-utils'
import { searchTables } from '@launchql/db-utils'

export const requires = (res) => [
  schema(res),
  table(res)
]

export const change = ({
  schema,
  table,
  triggername,
}) => [
  'schemas',
  schema,
  'tables',
  table,
  'triggers',
  triggername
]

const questions = [
  {
    type: 'autocomplete',
    name: 'schema',
    message: 'enter a schema name',
    source: searchSchemas,
    required: true
  },
  {
    type: 'autocomplete',
    name: 'table',
    message: 'enter a table name',
    source: searchTables,
    required: true
  },
  {
    type: 'string',
    name: 'triggername',
    message: 'enter a trigger name',
    required: true
  },
  {
    type: 'list',
    name: 'when',
    message: 'choose when',
    choices: ['BEFORE', 'AFTER', 'INSTEAD OF'],
    required: true
  },
  {
    type: 'checkbox',
    name: 'op',
    message: 'choose ops',
    choices: ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE'],
    required: true
  },
  {
    type: 'confirm',
    name: 'procedure',
    message: 'add procedure for the trigger?',
    required: true
  }
]

export default questions
