import { promises as fs } from 'fs'
import { join, dirname, isAbsolute, resolve } from 'path'
import { buildSchema, buildClientSchema, graphql, getIntrospectionQuery, print } from 'graphql'
const inflection: any = require('inflection')
import { generate as generateGql, GqlMap } from './gql'
import { parseGraphQuery } from 'introspectron'
import { defaultLaunchQLGenOptions, LaunchQLGenOptions, mergeLaunchQLGenOptions } from './options'
import { codegen as runCoreCodegen } from '@graphql-codegen/core'
import * as typescriptPlugin from '@graphql-codegen/typescript'
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations'
import * as typescriptGraphqlRequestPlugin from '@graphql-codegen/typescript-graphql-request'
import * as typescriptReactQueryPlugin from '@graphql-codegen/typescript-react-query'
import { GraphQLClient } from 'graphql-request'

function getFilename(key: string, convention: LaunchQLGenOptions['documents']['convention']) {
  if (convention === 'underscore') return inflection.underscore(key)
  if (convention === 'dashed') return inflection.underscore(key).replace(/_/g, '-')
  if (convention === 'camelUpper') return inflection.camelize(key, false)
  return key
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

async function readFileUTF8(p: string) {
  return fs.readFile(p, 'utf8')
}

async function writeFileUTF8(p: string, content: string) {
  await ensureDir(dirname(p))
  await fs.writeFile(p, content, 'utf8')
}

async function getIntrospectionFromSDL(schemaPath: string) {
  const sdl = await readFileUTF8(schemaPath)
  const schema = buildSchema(sdl)
  const q = getIntrospectionQuery()
  const res = await graphql({ schema, source: q })
  return res.data as any
}

async function getIntrospectionFromEndpoint(endpoint: string, headers?: Record<string, string>) {
  const client = new GraphQLClient(endpoint, { headers })
  const q = getIntrospectionQuery()
  const res = await client.request<any>(q)
  return res as any
}

function generateKeyedObjFromGqlMap(gqlMap: GqlMap): Record<string, string> {
  const gen = generateGql(gqlMap)
  return Object.entries(gen).reduce<Record<string, string>>((acc, [key, val]) => {
    if (val?.ast) acc[key] = print(val.ast)
    return acc
  }, {})
}

function applyQueryFilters(map: GqlMap, docs: LaunchQLGenOptions['documents']): GqlMap {
  const allow = (docs.allowQueries || []).filter(Boolean)
  const exclude = (docs.excludeQueries || []).filter(Boolean)
  const patterns = (docs.excludePatterns || []).filter(Boolean)

  let keys = Object.keys(map)
  if (allow.length > 0) keys = keys.filter((k) => allow.includes(k))
  if (exclude.length > 0) keys = keys.filter((k) => !exclude.includes(k))
  if (patterns.length > 0) {
    const regs = patterns.map((p) => {
      try {
        return new RegExp(p)
      } catch {
        return null
      }
    }).filter((r): r is RegExp => !!r)
    keys = keys.filter((k) => !regs.some((r) => r.test(k)))
  }

  return keys.reduce<GqlMap>((acc, k) => {
    acc[k] = map[k]
    return acc
  }, {})
}

async function writeOperationsDocuments(docs: Record<string, string>, dir: string, format: 'gql' | 'ts', convention: LaunchQLGenOptions['documents']['convention']) {
  await ensureDir(dir)
  const index: string[] = []
  for (const key of Object.keys(docs)) {
    const filename = getFilename(key, convention) + (format === 'ts' ? '.ts' : '.gql')
    if (format === 'ts') {
      const code = `import gql from 'graphql-tag'\nexport const ${key} = gql\`\n${docs[key]}\n\``
      await writeFileUTF8(join(dir, filename), code)
      index.push(`export * from './${filename}'`)
    } else {
      await writeFileUTF8(join(dir, filename), docs[key])
    }
  }
  if (format === 'ts') await writeFileUTF8(join(dir, 'index.ts'), index.sort().join('\n'))
}

export async function runCodegen(opts: LaunchQLGenOptions, cwd: string) {
  const options: LaunchQLGenOptions = {
    input: { ...(defaultLaunchQLGenOptions.input), ...(opts.input || {}) },
    output: { ...(defaultLaunchQLGenOptions.output), ...(opts.output || {}) },
    documents: { ...(defaultLaunchQLGenOptions.documents), ...(opts.documents || {}) },
    features: { ...(defaultLaunchQLGenOptions.features), ...(opts.features || {}) }
  }

  const root = join(cwd, options.output.root)
  const typesFile = join(root, options.output.typesFile)
  const operationsDir = join(root, options.output.operationsDir)
  const sdkFile = join(root, options.output.sdkFile)
  const reactQueryFile = join(root, options.output.reactQueryFile || 'react-query.ts')
  const hasSchemaPath = !!options.input.schema && options.input.schema.trim() !== ''
  const hasEndpoint = !!options.input.endpoint && options.input.endpoint.trim() !== ''
  const schemaPath = hasSchemaPath ? (isAbsolute(options.input.schema) ? options.input.schema : resolve(cwd, options.input.schema)) : ''

  const introspection = hasEndpoint
    ? await getIntrospectionFromEndpoint(options.input.endpoint as string, options.input.headers || {})
    : await getIntrospectionFromSDL(schemaPath)
  const { queries, mutations } = parseGraphQuery(introspection)
  const gqlMap: GqlMap = applyQueryFilters({ ...queries, ...mutations }, options.documents)
  let docs: Record<string, string> = {}

  const schema = hasEndpoint
    ? buildClientSchema(introspection as any)
    : buildSchema(await readFileUTF8(schemaPath))

  if (options.features.emitOperations || options.features.emitSdk) {
    docs = generateKeyedObjFromGqlMap(gqlMap)
    await writeOperationsDocuments(docs, operationsDir, options.documents.format, options.documents.convention)
  }

  if (options.features.emitTypes) {
    const typesContent = await runCoreCodegen({
      filename: typesFile,
      schema: schema as any,
      documents: [],
      config: {},
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: typescriptPlugin as any }
    })
    await writeFileUTF8(typesFile, typesContent)
  }

  if (options.features.emitSdk) {
    const documents: { location: string; document: any }[] = []
    for (const [name, content] of Object.entries(docs)) {
      try {
        const doc = require('graphql').parse(content)
        documents.push({ location: name, document: doc })
      } catch (e) {}
    }
    const sdkContent = await runCoreCodegen({
      filename: sdkFile,
      schema: schema as any,
      documents,
      config: {},
      plugins: [
        { typescript: {} },
        { 'typescript-operations': {} },
        { 'typescript-graphql-request': {} }
      ],
      pluginMap: {
        typescript: typescriptPlugin as any,
        'typescript-operations': typescriptOperationsPlugin as any,
        'typescript-graphql-request': typescriptGraphqlRequestPlugin as any
      }
    })
    await writeFileUTF8(sdkFile, sdkContent)
  }

  if (options.features.emitReactQuery) {
    const documents: { location: string; document: any }[] = []
    for (const [name, content] of Object.entries(docs)) {
      try {
        const doc = require('graphql').parse(content)
        documents.push({ location: name, document: doc })
      } catch (e) {}
    }
    const rqConfig = {
      fetcher: options.reactQuery?.fetcher || 'graphql-request',
      legacyMode: options.reactQuery?.legacyMode || false,
      exposeDocument: options.reactQuery?.exposeDocument || false,
      addInfiniteQuery: options.reactQuery?.addInfiniteQuery || false
    } as any
    const rqContent = await runCoreCodegen({
      filename: reactQueryFile,
      schema: schema as any,
      documents,
      config: rqConfig,
      plugins: [
        { typescript: {} },
        { 'typescript-operations': {} },
        { 'typescript-react-query': rqConfig }
      ],
      pluginMap: {
        typescript: typescriptPlugin as any,
        'typescript-operations': typescriptOperationsPlugin as any,
        'typescript-react-query': typescriptReactQueryPlugin as any
      }
    })
    await writeFileUTF8(reactQueryFile, rqContent)
  }

  return { root, typesFile, operationsDir, sdkFile }
}

export async function runCodegenFromJSONConfig(configPath: string, cwd: string) {
  const path = isAbsolute(configPath) ? configPath : resolve(cwd, configPath)
  const content = await readFileUTF8(path)
  let overrides: any = {}
  try {
    overrides = JSON.parse(content)
  } catch (e) {
    throw new Error('Invalid JSON config: ' + e)
  }
  const merged = mergeLaunchQLGenOptions(defaultLaunchQLGenOptions, overrides as any)
  return runCodegen(merged as LaunchQLGenOptions, cwd)
}
