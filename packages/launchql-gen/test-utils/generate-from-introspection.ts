import { print } from 'graphql';
import { IntrospectionQueryResult, parseGraphQuery } from 'introspectron';

import { generate, GqlMap } from '../src/gql';

export function generateKeyedObjFromGqlMap(gqlMap: GqlMap): Record<string, string> {
  const gen = generate(gqlMap);

  return Object.entries(gen).reduce<Record<string, string>>((acc, [key, val]) => {
    if (val?.ast) {
      acc[key] = print(val.ast);
    }
    return acc;
  }, {});
}

export function generateKeyedObjFromIntrospection(introspection: IntrospectionQueryResult): Record<string, string> {
  const { queries, mutations } = parseGraphQuery(introspection);
  const gqlMap: GqlMap = { ...queries, ...mutations };
  return generateKeyedObjFromGqlMap(gqlMap);
}