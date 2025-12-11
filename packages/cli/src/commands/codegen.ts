import { CLIOptions, Inquirerer } from 'inquirerer'
import { ParsedArgs } from 'minimist'
import { promises as fs } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import { runCodegen, defaultLaunchQLGenOptions, mergeLaunchQLGenOptions, LaunchQLGenOptions } from '@launchql/codegen'
import { fetchEndpointSchemaSDL } from '@launchql/server'

const usage = `
LaunchQL Codegen:

  lql codegen [OPTIONS]

Options:
  --help, -h                 Show this help message
  --config <path>            Config file (json|yaml)
  --schema <path>            Schema SDL file path
  --endpoint <url>           GraphQL endpoint to fetch schema via introspection
  --headerHost <host>        Optional Host header to send with endpoint requests
  --auth <token>             Optional Authorization header value (e.g., "Bearer 123")
  --header "Name: Value"    Optional HTTP header; repeat to add multiple headers
  --out <dir>                Output root directory (default: packages/launchql-gen/dist)
  --format <gql|ts>          Document format (default: gql)
  --convention <style>       Filename convention (dashed|underscore|camelcase|camelUpper)
  --emitTypes <bool>         Emit types (default: true)
  --emitOperations <bool>    Emit operations (default: true)
  --emitSdk <bool>           Emit sdk (default: true)
  --allowQuery <name>        Only generate for this root field (repeatable)
  --excludeQuery <name>      Exclude this root field (repeatable)
  --excludePattern <regex>   Exclude fields matching regex (repeatable)
`

function parseBool(v: any, d: boolean): boolean {
  if (v === undefined) return d
  if (typeof v === 'boolean') return v
  const s = String(v).toLowerCase()
  if (s === 'true') return true
  if (s === 'false') return false
  return d
}

async function loadConfig(path: string): Promise<Partial<LaunchQLGenOptions>> {
  const content = await fs.readFile(path, 'utf8')
  if (/\.ya?ml$/i.test(path)) return yaml.load(content) as any
  if (/\.json$/i.test(path)) return JSON.parse(content)
  return {}
}

export default async (
  argv: Partial<ParsedArgs>,
  _prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(usage)
    process.exit(0)
  }

  const cwd = (argv.cwd as string) || process.cwd()
  const configPath = (argv.config as string) || ''

  let fileOpts: Partial<LaunchQLGenOptions> = {}
  if (configPath) fileOpts = await loadConfig(configPath)

  const overrides: Partial<LaunchQLGenOptions> = {}
  if (argv.schema) overrides.input = { ...(overrides.input || {}), schema: String(argv.schema) }
  if (argv.endpoint) overrides.input = { ...(overrides.input || {}), endpoint: String(argv.endpoint) } as any
  const headerHost = (argv.headerHost as string) ?? ''
  const auth = (argv.auth as string) ?? ''
  const headerArg = argv.header as string | string[] | undefined
  const headerList = Array.isArray(headerArg) ? headerArg : headerArg ? [headerArg] : []
  const headers: Record<string, string> = {}
  if (auth) headers['Authorization'] = auth
  for (const h of headerList) {
    const idx = typeof h === 'string' ? h.indexOf(':') : -1
    if (idx <= 0) continue
    const name = h.slice(0, idx).trim()
    const value = h.slice(idx + 1).trim()
    if (!name) continue
    headers[name] = value
  }
  if (Object.keys(headers).length) overrides.input = { ...(overrides.input || {}), headers } as any
  if (argv.out) overrides.output = { ...(overrides.output || {}), root: String(argv.out) } as any
  if (argv.format) overrides.documents = { ...(overrides.documents || {}), format: String(argv.format) as any } as any
  if (argv.convention) overrides.documents = { ...(overrides.documents || {}), convention: String(argv.convention) as any } as any
  const allowQueryArg = argv.allowQuery as string | string[] | undefined
  const excludeQueryArg = argv.excludeQuery as string | string[] | undefined
  const excludePatternArg = argv.excludePattern as string | string[] | undefined
  const allowQueries = Array.isArray(allowQueryArg) ? allowQueryArg : allowQueryArg ? [String(allowQueryArg)] : []
  const excludeQueries = Array.isArray(excludeQueryArg) ? excludeQueryArg : excludeQueryArg ? [String(excludeQueryArg)] : []
  const excludePatterns = Array.isArray(excludePatternArg) ? excludePatternArg : excludePatternArg ? [String(excludePatternArg)] : []
  if (allowQueries.length || excludeQueries.length || excludePatterns.length) {
    overrides.documents = { ...(overrides.documents || {}), allowQueries, excludeQueries, excludePatterns } as any
  }
  const emitTypes = parseBool(argv.emitTypes, true)
  const emitOperations = parseBool(argv.emitOperations, true)
  const emitSdk = parseBool(argv.emitSdk, true)
  overrides.features = { emitTypes, emitOperations, emitSdk }

  const merged = mergeLaunchQLGenOptions(defaultLaunchQLGenOptions, fileOpts as any)
  const finalOptions = mergeLaunchQLGenOptions(merged, overrides)

  if (finalOptions.input.endpoint && headerHost) {
    const opts: any = {}
    if (headerHost) opts.headerHost = headerHost
    if (auth) opts.auth = auth
    if (Object.keys(headers).length) opts.headers = headers
    const sdl = await (fetchEndpointSchemaSDL as any)(String(finalOptions.input.endpoint), opts)
    const tmpSchemaPath = join(cwd, '.lql-codegen-schema.graphql')
    await fs.writeFile(tmpSchemaPath, sdl, 'utf8')
    finalOptions.input.schema = tmpSchemaPath as any
    ;(finalOptions.input as any).endpoint = ''
  }

  const hasSchema = !!finalOptions.input.schema && String(finalOptions.input.schema).trim() !== ''
  const hasEndpoint = !!(finalOptions.input as any).endpoint && String((finalOptions.input as any).endpoint).trim() !== ''
  if (!hasSchema && !hasEndpoint) {
    console.error('Missing --schema or --endpoint or config.input')
    process.exit(1)
  }

  const result = await runCodegen(finalOptions, cwd)
  console.log(`Generated at ${join(result.root)}`)
}
