import { defaultLaunchQLGenOptions, mergeLaunchQLGenOptions } from '../src'

describe('mergeLaunchQLGenOptions', () => {
  it('deep merges input/output/documents/features', () => {
    const base = { ...defaultLaunchQLGenOptions }
    const overrides = {
      input: { schema: 'schema.graphql', headers: { Authorization: 'Bearer TOKEN' } },
      output: {
        root: 'dist/custom-root',
        typesFile: base.output.typesFile,
        operationsDir: base.output.operationsDir,
        sdkFile: base.output.sdkFile,
        reactQueryFile: base.output.reactQueryFile
      },
      documents: { format: 'ts', convention: 'camelUpper', allowQueries: ['getActionQuery'] },
      features: { emitSdk: false, emitReactQuery: false }
    } as any

    const merged = mergeLaunchQLGenOptions(base, overrides)

    expect(merged.input.schema).toBe('schema.graphql')
    expect(merged.input.endpoint).toBe('')
    expect(merged.input.headers?.Authorization).toBe('Bearer TOKEN')

    expect(merged.output.root).toBe('dist/custom-root')
    expect(merged.output.typesFile).toBe('types/generated.ts')
    expect(merged.output.operationsDir).toBe('operations')

    expect(merged.documents.format).toBe('ts')
    expect(merged.documents.convention).toBe('camelUpper')
    expect(merged.documents.allowQueries).toContain('getActionQuery')

    expect(merged.features.emitSdk).toBe(false)
    expect(merged.features.emitTypes).toBe(true)
    expect(merged.features.emitOperations).toBe(true)
  })

  it('does not include reactQuery overrides (current behavior)', () => {
    const base = { ...defaultLaunchQLGenOptions }
    const overrides = { reactQuery: { fetcher: 'fetch', legacyMode: true, exposeDocument: true } } as any
    const merged = mergeLaunchQLGenOptions(base, overrides)
    expect((merged as any).reactQuery).toBeUndefined()
    // base is not mutated
    expect(base.reactQuery?.fetcher).toBe('graphql-request')
  })
})
