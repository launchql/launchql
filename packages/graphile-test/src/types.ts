import { DocumentNode, ExecutionResult } from 'graphql';

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
