// @ts-nocheck
import { useState, useMemo, useContext } from 'react';
import { GraphQLClient } from 'graphql-request';
import { getLqlContext } from './context';

export const useGraphqlClient = () => {
  const [endpointUrl, setEndpointUrl] = useState(null);
  const [headers, setHeaders] = useState({});

  const context = useContext(getLqlContext());
  if (!context || !context.endpointUrl) {
    throw new Error('Missing LqlProvider');
  }
  if (endpointUrl != context.endpointUrl) {
    setEndpointUrl(context.endpointUrl);
  }
  if (JSON.stringify(headers) != JSON.stringify(context.headers)) {
    setHeaders(context.headers);
  }

  const graphqlClient = useMemo(
    () => (endpointUrl ? new GraphQLClient(endpointUrl, { headers }) : null),
    [headers, endpointUrl]
  );

  return graphqlClient;
};
