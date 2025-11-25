import type { BelongsToRelation, PgBuild, PgClass } from './types';

const getBelongsToRelations = (table: PgClass, build: PgBuild): BelongsToRelation[] => {
  const {
    pgIntrospectionResultsByKind: introspectionResultsByKind,
    inflection,
    pgOmit: omit
  } = build;

  return table.constraints
    .filter((constraint) => constraint.type === 'f')
    .reduce<BelongsToRelation[]>((memo, constraint) => {
      if (omit(constraint, 'read')) {
        return memo;
      }

      const foreignTable =
        (constraint.foreignClassId !== undefined
          ? introspectionResultsByKind.classById[String(constraint.foreignClassId)]
          : undefined) ?? constraint.foreignClass;

      if (!foreignTable || omit(foreignTable, 'read')) {
        return memo;
      }

      const keys = constraint.keyAttributes;
      const foreignKeys = constraint.foreignKeyAttributes;

      if (keys.some((key) => omit(key, 'read')) || foreignKeys.some((key) => omit(key, 'read'))) {
        return memo;
      }

      const isUnique = table.constraints.some(
        (c) =>
          (c.type === 'p' || c.type === 'u') &&
          c.keyAttributeNums.length === keys.length &&
          c.keyAttributeNums.every((n, i) => keys[i].num === n)
      );

      const fieldName = inflection.singleRelationByKeys(keys, foreignTable, table, constraint);

      return [
        ...memo,
        {
          references: foreignTable,
          isUnique,
          fieldName,
          keys
        }
      ];
    }, []);
};

export default getBelongsToRelations;
