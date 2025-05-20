import { DocumentNode, ExecutionResult } from 'graphql';

export interface GraphQLQueryOptions {
  query: string | DocumentNode;
  variables?: Record<string, any>;
  commit?: boolean;
  reqOptions?: Record<string, any>;
}

export interface GraphQLTestContext {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  query: <T = ExecutionResult>(opts: GraphQLQueryOptions) => Promise<T>;
}
