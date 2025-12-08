import type { HasRelation, PgBuild, PgClass } from './types';

const getHasRelations = (foreignTable: PgClass, build: PgBuild): HasRelation[] => {
  const {
    pgIntrospectionResultsByKind: introspectionResultsByKind,
    inflection,
    pgOmit: omit
  } = build;

  return foreignTable.foreignConstraints
    .filter((constraint) => constraint.type === 'f')
    .reduce<HasRelation[]>((memo, constraint) => {
      if (omit(constraint, 'read')) {
        return memo;
      }

      const table =
        introspectionResultsByKind.classById[String(constraint.classId)] ?? constraint.foreignClass;

      if (!table || omit(table, 'read')) {
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

      const fieldName = isUnique
        ? inflection.singleRelationByKeysBackwards(keys, table, foreignTable, constraint)
        : inflection.manyRelationByKeys(keys, table, foreignTable, constraint);

      return [
        ...memo,
        {
          referencedBy: table,
          isUnique,
          fieldName,
          type: isUnique ? 'hasOne' : 'hasMany',
          keys
        }
      ];
    }, []);
};

export default getHasRelations;
