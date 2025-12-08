import fs from 'fs';
import os from 'os';
import path from 'path';
import runGetGraphqlSchema from '../src/commands/get-graphql-schema';

jest.mock('@launchql/server', () => ({
  buildSchemaSDL: jest.fn(async () => 'type Query { hello: String }\n'),
  fetchEndpointSchemaSDL: jest.fn(async () => 'type Query { greeting: String }\n')
}));

jest.setTimeout(15000);

describe('lql get-graphql-schema (mocked)', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-cli-test-'));
  const outDbFile = path.join(tempDir, 'schema.db.graphql');
  const outEndpointFile = path.join(tempDir, 'schema.endpoint.graphql');
  const outEndpointHeaderHostFile = path.join(tempDir, 'schema.endpoint.headerhost.graphql');
  const outEndpointAuthFile = path.join(tempDir, 'schema.endpoint.auth.graphql');
  const outEndpointHeadersFile = path.join(tempDir, 'schema.endpoint.headers.graphql');
  const outEndpointAuthAndHeaderFile = path.join(tempDir, 'schema.endpoint.auth_and_header.graphql');

  const prompter: any = {
    prompt: async (argv: any) => argv,
    close: jest.fn()
  };

  afterAll(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {
      // ignore
    }
  });

  it('writes SDL to file when building from database', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      database: 'mockdb',
      schemas: 'public',
      out: outDbFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    expect(fs.existsSync(outDbFile)).toBe(true);
    const sdl = fs.readFileSync(outDbFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('hello');
  });

  it('writes SDL to file when fetching from endpoint', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      endpoint: 'http://localhost:5555/graphql',
      out: outEndpointFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    expect(fs.existsSync(outEndpointFile)).toBe(true);
    const sdl = fs.readFileSync(outEndpointFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('greeting');
  });

  it('passes headerHost to fetchEndpointSchemaSDL when provided', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      endpoint: 'http://localhost:5555/graphql',
      headerHost: 'meta8.localhost',
      out: outEndpointHeaderHostFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    // Verify file written
    expect(fs.existsSync(outEndpointHeaderHostFile)).toBe(true);
    const sdl = fs.readFileSync(outEndpointHeaderHostFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('greeting');

    // Verify the mocked function received the headerHost argument
    const server = jest.requireMock('@launchql/server') as any;
    expect(server.fetchEndpointSchemaSDL).toHaveBeenCalled();
    const lastCall = server.fetchEndpointSchemaSDL.mock.calls[server.fetchEndpointSchemaSDL.mock.calls.length - 1];
    expect(lastCall[0]).toBe('http://localhost:5555/graphql');
    expect(lastCall[1]).toEqual({ headerHost: 'meta8.localhost' });
  });

  it('passes auth to fetchEndpointSchemaSDL when provided', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      endpoint: 'http://localhost:5555/graphql',
      auth: 'Bearer 123',
      out: outEndpointAuthFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    // Verify file written
    expect(fs.existsSync(outEndpointAuthFile)).toBe(true);
    const sdl = fs.readFileSync(outEndpointAuthFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('greeting');

    // Verify the mocked function received the auth argument
    const server = jest.requireMock('@launchql/server') as any;
    expect(server.fetchEndpointSchemaSDL).toHaveBeenCalled();
    const lastCall = server.fetchEndpointSchemaSDL.mock.calls[server.fetchEndpointSchemaSDL.mock.calls.length - 1];
    expect(lastCall[0]).toBe('http://localhost:5555/graphql');
    expect(lastCall[1]).toEqual({ auth: 'Bearer 123' });
  });

  it('passes repeated --header values to fetchEndpointSchemaSDL when provided', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      endpoint: 'http://localhost:5555/graphql',
      header: ['X-Mode: fast', 'Authorization: Bearer ABC'],
      out: outEndpointHeadersFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    // Verify file written
    expect(fs.existsSync(outEndpointHeadersFile)).toBe(true);
    const sdl = fs.readFileSync(outEndpointHeadersFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('greeting');

    // Verify the mocked function received the headers argument
    const server = jest.requireMock('@launchql/server') as any;
    expect(server.fetchEndpointSchemaSDL).toHaveBeenCalled();
    const lastCall = server.fetchEndpointSchemaSDL.mock.calls[server.fetchEndpointSchemaSDL.mock.calls.length - 1];
    expect(lastCall[0]).toBe('http://localhost:5555/graphql');
    expect(lastCall[1]).toEqual({ headers: { 'X-Mode': 'fast', Authorization: 'Bearer ABC' } });
  });

  it('forwards both auth and header to fetchEndpointSchemaSDL', async () => {
    const argv: any = {
      _: ['get-graphql-schema'],
      endpoint: 'http://localhost:5555/graphql',
      auth: 'Bearer 123',
      header: ['Authorization: Bearer override', 'X-Mode: fast'],
      out: outEndpointAuthAndHeaderFile
    };

    await runGetGraphqlSchema(argv, prompter, {} as any);

    // Verify file written
    expect(fs.existsSync(outEndpointAuthAndHeaderFile)).toBe(true);
    const sdl = fs.readFileSync(outEndpointAuthAndHeaderFile, 'utf8');
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('greeting');

    // Verify the mocked function received both auth and headers
    const server = jest.requireMock('@launchql/server') as any;
    expect(server.fetchEndpointSchemaSDL).toHaveBeenCalled();
    const lastCall = server.fetchEndpointSchemaSDL.mock.calls[server.fetchEndpointSchemaSDL.mock.calls.length - 1];
    expect(lastCall[0]).toBe('http://localhost:5555/graphql');
    expect(lastCall[1]).toEqual({ auth: 'Bearer 123', headers: { Authorization: 'Bearer override', 'X-Mode': 'fast' } });
  });
});