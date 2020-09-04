import plz from 'pluralize';
import inflection from 'inflection';
import * as t from '@pyramation/graphql-ast';
import { getType } from './types';
export * from './introspect';

export const createOne = (klass) => {
  const operationName = inflection.camelize(
    ['create', plz.singular(klass.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['create', plz.singular(klass.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(klass.name)].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = klass.attributes.map((field) => {
    const { fieldName, fieldType, isNotNull, isArray } = fieldMap[field.name];
    let type = t.namedType({ type: fieldType });
    if (isArray) type = t.listType({ type });
    if (isNotNull) type = t.nonNullType({ type });
    return t.variableDefinition({
      variable: t.variable({ name: fieldName }),
      type
    });
  });

  const selectArgs = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: [
          t.objectField({
            name: modelName,
            value: t.objectValue({
              fields: klass.attributes.map((field) =>
                t.objectField({
                  name: fieldMap[field.name].fieldName,
                  value: t.variable({
                    name: fieldMap[field.name].fieldName
                  })
                })
              )
            })
          })
        ]
      })
    })
  ];

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      args: selectArgs,
      selectionSet: t.selectionSet({
        selections: [
          t.field({
            name: modelName,
            selectionSet: t.selectionSet({ selections })
          })
        ]
      })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'mutation',
        name: mutationName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: mutationName, ast };
};

// TODO use constraints...

const getPrimaryKeyName = (klass) => {
  // TODO support multiple keys
  return klass.primaryKeyConstraint.keyAttributes[0].name;
};

export const updateOne = (klass) => {
  if (
    !klass.primaryKeyConstraint ||
    !klass.primaryKeyConstraint.keyAttributes ||
    !klass.primaryKeyConstraint.keyAttributes.length
  ) {
    return {};
  }

  const PATCHER_FIELD = getPrimaryKeyName(klass);
  const operationName = inflection.camelize(
    ['update', plz.singular(klass.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['update', plz.singular(klass.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(klass.name)].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = klass.attributes.map((field) => {
    const { fieldName, fieldType, isNotNull, isArray } = fieldMap[field.name];
    let type = t.namedType({ type: fieldType });
    if (isArray) type = t.listType({ type });
    // later we can use primary key info...
    if (field.name === PATCHER_FIELD) type = t.nonNullType({ type });
    return t.variableDefinition({
      variable: t.variable({ name: fieldName }),
      type
    });
  });

  const selectArgs = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: [
          t.objectField({
            name: PATCHER_FIELD,
            value: t.variable({ name: PATCHER_FIELD })
          }),
          t.objectField({
            name: 'patch',
            value: t.objectValue({
              fields: klass.attributes
                .filter((field) => field.name !== PATCHER_FIELD)
                .map((field) =>
                  t.objectField({
                    name: fieldMap[field.name].fieldName,
                    value: t.variable({
                      name: fieldMap[field.name].fieldName
                    })
                  })
                )
            })
          })
        ]
      })
    })
  ];

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      args: selectArgs,
      selectionSet: t.selectionSet({
        selections: [
          t.field({
            name: modelName,
            selectionSet: t.selectionSet({ selections })
          })
        ]
      })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'mutation',
        name: mutationName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: mutationName, ast };
};

export const getOne = (klass) => {
  if (
    !klass.primaryKeyConstraint ||
    !klass.primaryKeyConstraint.keyAttributes ||
    !klass.primaryKeyConstraint.keyAttributes.length
  ) {
    return {};
  }

  const GETTER_FIELD = getPrimaryKeyName(klass);
  const operationName = inflection.camelize(
    [plz.singular(klass.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    ['get', plz.singular(klass.name), 'query'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(klass.name)].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = klass.attributes
    .filter((field) => field.name === GETTER_FIELD)
    .map((field) => {
      const { fieldName, fieldType, isNotNull, isArray } = fieldMap[field.name];
      let type = t.namedType({ type: fieldType });
      if (isArray) type = t.listType({ type });
      // later we can use primary key info...
      if (field.name === GETTER_FIELD) type = t.nonNullType({ type });
      return t.variableDefinition({
        variable: t.variable({ name: fieldName }),
        type
      });
    });

  const selectArgs = [
    t.argument({
      name: GETTER_FIELD,
      value: t.variable({ name: GETTER_FIELD })
    })
  ];

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      args: selectArgs,
      selectionSet: t.selectionSet({ selections })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: queryName, ast };
};

export const getMany = (klass) => {
  const operationName = inflection.camelize(
    [plz.plural(klass.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    ['get', plz.plural(klass.name), 'query'].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      selectionSet: t.objectValue({
        fields: [
          t.field({
            name: 'totalCount'
          }),
          t.objectField({
            name: 'nodes',
            value: t.selectionSet({ selections })
          })
        ]
      })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: queryName, ast };
};

export const getManyOwned = (klass, ownedField) => {
  const operationName = inflection.camelize(
    [plz.plural(klass.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    [
      'get',
      plz.plural(klass.name),
      'by',
      plz.singular(ownedField),
      'query'
    ].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = klass.attributes
    .filter((field) => field.name === ownedField)
    .map((field) => {
      const { fieldName, fieldType, isNotNull, isArray } = fieldMap[field.name];
      let type = t.namedType({ type: fieldType });
      if (isArray) type = t.listType({ type });
      // required
      type = t.nonNullType({ type });
      return t.variableDefinition({
        variable: t.variable({ name: fieldName }),
        type
      });
    });

  const ownedFieldName = inflection.camelize(ownedField, true);

  const condition = [
    t.argument({
      name: 'condition',
      value: t.objectValue({
        fields: [
          t.objectField({
            name: ownedFieldName,
            value: t.variable({ name: ownedFieldName })
          })
        ]
      })
    })
  ];

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      args: condition,
      selectionSet: t.objectValue({
        fields: [
          t.field({
            name: 'totalCount'
          }),
          t.objectField({
            name: 'nodes',
            value: t.selectionSet({ selections })
          })
        ]
      })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: queryName, ast };
};

export const deleteOne = (klass) => {
  if (
    !klass.primaryKeyConstraint ||
    !klass.primaryKeyConstraint.keyAttributes ||
    !klass.primaryKeyConstraint.keyAttributes.length
  ) {
    return {};
  }

  const DELETER_FIELD = getPrimaryKeyName(klass);
  const operationName = inflection.camelize(
    ['delete', plz.singular(klass.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['delete', plz.singular(klass.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(klass.name)].join('_'),
    true
  );

  const fieldMap = klass.attributes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type.name);
    const isArray = !!field.isArray;
    const isNotNull = field.isNotNull && !field.hasDefault;
    m[field.name] = {
      fieldName,
      fieldType,
      isNotNull,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = klass.attributes
    .filter((field) => field.name === DELETER_FIELD)
    .map((field) => {
      const { fieldName, fieldType, isNotNull, isArray } = fieldMap[field.name];
      let type = t.namedType({ type: fieldType });
      if (isArray) type = t.listType({ type });

      // required
      type = t.nonNullType({ type });
      return t.variableDefinition({
        variable: t.variable({ name: fieldName }),
        type
      });
    });

  const selectArgs = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: [
          t.objectField({
            name: DELETER_FIELD,
            value: t.variable({ name: DELETER_FIELD })
          })
        ]
      })
    })
  ];

  const selections = klass.attributes.map((field) =>
    t.field({ name: fieldMap[field.name].fieldName })
  );
  const opSel = [
    t.field({
      name: operationName,
      args: selectArgs,
      selectionSet: t.selectionSet({
        selections: [
          t.field({
            name: modelName,
            selectionSet: t.selectionSet({ selections })
          })
        ]
      })
    })
  ];

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'mutation',
        name: mutationName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });

  return { name: mutationName, ast };
};

export const crudTable = ({ table, introspectron }) => {
  const c = createOne(table);
  const r = getOne(table);
  const rn = getMany(table);
  const u = updateOne(table);
  const d = deleteOne(table);

  return {
    [c.name]: c.ast,
    [r.name]: r.ast,
    [rn.name]: rn.ast,
    [u.name]: u.ast,
    [d.name]: d.ast
  };
};

export const ownedTable = ({ table, introspectron }) => {
  const owned = {};
  for (let k = 0; k < table.foreignConstraints.length; k++) {
    const rel = table.foreignConstraints[k];

    // console.log(table.name); // merchants
    // console.log(rel.name); // products_merchant_id_fkey
    // console.log(rel.class.name); // products
    // console.log(rel.keyAttributeNums);
    // console.log(rel.foreignKeyAttributeNums);
    // console.log(rel.class.attributes.map((a) => a.name));
    // console.log(table.attributes.map((a) => a.name));
    // console.log(rel);

    // TODO this feels backwards...
    const attrFields = rel.foreignKeyAttributeNums.map(
      (num) => table.attributes.find((attr) => attr.num == num).name
    );
    const ownedFields = rel.keyAttributeNums.map(
      (num) => rel.class.attributes.find((attr) => attr.num == num).name
    );

    if (attrFields.length !== 1 || ownedFields.length !== 1) {
      console.warn("we don't yet support relations with two keys");
      continue;
    }

    // console.log({ attrFields, ownedFields });

    const { name, ast } = getManyOwned(rel.class, ownedFields[0]);
    owned[name] = ast;
  }

  return owned;
};

export const crudify = (introspectron) => {
  const namespaces = introspectron.namespace.map((n) => n.name);
  const classes = introspectron.class.filter((c) =>
    namespaces.includes(c.namespaceName)
  );

  const fun = {};

  for (let c = 0; c < classes.length; c++) {
    const klass = classes[c];
    Object.assign(fun, crudTable({ table: klass, introspectron }));
  }

  return fun;
};

export const owned = (introspectron) => {
  const namespaces = introspectron.namespace.map((n) => n.name);
  const classes = introspectron.class.filter((c) =>
    namespaces.includes(c.namespaceName)
  );

  const fun = {};

  for (let c = 0; c < classes.length; c++) {
    const klass = classes[c];
    Object.assign(fun, ownedTable({ table: klass, introspectron }));
  }

  return fun;
};
