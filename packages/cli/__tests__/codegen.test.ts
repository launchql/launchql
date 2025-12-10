import path from 'path'
import type { ParsedArgs } from 'minimist'
import codegenCommand from '../src/commands/codegen'

jest.mock('@launchql/codegen', () => {
  const deepMerge = (a: any, b: any) => ({
    ...a,
    ...b,
    input: { ...(a?.input || {}), ...(b?.input || {}) },
    output: { ...(a?.output || {}), ...(b?.output || {}) },
    documents: { ...(a?.documents || {}), ...(b?.documents || {}) },
    features: { ...(a?.features || {}), ...(b?.features || {}) }
  })
  return {
    runCodegen: jest.fn(async () => ({ root: '/tmp/generated', typesFile: '', operationsDir: '', sdkFile: '' })),
    defaultLaunchQLGenOptions: { input: {}, output: { root: 'packages/launchql-gen/dist' }, documents: {}, features: { emitTypes: true, emitOperations: true, emitSdk: true } },
    mergeLaunchQLGenOptions: deepMerge
  }
})

jest.mock('@launchql/server', () => ({
  fetchEndpointSchemaSDL: jest.fn(async () => 'schema { query: Query } type Query { hello: String }')
}))

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(''),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined)
  }
}))

describe('codegen command', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('prints usage and exits with code 0 when --help is set', async () => {
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {})
    const spyExit = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => { throw new Error('exit:' + code) }) as any)

    const argv: Partial<ParsedArgs> = { help: true }

    await expect(codegenCommand(argv, {} as any, {} as any)).rejects.toThrow('exit:0')
    expect(spyLog).toHaveBeenCalled()
    const first = (spyLog.mock.calls[0]?.[0] as string) || ''
    expect(first).toContain('LaunchQL Codegen')

    spyLog.mockRestore()
    spyExit.mockRestore()
  })

  it('fetches schema via endpoint, writes temp SDL, and runs codegen', async () => {
    const { fetchEndpointSchemaSDL } = require('@launchql/server')
    const { runCodegen } = require('@launchql/codegen')
    const fs = require('fs').promises
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {})

    const cwd = process.cwd()
    const argv: Partial<ParsedArgs> = {
      endpoint: 'http://localhost:3000/graphql',
      headerHost: 'meta8.localhost',
      auth: 'Bearer testtoken',
      header: 'X-Test: 1',
      out: 'packages/launchql-gen/dist'
    }

    await codegenCommand(argv, {} as any, {} as any)

    expect(fetchEndpointSchemaSDL).toHaveBeenCalledWith('http://localhost:3000/graphql', expect.objectContaining({ headerHost: 'meta8.localhost', auth: 'Bearer testtoken', headers: expect.objectContaining({ 'X-Test': '1' }) }))
    expect(fs.writeFile).toHaveBeenCalledWith(path.join(cwd, '.lql-codegen-schema.graphql'), expect.any(String), 'utf8')
    expect(runCodegen).toHaveBeenCalled()
    // ensure it prints the output root location
    expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('/tmp/generated'))

    spyLog.mockRestore()
  })

  it('uses local schema when --schema is provided and runs codegen', async () => {
    const { fetchEndpointSchemaSDL } = require('@launchql/server')
    const { runCodegen } = require('@launchql/codegen')
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {})

    const schemaPath = path.join(process.cwd(), 'local-schema.graphql')
    const argv: Partial<ParsedArgs> = {
      schema: schemaPath,
      out: 'packages/launchql-gen/dist'
    }

    await codegenCommand(argv, {} as any, {} as any)

    expect(fetchEndpointSchemaSDL).not.toHaveBeenCalled()
    expect(runCodegen).toHaveBeenCalled()
    expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('/tmp/generated'))
    spyLog.mockRestore()
  })

  it('loads config file and merges overrides', async () => {
    const { runCodegen, mergeLaunchQLGenOptions } = require('@launchql/codegen')
    const fs = require('fs').promises
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {})

    const cfg = {
      input: { schema: 'from-config.graphql' },
      documents: { format: 'ts' },
      output: { root: 'custom-root' },
      features: { emitTypes: true, emitOperations: true, emitSdk: false }
    }
    ;(fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(cfg))

    const argv: Partial<ParsedArgs> = {
      config: '/tmp/codegen.json',
      out: 'packages/launchql-gen/dist',
      emitSdk: false
    }

    await codegenCommand(argv, {} as any, {} as any)

    expect(runCodegen).toHaveBeenCalled()
    const call = (runCodegen as jest.Mock).mock.calls[0]
    const options = call[0]
    expect(options.input.schema).toBe('from-config.graphql')
    expect(options.output.root).toBe('packages/launchql-gen/dist')
    expect(options.documents.format).toBe('ts')
    expect(options.features.emitSdk).toBe(false)
    expect(spyLog).toHaveBeenCalledWith(expect.stringContaining('/tmp/generated'))
    spyLog.mockRestore()
  })
})
