import { printSchema, GraphQLSchema, getIntrospectionQuery, buildClientSchema } from 'graphql'
import { getGraphileSettings } from 'graphile-settings'
import { getPgPool } from 'pg-cache'
import { createPostGraphileSchema, PostGraphileOptions } from 'postgraphile'
import * as http from 'node:http'
import * as https from 'node:https'

export type BuildSchemaOptions = {
  database?: string;
  schemas: string[];
  graphile?: Partial<PostGraphileOptions>;
};

// Build GraphQL Schema SDL directly from Postgres using PostGraphile, without HTTP.
export async function buildSchemaSDL(opts: BuildSchemaOptions): Promise<string> {
  const database = opts.database ?? 'launchql'
  const schemas = Array.isArray(opts.schemas) ? opts.schemas : []

  const settings = getGraphileSettings({
    graphile: {
      schema: schemas,
      ...(opts.graphile ?? {})
    }
  })

  const pgPool = getPgPool({ database })
  const schema: GraphQLSchema = await createPostGraphileSchema(pgPool, schemas, settings)
  return printSchema(schema)
}

// Fetch GraphQL Schema SDL from a running GraphQL endpoint via introspection.
// This centralizes GraphQL client usage in the server package to avoid duplicating deps in the CLI.
export async function fetchEndpointSchemaSDL(endpoint: string, opts?: { headerHost?: string, headers?: Record<string, string>, auth?: string }): Promise<string> {
  const url = new URL(endpoint)
  const requestUrl = url

  const introspectionQuery = getIntrospectionQuery({ descriptions: true })
  const postData = JSON.stringify({
    query: introspectionQuery,
    variables: null,
    operationName: 'IntrospectionQuery',
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Content-Length': String(Buffer.byteLength(postData)),
  }
  if (opts?.headerHost) {
    headers['Host'] = opts.headerHost
  }
  if (opts?.auth) {
    headers['Authorization'] = opts.auth
  }
  if (opts?.headers) {
    for (const [key, value] of Object.entries(opts.headers)) {
      headers[key] = value
    }
  }

  const isHttps = requestUrl.protocol === 'https:'
  const lib = isHttps ? https : http

  const responseData: string = await new Promise((resolve, reject) => {
    const req = lib.request({
      hostname: requestUrl.hostname,
      port: (requestUrl.port ? Number(requestUrl.port) : (isHttps ? 443 : 80)),
      path: requestUrl.pathname,
      method: 'POST',
      headers,
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} – ${data}`))
          return
        }
        resolve(data)
      })
    })
    req.on('error', (err) => reject(err))
    req.write(postData)
    req.end()
  })

  let json: any
  try {
    json = JSON.parse(responseData)
  } catch (e) {
    throw new Error(`Failed to parse response: ${responseData}`)
  }

  if (json.errors) {
    throw new Error('Introspection returned errors')
  }
  if (!json.data) {
    throw new Error('No data in introspection response')
  }

  const schema = buildClientSchema(json.data as any)
  return printSchema(schema)
}