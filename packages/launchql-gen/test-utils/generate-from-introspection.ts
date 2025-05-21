import { IntrospectionQueryResult, parseGraphQuery } from 'introspectron';
import { print } from 'graphql';

import { generate, GqlMap } from '../src/gql';

export function generateFromIntrospection(introspection: IntrospectionQueryResult): Record<string, string> {
    const { queries, mutations } = parseGraphQuery(introspection);
    const gqlMap: GqlMap = { ...queries, ...mutations };
    const gen = generate(gqlMap);
  
    return Object.entries(gen).reduce<Record<string, string>>((acc, [key, val]) => {
      if (val?.ast) {
        acc[key] = print(val.ast);
      }
      return acc;
    }, {});
  }