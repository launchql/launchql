import { change as schema } from './schema'
import { searchSchemas } from '@launchql/db-utils'

export const requires = (res) => [
  schema(res)
]

export const change = ({ schema, table }) => [
  'schemas',
  schema,
  'tables',
  table,
  'table'
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
    type: 'string',
    name: 'table',
    message: 'enter a table name',
    required: true
  }
]

export default questions
