import { change as schema } from './schema'
import { searchSchemas } from '@launchql/db-utils'

export const requires = (res) => [
  schema(res)
]

export const change = ({ schema, view }) => [
  'schemas',
  schema,
  'views',
  view,
  'view'
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
    name: 'view',
    message: 'enter a view name',
    required: true
  }
]

export default questions
