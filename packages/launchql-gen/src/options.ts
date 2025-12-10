export type DocumentFormat = 'gql' | 'ts'
export type FilenameConvention = 'underscore' | 'dashed' | 'camelcase' | 'camelUpper'

export interface LaunchQLGenOptions {
  input: {
    schema: string
    endpoint?: string
    headers?: Record<string, string>
  }
  output: {
    root: string
    typesFile: string
    operationsDir: string
    sdkFile: string
    reactQueryFile?: string
  }
  documents: {
    format: DocumentFormat
    convention: FilenameConvention
    allowQueries?: string[]
    excludeQueries?: string[]
    excludePatterns?: string[]
  }
  features: {
    emitTypes: boolean
    emitOperations: boolean
    emitSdk: boolean
    emitReactQuery?: boolean
  }
  reactQuery?: {
    fetcher?: 'fetch' | 'graphql-request' | 'hardcoded' | string
    legacyMode?: boolean
    exposeDocument?: boolean
    addInfiniteQuery?: boolean
  }
}

export const defaultLaunchQLGenOptions: LaunchQLGenOptions = {
  input: { schema: '', endpoint: '', headers: {} },
  output: {
    root: 'packages/launchql-gen/dist',
    typesFile: 'types/generated.ts',
    operationsDir: 'operations',
    sdkFile: 'sdk.ts',
    reactQueryFile: 'react-query.ts'
  },
  documents: { format: 'gql', convention: 'dashed', allowQueries: [], excludeQueries: [], excludePatterns: [] },
  features: { emitTypes: true, emitOperations: true, emitSdk: true, emitReactQuery: true },
  reactQuery: { fetcher: 'graphql-request', legacyMode: false, exposeDocument: false, addInfiniteQuery: false }
}

export function mergeLaunchQLGenOptions(base: LaunchQLGenOptions, overrides: Partial<LaunchQLGenOptions>): LaunchQLGenOptions {
  return {
    input: { ...(base.input || {}), ...(overrides.input || {}) },
    output: { ...(base.output || {}), ...(overrides.output || {}) },
    documents: { ...(base.documents || {}), ...(overrides.documents || {}) },
    features: { ...(base.features || {}), ...(overrides.features || {}) }
  } as LaunchQLGenOptions
}
