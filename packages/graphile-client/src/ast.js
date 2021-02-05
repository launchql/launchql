import * as t from '@pyramation/graphql-ast';
import plz from 'pluralize';
import inflection from 'inflection';
const NON_MUTABLE_PROPS = [
  'id',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy'
];
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

export const getAll = ({ queryName, operationName, query, fields }) => {
  const selections = getSelections(query, fields);

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
  client, // we can use props here to enable pagination, etc
  queryName,
  operationName,
  query,
  fields
}) => {
  const Singular = query.model;
  const Plural = operationName.charAt(0).toUpperCase() + operationName.slice(1);
  const Condition = `${Singular}Condition`;
  const Filter = `${Singular}Filter`;
  const OrderBy = `${Plural}OrderBy`;
  const selections = getSelections(query, fields);

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
                  client._edges
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
  client, // we can use props here to enable pagination, etc
  queryName,
  operationName,
  query,
  fields
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

  const selections = getSelections(query, fields);
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

export const createOne = ({ mutationName, operationName, mutation }) => {
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

  const selections = allAttrs.map((field) => t.field({ name: field.name }));
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

export function getSelections(query, fields = []) {
  const useAll = fields.length === 0;

  return query.selection
    .map((field) => {
      if (!useAll && !fields.includes(field)) return null;
      if (typeof field === 'object' && field !== null) {
        return t.field({
          name: field.name,
          args: [
            t.argument({
              name: 'first',
              value: t.intValue({ value: 3 })
            })
          ],
          selectionSet: t.objectValue({
            fields: [
              t.field({
                name: 'nodes',
                selectionSet: t.selectionSet({
                  selections: field.selection.map((field) =>
                    t.field({ name: field })
                  )
                })
              })
            ]
          })
        });
      }
      return t.field({ name: field });
    })
    .filter((i) => Boolean(i));
}
