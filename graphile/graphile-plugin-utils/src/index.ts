// Shared internals for Constructive PostGraphile v5 plugins.

// PgCondition → PgSelectQueryBuilder walker (search / BM25 / pgvector)
export { getQueryBuilder } from './query-builder';

// pg-resource introspection helpers (connection-filter / pg-aggregates)
export { isComputedScalarAttributeResource } from './pg-resources';

// Request lane: the request's own role and jwt claims across one transaction
export type { RequestPgClient, WithPgClient } from './request-lane';
export { withRequestPgClient } from './request-lane';

// Generic pg/JSON-schema → GraphQL scalar mapping tables (function-bindings)
export type { GraphQLScalarName } from './scalar-maps';
export { JSON_SCHEMA_SCALARS, PG_TYPE_SCALARS } from './scalar-maps';
