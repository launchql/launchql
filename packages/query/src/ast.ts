// @ts-nocheck

import * as t from 'gql-ast';
import inflection from 'inflection';
import plz from 'pluralize';

import { getCustomAst, isIntervalType } from './custom-ast';

const isObject = val => val !== null && typeof val === 'object';

const NON_MUTABLE_PROPS = ['createdAt', 'createdBy', 'updatedAt', 'updatedBy'];
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

export const getAll = ({ queryName, operationName, query, selection }) => {
  const selections = getSelections(selection);

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

  return ast;
};

export const getMany = ({
  builder, // we can use props here to enable pagination, etc
  queryName,
  operationName,
  query,
  selection
}) => {
  const Singular = query.model;
  const Plural = operationName.charAt(0).toUpperCase() + operationName.slice(1);
  const Condition = `${Singular}Condition`;
  const Filter = `${Singular}Filter`;
  const OrderBy = `${Plural}OrderBy`;
  const selections = getSelections(selection);

  const ast = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions: [
          t.variableDefinition({
            variable: t.variable({
              name: 'first'
            }),
            type: t.namedType({
              type: 'Int'
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'last'
            }),
            type: t.namedType({
              type: 'Int'
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'after'
            }),
            type: t.namedType({
              type: 'Cursor'
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'before'
            }),
            type: t.namedType({
              type: 'Cursor'
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'offset'
            }),
            type: t.namedType({
              type: 'Int'
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'condition'
            }),
            type: t.namedType({
              type: Condition
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'filter'
            }),
            type: t.namedType({
              type: Filter
            })
          }),
          t.variableDefinition({
            variable: t.variable({
              name: 'orderBy'
            }),
            type: t.listType({
              type: t.nonNullType({ type: t.namedType({ type: OrderBy }) })
            })
          })
        ],
        selectionSet: t.selectionSet({
          selections: [
            t.field({
              name: operationName,
              args: [
                t.argument({
                  name: 'first',
                  value: t.variable({
                    name: 'first'
                  })
                }),
                t.argument({
                  name: 'last',
                  value: t.variable({
                    name: 'last'
                  })
                }),
                t.argument({
                  name: 'offset',
                  value: t.variable({
                    name: 'offset'
                  })
                }),
                t.argument({
                  name: 'after',
                  value: t.variable({
                    name: 'after'
                  })
                }),
                t.argument({
                  name: 'before',
                  value: t.variable({
                    name: 'before'
                  })
                }),
                t.argument({
                  name: 'condition',
                  value: t.variable({
                    name: 'condition'
                  })
                }),
                t.argument({
                  name: 'filter',
                  value: t.variable({
                    name: 'filter'
                  })
                }),
                t.argument({
                  name: 'orderBy',
                  value: t.variable({
                    name: 'orderBy'
                  })
                })
              ],
              selectionSet: t.objectValue({
                fields: [
                  t.field({
                    name: 'totalCount'
                  }),
                  t.field({
                    name: 'pageInfo',
                    selectionSet: t.selectionSet({
                      selections: [
                        t.field({ name: 'hasNextPage' }),
                        t.field({ name: 'hasPreviousPage' }),
                        t.field({ name: 'endCursor' }),
                        t.field({ name: 'startCursor' })
                      ]
                    })
                  }),
                  builder._edges
                    ? t.field({
                      name: 'edges',
                      selectionSet: t.selectionSet({
                        selections: [
                          t.field({ name: 'cursor' }),
                          t.field({
                            name: 'node',
                            selectionSet: t.selectionSet({ selections })
                          })
                        ]
                      })
                    })
                    : t.field({
                      name: 'nodes',
                      selectionSet: t.selectionSet({
                        selections
                      })
                    })
                ]
              })
            })
          ]
        })
      })
    ]
  });

  return ast;
};

export const getOne = ({
  builder, // we can use props here to enable pagination, etc
  queryName,
  operationName,
  query,
  selection
}) => {
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

  const selections = getSelections(selection);

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
  return ast;
};

export const createOne = ({
  mutationName,
  operationName,
  mutation,
  selection
}) => {
  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  const allAttrs = objectToArray(
    mutation.properties.input.properties[modelName].properties
  );

  const attrs = allAttrs.filter(
    (field) => !NON_MUTABLE_PROPS.includes(field.name)
  );

  const variableDefinitions = getCreateVariablesAst(attrs);

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

  const selections = selection
    ? getSelections(selection)
    : allAttrs.map((field) => t.field({ name: field.name }));

  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
    modelName
  });

  return ast;
};

export const patchOne = ({
  mutationName,
  operationName,
  mutation,
  selection
}) => {
  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  const allAttrs = objectToArray(
    mutation.properties.input.properties['patch']?.properties || {}
  );

  const patchAttrs = allAttrs.filter(
    (prop) => !NON_MUTABLE_PROPS.includes(prop.name)
  );

  const patchByAttrs = objectToArray(
    mutation.properties.input.properties
  ).filter((n) => n.name !== 'patch');

  const patchers = patchByAttrs.map((p) => p.name);

  const variableDefinitions = getUpdateVariablesAst(patchAttrs, patchers);

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

  const selections = selection
    ? getSelections(selection)
    : allAttrs.map((field) => t.field({ name: field.name }));

  const ast = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
    modelName
  });

  return ast;
};

export const deleteOne = ({ mutationName, operationName, mutation }) => {
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

  return ast;
};

export function getSelections(selection = []) {
  const selectionAst = (field) => {
    return typeof field === 'string'
      ? t.field({
        name: field
      })
      : getCustomAst(field.fieldDefn);
  };

  return selection
    .map((selectionDefn) => {
      if (selectionDefn.isObject) {
        const { name, selection, variables = {}, isBelongTo } = selectionDefn;
        return t.field({
          name,
          args: Object.entries(variables).reduce((args, variable) => {
            const [argName, argValue] = variable;
            const argAst = t.argument({
              name: argName,
              value: getValueAst(argValue)
            });
            args = argAst ? [...args, argAst] : args;
            return args;
          }, []),
          selectionSet: isBelongTo
            ? t.selectionSet({
              selections: selection.map((field) => selectionAst(field))
            })
            : t.objectValue({
              fields: [
                t.field({
                  name: 'totalCount'
                }),
                t.field({
                  name: 'nodes',
                  selectionSet: t.selectionSet({
                    selections: selection.map((field) => selectionAst(field))
                  })
                })
              ]
            })
        });
      } else {
        const { fieldDefn } = selectionDefn;
        // Field is not found in model meta, do nothing
        if (!fieldDefn) return null;

        return getCustomAst(fieldDefn);
      }
    })
    .filter(Boolean);
}

/**
 * Get argument AST from a value
 * @param {*} value
 * @returns {Object} AST for the argument
 */
function getValueAst(value) {
  if (value == null) {
    return t.nullValue();
  }

  if (typeof value === 'number') {
    return t.intValue({ value });
  }

  if (typeof value === 'string') {
    return t.stringValue({ value });
  }

  if (typeof value === 'boolean') {
    return t.booleanValue({ value });
  }

  if (Array.isArray(value)) {
    return t.listValue({ values: value.map((v) => getValueAst(v)) });
  }

  if (isObject(value)) {
    return t.objectValue({
      fields: Object.entries(value).reduce((fields, entry) => {
        const [objKey, objValue] = entry;
        fields = [
          ...fields,
          t.objectField({
            name: objKey,
            value: getValueAst(objValue)
          })
        ];
        return fields;
      }, [])
    });
  }
}

const CustomInputTypes = {
  interval: 'IntervalInput'
};

/**
 * Get mutation variables AST from attributes array
 * @param {Array} attrs
 * @returns {Object} AST for the variables
 */
function getCreateVariablesAst(attrs) {
  return attrs.map((field) => {
    const {
      name: fieldName,
      type: fieldType,
      isNotNull,
      isArray,
      isArrayNotNull,
      properties
    } = field;

    let type;

    if (properties == null) {
      type = t.namedType({ type: fieldType });
    } else if (isIntervalType(properties)) {
      type = t.namedType({ type: CustomInputTypes.interval });
    }

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
}

/**
 * Get mutation variables AST from attributes array
 * @param {Array} attrs
 * @returns {Object} AST for the variables
 */
function getUpdateVariablesAst(attrs, patchers) {
  return attrs.map((field) => {
    const {
      name: fieldName,
      type: fieldType,
      isNotNull,
      isArray,
      properties
    } = field;

    let type;

    if (properties == null) {
      type = t.namedType({ type: fieldType });
    } else if (isIntervalType(properties)) {
      type = t.namedType({ type: CustomInputTypes.interval });
    }

    if (isNotNull) type = t.nonNullType({ type });
    if (isArray) type = t.listType({ type });
    if (patchers.includes(field.name)) type = t.nonNullType({ type });
    return t.variableDefinition({
      variable: t.variable({ name: fieldName }),
      type
    });
  });
}
