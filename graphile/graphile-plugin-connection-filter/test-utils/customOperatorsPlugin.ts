import type { SchemaBuilder, Plugin } from 'graphile-build';
import type { SQL } from 'graphile-build-pg';
import type { GraphQLScalarType } from 'graphql';

import { AddConnectionFilterOperator } from '../src/PgConnectionArgFilterPlugin';

type BuildWithOperators = {
  pgSql: {
    fragment: (...sql: any[]) => SQL;
  };
  graphql: {
    GraphQLInt: GraphQLScalarType;
    GraphQLBoolean: GraphQLScalarType;
  };
  addConnectionFilterOperator: AddConnectionFilterOperator;
};

const CustomOperatorsPlugin: Plugin = (builder: SchemaBuilder) => {
  (builder as any).hook('build', (_: unknown, build: BuildWithOperators) => {
    const {
      pgSql: sql,
      graphql: { GraphQLInt, GraphQLBoolean },
      addConnectionFilterOperator,
    } = build;

    addConnectionFilterOperator(
      'InternetAddress',
      'familyEqualTo',
      'Address family equal to specified value.',
      () => GraphQLInt,
      (i: SQL, v: SQL) => sql.fragment`family(${i}) = ${v}`
    );

    addConnectionFilterOperator(
      'InternetAddress',
      'familyNotEqualTo',
      'Address family equal to specified value.',
      () => GraphQLInt,
      (i: SQL, v: SQL) => sql.fragment`${i} <> ${v}`,
      {
        resolveSqlIdentifier: (i: SQL) => sql.fragment`family(${i})`,
      }
    );

    addConnectionFilterOperator(
      ['InternetAddress'],
      'isV4',
      'Address family equal to specified value.',
      () => GraphQLBoolean,
      (i: SQL, v: SQL) => sql.fragment`family(${i}) = ${v}`,
      {
        resolveInput: (input: unknown) => (input === true ? 4 : 6),
      }
    );

    return _;
  });
};

export default CustomOperatorsPlugin;
