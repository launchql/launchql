import plz from 'pluralize';
import inflection from 'inflection';
import * as t from '@pyramation/graphql-ast';

function getType(type) {
  // TODO look in postgraphile
  switch (type) {
    case 'uuid':
      return 'UUID';
    case 'json':
    case 'jsonb':
      return 'JSON';
    case 'numeric':
      return 'BigFloat';
    case 'int':
    case 'integer':
      return 'Int';
    case 'upload':
    case 'attachment':
    case 'image':
      return 'Upload';
    case 'text':
    default:
      return 'String';
  }
}

export const createOne = (defn) => {
  const operationName = inflection.camelize(
    ['create', plz.singular(defn.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['create', plz.singular(defn.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(defn.name)].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = defn.fields.nodes.map((field) => {
    const { fieldName, fieldType, isRequired, isArray } = fieldMap[field.name];
    let type = t.namedType({ type: fieldType });
    if (isArray) type = t.listType({ type });
    if (isRequired) type = t.nonNullType({ type });
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
              fields: defn.fields.nodes.map((field) =>
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

  const selections = defn.fields.nodes.map((field) =>
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

const PATCHER_FIELD = 'id';
export const updateOne = (defn) => {
  const operationName = inflection.camelize(
    ['update', plz.singular(defn.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['update', plz.singular(defn.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(defn.name)].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = defn.fields.nodes.map((field) => {
    const { fieldName, fieldType, isRequired, isArray } = fieldMap[field.name];
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
              fields: defn.fields.nodes
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

  const selections = defn.fields.nodes.map((field) =>
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

const GETTER_FIELD = 'id';
export const getOne = (defn) => {
  const operationName = inflection.camelize(
    [plz.singular(defn.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    ['get', plz.singular(defn.name), 'query'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(defn.name)].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = defn.fields.nodes
    .filter((field) => field.name === GETTER_FIELD)
    .map((field) => {
      const { fieldName, fieldType, isRequired, isArray } = fieldMap[
        field.name
      ];
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

  const selections = defn.fields.nodes.map((field) =>
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

export const getMany = (defn) => {
  const operationName = inflection.camelize(
    [plz.plural(defn.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    ['get', plz.plural(defn.name), 'query'].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const selections = defn.fields.nodes.map((field) =>
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

export const getManyOwned = (defn, ownedField) => {
  const operationName = inflection.camelize(
    [plz.plural(defn.name)].join('_'),
    true
  );
  const queryName = inflection.camelize(
    [
      'get',
      plz.plural(defn.name),
      'owned',
      'by',
      plz.singular(ownedField),
      'query'
    ].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = defn.fields.nodes
    .filter((field) => field.name === ownedField)
    .map((field) => {
      const { fieldName, fieldType, isRequired, isArray } = fieldMap[
        field.name
      ];
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

  const selections = defn.fields.nodes.map((field) =>
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

const DELETER_FIELD = 'id';
export const deleteOne = (defn) => {
  const operationName = inflection.camelize(
    ['delete', plz.singular(defn.name)].join('_'),
    true
  );
  const mutationName = inflection.camelize(
    ['delete', plz.singular(defn.name), 'mutation'].join('_'),
    true
  );
  const modelName = inflection.camelize(
    [plz.singular(defn.name)].join('_'),
    true
  );

  const fieldMap = defn.fields.nodes.reduce((m, field) => {
    const fieldName = inflection.camelize(plz.singular(field.name), true);
    const fieldType = getType(field.type);
    const isArray = !!field.isArray;
    const isRequired =
      field.isRequired &&
      (typeof field.defaultValue === 'undefined' ||
        field.defaultValue === null);
    m[field.name] = {
      fieldName,
      fieldType,
      isRequired,
      isArray
    };
    return m;
  }, {});

  const variableDefinitions = defn.fields.nodes
    .filter((field) => field.name === DELETER_FIELD)
    .map((field) => {
      const { fieldName, fieldType, isRequired, isArray } = fieldMap[
        field.name
      ];
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
            name: PATCHER_FIELD,
            value: t.variable({ name: PATCHER_FIELD })
          })
        ]
      })
    })
  ];

  const selections = defn.fields.nodes.map((field) =>
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
