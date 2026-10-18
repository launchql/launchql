/**
 * Connection Filter Operator Factories for Search
 *
 * These factories register filter operators on the connection filter system
 * for tsvector (matches) and pg_trgm (similarTo, wordSimilarTo).
 *
 * They are used in the ConstructivePreset's connectionFilterOperatorFactories
 * array to wire search operators into the declarative filter system.
 */

import type { ConnectionFilterOperatorFactory } from 'graphile-connection-filter';
import type { SQL } from 'pg-sql2';

import { resolveBuildExtensionSchema } from '../extension-metadata';
/**
 * Creates the `matches` filter operator factory for full-text search.
 * Declared here so it's registered via the declarative
 * `connectionFilterOperatorFactories` API.
 */
export function createMatchesOperatorFactory(
  fullTextScalarName: string,
  tsConfig: string
): ConnectionFilterOperatorFactory {
  return (build) => {
    const { sql, graphql: { GraphQLString } } = build;
    const TYPES = build.dataplanPg?.TYPES;

    return [{
      typeNames: fullTextScalarName,
      operatorName: 'matches',
      spec: {
        description: 'Performs a full text search on the field.',
        resolveType: () => GraphQLString,
        resolveInputCodec: TYPES ? () => TYPES.text : undefined,
        resolve(
          sqlIdentifier: SQL,
          sqlValue: SQL,
          _input: unknown,
          _$where: any,
          _details: { fieldName: string | null; operatorName: string }
        ) {
          return sql`${sqlIdentifier} @@ websearch_to_tsquery(${sql.literal(tsConfig)}, ${sqlValue})`;
        },
      },
    }];
  };
}

/**
 * Creates the `similarTo` and `wordSimilarTo` filter operator factories
 * for pg_trgm fuzzy text matching. Declared here so they're registered
 * via the declarative `connectionFilterOperatorFactories` API.
 *
 * These operators target 'StringTrgm' (resolved to 'StringTrgmFilter'),
 * NOT the global 'String' type. The unified search plugin registers
 * 'StringTrgmFilter' and selectively assigns it to string columns on
 * tables that qualify for trgm (via intentional search or @trgmSearch tag).
 * This prevents trgm operators from appearing on every string field.
 */
export function createTrgmOperatorFactories(): ConnectionFilterOperatorFactory {
  return (build) => {
    const { sql } = build;
    const extensionSchema = resolveBuildExtensionSchema(build, 'pg_trgm');
    if (!extensionSchema) return [];
    const similarity = sql.identifier(extensionSchema, 'similarity');
    const wordSimilarity = sql.identifier(extensionSchema, 'word_similarity');

    return [
      {
        typeNames: 'StringTrgm',
        operatorName: 'similarTo',
        spec: {
          description:
            'Fuzzy matches using pg_trgm trigram similarity. Tolerates typos and misspellings.',
          resolveType: () =>
            build.getTypeByName('TrgmSearchInput') as any,
          resolve(
            sqlIdentifier: SQL,
            _sqlValue: SQL,
            input: any,
            _$where: any,
            _details: { fieldName: string | null; operatorName: string }
          ) {
            if (input == null) return null;
            const { value, threshold } = input;
            if (!value || typeof value !== 'string' || value.trim().length === 0) {
              return null;
            }
            const th = threshold != null ? threshold : 0.3;
            return sql`${similarity}(${sqlIdentifier}, ${sql.value(value)}) > ${sql.value(th)}`;
          },
        },
      },
      {
        typeNames: 'StringTrgm',
        operatorName: 'wordSimilarTo',
        spec: {
          description:
            'Fuzzy matches using pg_trgm word_similarity. Finds the best matching substring within the column value.',
          resolveType: () =>
            build.getTypeByName('TrgmSearchInput') as any,
          resolve(
            sqlIdentifier: SQL,
            _sqlValue: SQL,
            input: any,
            _$where: any,
            _details: { fieldName: string | null; operatorName: string }
          ) {
            if (input == null) return null;
            const { value, threshold } = input;
            if (!value || typeof value !== 'string' || value.trim().length === 0) {
              return null;
            }
            const th = threshold != null ? threshold : 0.3;
            return sql`${wordSimilarity}(${sql.value(value)}, ${sqlIdentifier}) > ${sql.value(th)}`;
          },
        },
      },
    ];
  };
}
