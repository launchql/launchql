import { change as schema } from './schema'
import { searchSchemas } from '@launchql/db-utils'

export const requires = (res) => [
  schema(res)
]

export const change = ({ schema, type }) => [
  'schemas',
  schema,
  'types',
  type
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
    name: 'type',
    message: 'enter a type name',
    required: true
  }
]

export default questions
