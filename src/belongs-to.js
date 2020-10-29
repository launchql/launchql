export default function(table, build) {
  const {
    pgIntrospectionResultsByKind: introspectionResultsByKind,
    inflection,
    pgOmit: omit
  } = build;

  return table.constraints
    .filter(con => con.type === 'f')
    .reduce((memo, constraint) => {
      if (omit(constraint, 'read')) {
        return memo;
      }

      const foreignTable =
        introspectionResultsByKind.classById[constraint.foreignClassId];

      if (!foreignTable) {
        return memo;
      }

      if (omit(foreignTable, 'read')) {
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

      const fieldName = inflection.singleRelationByKeys(
        keys,
        foreignTable,
        table,
        constraint
      );

      memo.push({
        references: foreignTable,
        isUnique,
        fieldName,
        keys
      });

      return memo;
    }, []);
}
