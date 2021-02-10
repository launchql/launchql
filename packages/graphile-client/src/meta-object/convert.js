export function convertFromMetaSchema(metaSchema) {
  const {
    _meta: { tables }
  } = metaSchema;

  const result = {
    tables: []
  };

  for (const table of tables) {
    result.tables.push({
      name: table.name,
      fields: table.fields.map((f) => pickField(f)),
      primaryConstraints: pickArrayConstraint(table.primaryKeyConstraints),
      uniqueConstraints: pickArrayConstraint(table.uniqueConstraints),
      foreignConstraints: pickForeignConstraint(table.foreignKeyConstraints)
    });
  }

  return result;
}

function pickArrayConstraint(constraints) {
  if (constraints.length === 0) return [];
  const c = constraints[0];
  return c.fields.map((field) => pickField(field));
}

function pickForeignConstraint(constraints) {
  if (constraints.length === 0) return [];
  return constraints.map((c) => {
    const { fields, refFields, refTable } = c;

    return {
      refTable: refTable.name,
      fromKey: pickField(fields[0]),
      toKey: pickField(refFields[0])
    };
  });
}

function pickField(field) {
  return {
    name: field.name,
    type: field.type.pgType
  };
}
