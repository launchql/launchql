import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { IntrospectionQuery, parseGraphQuery } from 'introspectron';
import noop from 'lodash/noop';
import { useGraphqlClient } from './use-graphql-client';

export function useIntrospection(options = {}) {
  const { headers, onSuccess = noop, onError = noop, ...restOptions } = options;
  const graphqlClient = useGraphqlClient();

  useEffect(() => {
    if (headers && graphqlClient) {
      graphqlClient.setHeaders(headers);
    }
  }, [graphqlClient, headers]);

  const { refetch, ...rest } = useQuery(
    'introspection',
    async () => {
      const introspectionResults = await graphqlClient.request(
        IntrospectionQuery
      );
      try {
        const { queries, mutations } = parseGraphQuery(introspectionResults);
        return { ...queries, ...mutations };
      } catch (err) {
        throw new Error('useIntrospection: failed to get introspection query');
      }
    },
    {
      onError,
      onSuccess,
      ...restOptions,
      // The query will not execute until the graphqlClient exists
      enabled: !!graphqlClient,
      // SQL schema rarely changes, so we don't want it to invalidate too often
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  return {
    refetch,
    ...rest
  };
}
