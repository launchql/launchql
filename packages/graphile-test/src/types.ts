import type { GraphileOptions } from '@launchql/types';
import { DocumentNode, GraphQLError } from 'graphql';

export interface GraphQLQueryOptions<TVariables = Record<string, any>> {
  query: string | DocumentNode;
  variables?: TVariables;
  commit?: boolean;
  reqOptions?: Record<string, any>;
}

export interface GraphQLTestContext {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  query: <TResult = any, TVariables = Record<string, any>>(
    opts: GraphQLQueryOptions<TVariables>
  ) => Promise<TResult>;
}
export interface GetConnectionsInput {
  useRoot?: boolean;
  schemas: string[];
  authRole?: string;
  graphile?: GraphileOptions;
}

export interface GraphQLQueryOptions<TVariables = Record<string, any>> {
  query: string | DocumentNode;
  variables?: TVariables;
  commit?: boolean;
  reqOptions?: Record<string, any>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: readonly GraphQLError[];
}

export type GraphQLQueryFnObj = <TResult = any, TVariables = Record<string, any>>(
  opts: GraphQLQueryOptions<TVariables>
) => Promise<GraphQLResponse<TResult>>;

export type GraphQLQueryFn = <TResult = any, TVariables = Record<string, any>>(
  query: string | DocumentNode,
  variables?: TVariables,
  commit?: boolean,
  reqOptions?: Record<string, any>
) => Promise<GraphQLResponse<TResult>>;

export type GraphQLQueryUnwrappedFnObj = <TResult = any, TVariables = Record<string, any>>(
  opts: GraphQLQueryOptions<TVariables>
) => Promise<TResult>;

export type GraphQLQueryUnwrappedFn = <TResult = any, TVariables = Record<string, any>>(
  query: string | DocumentNode,
  variables?: TVariables,
  commit?: boolean,
  reqOptions?: Record<string, any>
) => Promise<TResult>;
