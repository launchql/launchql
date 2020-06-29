export const change = ({ schema }) => [
  'schemas',
  schema,
  'schema'
]

export const requires = (res) => []

const questions = [
  {
    type: 'string',
    name: 'schema',
    message: 'enter a schema name',
    required: true
  }
]

export default questions
