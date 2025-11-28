import { CLIOptions, Inquirerer } from 'inquirerer'
import { ParsedArgs } from 'minimist'
import { promises as fs } from 'fs'
import { buildSchemaSDL, fetchEndpointSchemaSDL } from '@launchql/server'

const usage = `
LaunchQL Get GraphQL Schema:

  lql get-graphql-schema [OPTIONS]

Options:
  --help, -h              Show this help message
  --database <name>       Database name (default: launchql)
  --schemas <list>        Comma-separated schemas to include
  --endpoint <url>        GraphQL endpoint to fetch schema via introspection
  --headerHost <host>     Optional Host header to send with endpoint requests
  --auth <token>          Optional Authorization header value (e.g., "Bearer 123")
  --header "Name: Value"  Optional HTTP header; repeat to add multiple headers
  --out <path>            Output file path (default: print to stdout)
`

const defaultSchemas = [
  'collections_public',
  'dashboard_public'
]

export default async (
  argv: Partial<ParsedArgs>,
  prompter: Inquirerer,
  _options: CLIOptions
) => {
  if (argv.help || argv.h) {
    console.log(usage)
    process.exit(0)
  }

  const endpoint = (argv.endpoint as string) ?? ''
  const headerHost = (argv.headerHost as string) ?? ''
  const auth = (argv.auth as string) ?? ''
  const database = (argv.database as string) ?? 'launchql'
  const schemasArg = (argv.schemas as string) ?? defaultSchemas.join(',')
  const out = (argv.out as string) ?? ''

  const headerArg = argv.header as string | string[] | undefined
  const headerList = Array.isArray(headerArg) ? headerArg : headerArg ? [headerArg] : []
  const headers: Record<string, string> = {}
  for (const h of headerList) {
    const idx = typeof h === 'string' ? h.indexOf(':') : -1
    if (idx <= 0) continue
    const name = h.slice(0, idx).trim()
    const value = h.slice(idx + 1).trim()
    if (!name) continue
    headers[name] = value
  }

  const schemas = schemasArg.split(',').map(s => s.trim()).filter(Boolean)

  let sdl: string
  if (endpoint) {
    const opts: any = {}
    if (headerHost) opts.headerHost = headerHost
    if (auth) opts.auth = auth
    if (Object.keys(headers).length) opts.headers = headers
    sdl = await (fetchEndpointSchemaSDL as any)(endpoint, opts)
  } else {
    // The server package already depends on postgraphile and graphql,
    // and exporting a reusable programmatic builder from there
    // avoids adding new dependencies to cli and prevents duplication.
    sdl = await buildSchemaSDL({ database, schemas })
  }

  if (out) {
    await fs.writeFile(out, sdl, 'utf8')
    console.log(`Wrote schema SDL to ${out}`)
  } else {
    process.stdout.write(sdl + '\n')
  }
}