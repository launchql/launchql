import { change as schema } from './schema'

export const requires = (res) => []

export const change = ({ procedure }) => [
  'procedures',
  procedure
]

const questions = [
  {
    type: 'string',
    name: 'procedure',
    message: 'enter a procedure name',
    required: true
  },
  {
    type: 'list',
    name: 'stability',
    message: 'choose the stability',
    choices: ['STABLE', 'VOLATILE', 'IMMUTABLE', 'IMMUTABLE STRICT'],
    required: true
  },
  {
    type: 'list',
    name: 'lang',
    message: 'choose the language',
    choices: ['sql', 'plpgsql', 'plv8'],
    required: true
  }
]

export default questions
