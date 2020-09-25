import plz from 'pluralize';
import inflection from 'inflection';
import * as t from '@pyramation/graphql-ast';

const objectToArray = (obj) =>
  Object.keys(obj).map((k) => ({ name: k, ...obj[k] }));

const createGqlMutation = ({
  operationName,
  mutationName,
  selectArgs,
  selections,
  variableDefinitions,
  modelName,
  useModel = true
}) => {
  const opSel = !modelName
    ? [
        t.field({
          name: operationName,
          args: selectArgs,
          selectionSet: t.selectionSet({ selections })
        })
      ]
    : [
        t.field({
          name: operationName,
          args: selectArgs,
          selectionSet: t.selectionSet({
            selections: useModel
              ? [
                  t.field({
                    name: modelName,
                    selectionSet: t.selectionSet({ selections })
                  })
                ]
              : selections
          })
        })
      ];

  return t.document({
    definitions: [
      t.operationDefinition({
        operation: 'mutation',
        name: mutationName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel })
      })
    ]
  });
};

export const getMany = ({ operationName, query }) => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'query'].join('_'),
    true
  );

  const selections = query.selection.map((field) => t.field({ name: field }));
  const opSel = [
    t.field({
      name: operationName,
      selectionSet: t.objectValue({
        fields: [
          t.field({
            name: 'totalCount'
          }),
          t.field({
            name: 'nodes',
            selectionSet: t.selectionSet({ selections })
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

export const getOne = ({ operationName, query }) => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'query'].join('_'),
    true
  );

  const variableDefinitions = Object.keys(query.properties)
    .map((key) => ({ name: key, ...query.properties[key] }))
    .filter((field) => field.isNotNull)
    .map((field) => {
      const {
        name: fieldName,
        type: fieldType,
        isNotNull,
        isArray,
        isArrayNotNull
      } = field;
      let type = t.namedType({ type: fieldType });
      if (isNotNull) type = t.nonNullType({ type });
      if (isArray) {
        type = t.listType({ type });
        if (isArrayNotNull) type = t.nonNullType({ type });
      }
      return t.variableDefinition({
        variable: t.variable({ name: fieldName }),
        type
      });
    });

  const props = objectToArray(query.properties);

  const selectArgs = props
    .filter((field) => field.isNotNull)
    .map((field) => {
      return t.argument({
        name: field.name,
        value: t.variable({ name: field.name })
      });
    });

  const selections = query.selection.map((field) => t.field({ name: field }));
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

export const createOne = ({ operationName, mutation }) => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  const attrs = objectToArray(
    mutation.properties.input.properties[modelName].properties
  );

  const variableDefinitions = attrs.map((field) => {
    const {
      name: fieldName,
      type: fieldType,
      isNotNull,
      isArray,
      isArrayNotNull
    } = field;
    let type = t.namedType({ type: fieldType });
    if (isNotNull) type = t.nonNullType({ type });
    if (isArray) {
      type = t.listType({ type });
      if (isArrayNotNull) type = t.nonNullType({ type });
    }
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
              fields: attrs.map((field) =>
                t.objectField({
                  name: field.name,
                  value: t.variable({
                    name: field.name
                  })
                })
              )
            })
          })
        ]
      })
    })
  ];

  const selections = attrs.map((field) => t.field({ name: field.name }));
  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
    modelName
  });

  return { name: mutationName, ast };
};

export const patchOne = ({ operationName, mutation }) => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  const patchAttrs = objectToArray(
    mutation.properties.input.properties['patch'].properties
  );

  const patchByAttrs = objectToArray(
    mutation.properties.input.properties
  ).filter((n) => n.name !== 'patch');

  const patchers = patchByAttrs.map((p) => p.name);

  const variableDefinitions = patchAttrs.map((field) => {
    const { name: fieldName, type: fieldType, isArray } = field;
    let type = t.namedType({ type: fieldType });
    if (isArray) type = t.listType({ type });
    if (patchers.includes(field.name)) type = t.nonNullType({ type });
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
          ...patchByAttrs.map((field) =>
            t.objectField({
              name: field.name,
              value: t.variable({ name: field.name })
            })
          ),
          t.objectField({
            name: 'patch',
            value: t.objectValue({
              fields: patchAttrs
                .filter((field) => !patchers.includes(field.name))
                .map((field) =>
                  t.objectField({
                    name: field.name,
                    value: t.variable({
                      name: field.name
                    })
                  })
                )
            })
          })
        ]
      })
    })
  ];

  const selections = patchAttrs.map((field) => t.field({ name: field.name }));
  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
    modelName
  });

  return { name: mutationName, ast };
};

export const deleteOne = ({ operationName, mutation }) => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  const deleteAttrs = objectToArray(mutation.properties.input.properties);
  const variableDefinitions = deleteAttrs.map((field) => {
    const {
      name: fieldName,
      type: fieldType,
      isNotNull,
      isArray,
      isArrayNotNull
    } = field;
    let type = t.namedType({ type: fieldType });
    if (isNotNull) type = t.nonNullType({ type });
    if (isArray) {
      type = t.listType({ type });
      // no need to check isArrayNotNull since we need this field for deletion
      type = t.nonNullType({ type });
    }
    return t.variableDefinition({
      variable: t.variable({ name: fieldName }),
      type
    });
  });

  const selectArgs = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: deleteAttrs.map((f) =>
          t.objectField({
            name: f.name,
            value: t.variable({ name: f.name })
          })
        )
      })
    })
  ];

  // so we can support column select grants plugin
  const selections = [t.field({ name: 'clientMutationId' })];
  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    useModel: false,
    variableDefinitions,
    modelName
  });

  return { name: mutationName, ast };
};

export const createMutation = ({ operationName, mutation }) => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const otherAttrs = objectToArray(mutation.properties.input.properties);

  const variableDefinitions = otherAttrs.map((field) => {
    const {
      name: fieldName,
      type: fieldType,
      isNotNull,
      isArray,
      isArrayNotNull
    } = field;
    let type = t.namedType({ type: fieldType });
    // if (isNotNull) type = t.nonNullType({ type });
    // for some reason "other mutations" didn't have NON_NULL types
    // in the introspection query, so for now just making it required
    type = t.nonNullType({ type });
    if (isArray) {
      type = t.listType({ type });
      if (isArrayNotNull) type = t.nonNullType({ type });
    }
    return t.variableDefinition({
      variable: t.variable({ name: fieldName }),
      type
    });
  });

  const selectArgs =
    otherAttrs.length > 0
      ? [
          t.argument({
            name: 'input',
            value: t.objectValue({
              fields: otherAttrs.map((f) =>
                t.objectField({
                  name: f.name,
                  value: t.variable({ name: f.name })
                })
              )
            })
          })
        ]
      : [];

  const outputs =
    mutation.outputs
      ?.filter((field) => field.type.kind === 'SCALAR')
      .map((f) => f.name) || [];

  if (outputs.length === 0) outputs.push('clientMutationId');

  const selections = outputs.map((o) => t.field({ name: o }));

  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions
  });

  return { name: mutationName, ast };
};

export const generate = (gql) => {
  return Object.keys(gql).reduce((m, v) => {
    const defn = gql[v];
    let name, ast;
    if (defn.qtype === 'mutation') {
      if (defn.mutationType === 'create') {
        ({ name, ast } = createOne({ operationName: v, mutation: defn }));
      } else if (defn.mutationType === 'patch') {
        ({ name, ast } = patchOne({ operationName: v, mutation: defn }));
      } else if (defn.mutationType === 'delete') {
        ({ name, ast } = deleteOne({ operationName: v, mutation: defn }));
      } else {
        ({ name, ast } = createMutation({ operationName: v, mutation: defn }));
      }
    } else if (defn.qtype === 'getMany') {
      ({ name, ast } = getMany({ operationName: v, query: defn }));
    } else if (defn.qtype === 'getOne') {
      ({ name, ast } = getOne({ operationName: v, query: defn }));
    } else {
      console.warn('what is ' + v);
    }
    if (name && ast) m[name] = { name, ast };
    return m;
  }, {});
};
