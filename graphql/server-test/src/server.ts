import { createDevServer } from '@constructive-io/graphql-dev-server';
import { Server } from '@constructive-io/graphql-server';
import type { ConstructiveOptions } from '@constructive-io/graphql-types';
import { Server as HttpServer } from 'http';

import type { ServerInfo, ServerOptions } from './types';

/**
 * Create a single-tenant dev test server (no scoped routing, no database id).
 *
 * Wraps `@constructive-io/graphql-dev-server` for suites that exercise a plain
 * PostGraphile surface against one seeded database.
 */
export const createDevTestServer = async (
  opts: ConstructiveOptions,
  serverOpts: ServerOptions = {}
): Promise<ServerInfo> => {
  const { httpServer, url, graphqlUrl, port, host, stop } = await createDevServer(
    opts,
    {
      host: serverOpts.host ?? '127.0.0.1',
      port: serverOpts.port ?? 0
    }
  );
  return { httpServer, url, graphqlUrl, port, host, stop };
};

/**
 * Create a test server for SuperTest testing
 * 
 * This uses the Server class from @constructive-io/graphql-server directly,
 * which includes all the standard middleware (CORS, authentication, GraphQL, etc.)
 */
export const createTestServer = async (
  opts: ConstructiveOptions,
  serverOpts: ServerOptions = {}
): Promise<ServerInfo> => {
  // Use 127.0.0.1 by default to avoid IPv6/IPv4 mismatch issues with supertest
  // On some systems, 'localhost' resolves to ::1 (IPv6) but supertest connects to 127.0.0.1 (IPv4)
  const host = serverOpts.host ?? '127.0.0.1';
  // Use port 0 to let the OS assign an available port atomically
  // This avoids race conditions that can occur with manual port scanning
  const port = serverOpts.port ?? 0;

  // Merge server options into the ConstructiveOptions
  const serverConfig: ConstructiveOptions = {
    ...opts,
    server: {
      ...opts.server,
      host,
      port,
      ...(serverOpts.trustedProxyHops !== undefined && {
        trustedProxyHops: serverOpts.trustedProxyHops
      })
    }
  };

  // Create the server using @constructive-io/graphql-server
  const server = new Server(serverConfig);
  
  // Start listening and get the HTTP server
  const httpServer: HttpServer = server.listen();
  
  // Wait for the server to actually be listening before getting the address
  // The listen() call is async - it returns immediately but the server isn't ready yet
  await new Promise<void>((resolve) => {
    if (httpServer.listening) {
      resolve();
    } else {
      httpServer.once('listening', () => resolve());
    }
  });
  
  const actualPort = (httpServer.address() as { port: number }).port;

  const stop = async (): Promise<void> => {
    await server.close({ closeCaches: true });
  };

  return {
    httpServer,
    url: `http://${host}:${actualPort}`,
    graphqlUrl: `http://${host}:${actualPort}/graphql`,
    port: actualPort,
    host,
    stop
  };
};
