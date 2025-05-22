import { getConnections as getPgConnections } from 'pgsql-test';
import { GraphQLTest } from './graphile-test';

import type { GetConnectionOpts, GetConnectionResult } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';
import type { SeedAdapter } from 'pgsql-test/seed/types';
import type {
  GraphQLQueryOptions,
  GraphQLQueryFn,
  GraphQLQueryFnPos,
  GraphQLQueryUnwrappedFn,
  GraphQLQueryUnwrappedFnPos,
  GraphQLResponse,
  GetConnectionsInput
} from './types';

// Core unwrapping utility
const unwrap = <T>(res: GraphQLResponse<T>): T => {
  if (res.errors?.length) {
    throw new Error(JSON.stringify(res.errors, null, 2));
  }
  if (!res.data) {
    throw new Error('No data returned from GraphQL query');
  }
  return res.data;
};

// Base connection setup - shared across all variants
const createConnectionsBase = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
) => {
  const conn: GetConnectionResult = await getPgConnections(input, seedAdapters);
  const { pg, db, teardown: dbTeardown } = conn;

  const gqlContext = GraphQLTest(input, conn);
  await gqlContext.setup();

  const teardown = async () => {
    await gqlContext.teardown();
    await dbTeardown();
  };

  const baseQuery = (opts: GraphQLQueryOptions) => gqlContext.query(opts);
  const baseQueryPositional = (query: any, variables?: any, commit?: boolean, reqOptions?: any) =>
    gqlContext.query({ query, variables, commit, reqOptions });

  return {
    pg,
    db,
    teardown,
    baseQuery,
    baseQueryPositional
  };
};

// ============================================================================
// POSITIONAL QUERY VERSIONS (DEFAULT/PREFERRED)
// ============================================================================

/**
 * Creates connections with raw GraphQL responses (positional API)
 */
export const getConnections = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFnPos;
}> => {
  const { pg, db, teardown, baseQueryPositional } = await createConnectionsBase(input, seedAdapters);

  return {
    pg,
    db,
    teardown,
    query: baseQueryPositional
  };
};

/**
 * Creates connections with unwrapped GraphQL responses (positional API, throws on errors)
 */
export const getConnectionsUnwrapped = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryUnwrappedFnPos;
}> => {
  const { pg, db, teardown, baseQueryPositional } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryUnwrappedFnPos = async (query, variables, commit, reqOptions) =>
    unwrap(await baseQueryPositional(query, variables, commit, reqOptions));

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with logging for GraphQL queries (positional API)
 */
export const getConnectionsWithLogging = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFnPos;
}> => {
  const { pg, db, teardown, baseQueryPositional } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFnPos = async (query, variables, commit, reqOptions) => {
    console.log('Executing GraphQL query:', query);
    const result = await baseQueryPositional(query, variables, commit, reqOptions);
    console.log('GraphQL result:', result);
    return result;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with timing for GraphQL queries (positional API)
 */
export const getConnectionsWithTiming = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFnPos;
}> => {
  const { pg, db, teardown, baseQueryPositional } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFnPos = async (query, variables, commit, reqOptions) => {
    const start = Date.now();
    const result = await baseQueryPositional(query, variables, commit, reqOptions);
    const duration = Date.now() - start;
    console.log(`GraphQL query took ${duration}ms`);
    return result;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with retry logic for GraphQL queries (positional API)
 */
export const getConnectionsWithRetry = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[],
  maxRetries: number = 3
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFnPos;
}> => {
  const { pg, db, teardown, baseQueryPositional } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFnPos = async (query, variables, commit, reqOptions) => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await baseQueryPositional(query, variables, commit, reqOptions);
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) break;
        console.log(`GraphQL query attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // exponential backoff
      }
    }
    
    throw lastError;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};

// ============================================================================
// OBJECT-BASED QUERY VERSIONS (EXPLICIT)
// ============================================================================

/**
 * Creates connections with raw GraphQL responses (object-based API)
 */
export const getConnectionsObject = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFn;
}> => {
  const { pg, db, teardown, baseQuery } = await createConnectionsBase(input, seedAdapters);

  return {
    pg,
    db,
    teardown,
    query: baseQuery
  };
};

/**
 * Creates connections with unwrapped GraphQL responses (object-based API, throws on errors)
 */
export const getConnectionsObjectUnwrapped = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryUnwrappedFn;
}> => {
  const { pg, db, teardown, baseQuery } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryUnwrappedFn = async (opts) => unwrap(await baseQuery(opts));

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with logging for GraphQL queries (object-based API)
 */
export const getConnectionsObjectWithLogging = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFn;
}> => {
  const { pg, db, teardown, baseQuery } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFn = async (opts) => {
    console.log('Executing GraphQL query:', opts.query);
    const result = await baseQuery(opts);
    console.log('GraphQL result:', result);
    return result;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with timing for GraphQL queries (object-based API)
 */
export const getConnectionsObjectWithTiming = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[]
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFn;
}> => {
  const { pg, db, teardown, baseQuery } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFn = async (opts) => {
    const start = Date.now();
    const result = await baseQuery(opts);
    const duration = Date.now() - start;
    console.log(`GraphQL query took ${duration}ms`);
    return result;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};

/**
 * Creates connections with retry logic for GraphQL queries (object-based API)
 */
export const getConnectionsObjectWithRetry = async (
  input: GetConnectionsInput & GetConnectionOpts,
  seedAdapters?: SeedAdapter[],
  maxRetries: number = 3
): Promise<{
  pg: PgTestClient;
  db: PgTestClient;
  teardown: () => Promise<void>;
  query: GraphQLQueryFn;
}> => {
  const { pg, db, teardown, baseQuery } = await createConnectionsBase(input, seedAdapters);

  const query: GraphQLQueryFn = async (opts) => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await baseQuery(opts);
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) break;
        console.log(`GraphQL query attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // exponential backoff
      }
    }
    
    throw lastError;
  };

  return {
    pg,
    db,
    teardown,
    query
  };
};