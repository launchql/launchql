export default function(foreignTable, build) {
  const {
    pgIntrospectionResultsByKind: introspectionResultsByKind,
    inflection,
    pgOmit: omit
  } = build;

  return foreignTable.foreignConstraints
    .filter(con => con.type === 'f')
    .reduce((memo, constraint) => {
      if (omit(constraint, 'read')) {
        return memo;
      }

      const table = introspectionResultsByKind.classById[constraint.classId];

      if (!table) {
        return memo;
      }

      if (omit(table, 'read')) {
        return memo;
      }

      const keys = constraint.keyAttributes;
      const foreignKeys = constraint.foreignKeyAttributes;

      if (keys.some(key => omit(key, 'read'))) {
        return memo;
      }
      if (foreignKeys.some(key => omit(key, 'read'))) {
        return memo;
      }

      const isUnique = !!table.constraints.find(
        c =>
          (c.type === 'p' || c.type === 'u') &&
          c.keyAttributeNums.length === keys.length &&
          c.keyAttributeNums.every((n, i) => keys[i].num === n)
      );

      const fieldName = isUnique
        ? inflection.singleRelationByKeysBackwards(
            keys,
            table,
            foreignTable,
            constraint
          )
        : inflection.manyRelationByKeys(keys, table, foreignTable, constraint);

      memo.push({
        referencedBy: table,
        isUnique,
        fieldName,
        type: isUnique ? 'hasOne' : 'hasMany',
        keys
      });

      return memo;
    }, []);
}
