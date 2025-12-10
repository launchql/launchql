import { print } from 'graphql'
import { createOne, patchOne, deleteOne, createMutation, MutationSpec } from '../src'

describe('gql mutation builders', () => {
  it('createMutation: builds non-null vars and selects scalar outputs', () => {
    const mutation: MutationSpec = {
      model: 'Actions',
      properties: {
        input: {
          properties: {
            foo: { type: 'String' },
            list: { type: 'Int', isArray: true, isArrayNotNull: true }
          }
        }
      },
      outputs: [
        { name: 'clientMutationId', type: { kind: 'SCALAR' } },
        { name: 'node', type: { kind: 'OBJECT' } }
      ]
    }

    const res = createMutation({ operationName: 'customMutation', mutation })
    expect(res).toBeDefined()
    const s = print(res!.ast)
    expect(s).toContain('mutation customMutationMutation')
    expect(s).toContain('$foo: String!')
    expect(s).toContain('$list: [Int!]!')
    expect(s).toContain('clientMutationId')
    expect(s).not.toContain('node')
  })

  it('createOne: omits non-mutable props and uses non-null types', () => {
    const mutation: MutationSpec = {
      model: 'Actions',
      properties: {
        input: {
          properties: {
            action: {
              properties: {
                name: { type: 'String', isNotNull: true },
                createdAt: { type: 'Datetime', isNotNull: true }
              }
            }
          }
        }
      }
    }

    const res = createOne({ operationName: 'createAction', mutation })
    expect(res).toBeDefined()
    const s = print(res!.ast)
    expect(s).toContain('mutation createActionMutation')
    expect(s).toContain('$name: String!')
    expect(s).not.toContain('$createdAt')
    expect(s).toContain('clientMutationId')
  })

  it('patchOne: includes patch-by vars and optional patch attrs', () => {
    const mutation: MutationSpec = {
      model: 'Actions',
      properties: {
        input: {
          properties: {
            id: { type: 'UUID', isNotNull: true },
            patch: {
              properties: {
                name: { type: 'String' },
                approved: { type: 'Boolean' },
                createdAt: { type: 'Datetime' }
              }
            }
          }
        }
      }
    }

    const res = patchOne({ operationName: 'patchAction', mutation })
    expect(res).toBeDefined()
    const s = print(res!.ast)
    expect(s).toContain('mutation patchActionMutation')
    expect(s).toContain('$id: UUID!')
    expect(s).toContain('$name: String')
    expect(s).toContain('$approved: Boolean')
    expect(s).not.toContain('createdAt')
    expect(s).toContain('clientMutationId')
  })

  it('deleteOne: builds vars with non-null list wrappers for arrays', () => {
    const mutation: MutationSpec = {
      model: 'Actions',
      properties: {
        input: {
          properties: {
            id: { type: 'UUID', isNotNull: true },
            tags: { type: 'String', isArray: true }
          }
        }
      }
    }

    const res = deleteOne({ operationName: 'deleteAction', mutation })
    expect(res).toBeDefined()
    const s = print(res!.ast)
    expect(s).toContain('mutation deleteActionMutation')
    expect(s).toContain('$id: UUID!')
    expect(s).toContain('$tags: [String]!')
    expect(s).toContain('clientMutationId')
  })
})
