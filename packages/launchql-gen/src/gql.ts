// TODO: use inflection for all the things
// const { singularize } = require('inflection');
import * as t from 'gql-ast';
import {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  TypeNode,
  VariableDefinitionNode,
} from 'graphql';
// @ts-ignore
import inflection from 'inflection';
import plz from 'pluralize';

const NON_MUTABLE_PROPS = [
  'id',
  'createdAt',
  'createdBy',
  'updatedAt',
  'updatedBy',
];

const objectToArray = (obj: Record<string, any>): { name: string; [key: string]: any }[] =>
  Object.keys(obj).map((k) => ({ name: k, ...obj[k] }));

interface CreateGqlMutationArgs {
  operationName: string;
  mutationName: string;
  selectArgs: ArgumentNode[];
  selections: FieldNode[];
  variableDefinitions: VariableDefinitionNode[];
  modelName?: string;
  useModel?: boolean;
}

export const createGqlMutation = ({
  operationName,
  mutationName,
  selectArgs,
  variableDefinitions,
  modelName,
  selections,
  useModel = true,
}: CreateGqlMutationArgs): DocumentNode => {

  const opSel: FieldNode[] = !modelName
    ? [
      t.field({
        name: operationName,
        args: selectArgs,
        selectionSet: t.selectionSet({ selections }),
      }),
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
                selectionSet: t.selectionSet({ selections }),
              }),
            ]
            : selections,
        }),
      }),
    ];

  return t.document({
    definitions: [
      t.operationDefinition({
        operation: 'mutation',
        name: mutationName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel }),
      }),
    ],
  });
};

export interface GetManyArgs {
  operationName: string;
  query: any; // You can type this more specifically if you know its structure
  fields: string[];
}

export interface GetManyResult {
  name: string;
  ast: DocumentNode;
}

export const getMany = ({
  operationName,
  query,
  fields,
}: GetManyArgs): GetManyResult => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'query', 'all'].join('_'),
    true
  );

  const selections: FieldNode[] = getSelections(query, fields);

  const opSel: FieldNode[] = [
    t.field({
      name: operationName,
      selectionSet: t.selectionSet({
        selections: [
          t.field({ name: 'totalCount' }),
          t.field({
            name: 'nodes',
            selectionSet: t.selectionSet({ selections }),
          }),
        ],
      }),
    }),
  ];

  const ast: DocumentNode = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        selectionSet: t.selectionSet({ selections: opSel }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface GetManyPaginatedEdgesArgs {
  operationName: string;
  query: GqlField;
  fields: string[];
}

export interface GetManyPaginatedEdgesResult {
  name: string;
  ast: DocumentNode;
}

export const getManyPaginatedEdges = ({
  operationName,
  query,
  fields,
}: GetManyPaginatedEdgesArgs): GetManyPaginatedEdgesResult => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'paginated'].join('_'),
    true
  );

  const Plural = operationName.charAt(0).toUpperCase() + operationName.slice(1);
  const Singular = query.model;
  const Condition = `${Singular}Condition`;
  const Filter = `${Singular}Filter`;
  const OrderBy = `${Plural}OrderBy`;

  const selections: FieldNode[] = getSelections(query, fields);

  const variableDefinitions: VariableDefinitionNode[] = [
    'first',
    'last',
    'offset',
    'after',
    'before',
  ].map((name) =>
    t.variableDefinition({
      variable: t.variable({ name }),
      type: t.namedType({ type: name === 'after' || name === 'before' ? 'Cursor' : 'Int' }),
    })
  );

  variableDefinitions.push(
    t.variableDefinition({
      variable: t.variable({ name: 'condition' }),
      type: t.namedType({ type: Condition }),
    }),
    t.variableDefinition({
      variable: t.variable({ name: 'filter' }),
      type: t.namedType({ type: Filter }),
    }),
    t.variableDefinition({
      variable: t.variable({ name: 'orderBy' }),
      type: t.listType({
        type: t.nonNullType({
          type: t.namedType({ type: OrderBy }),
        }),
      }),
    })
  );

  const args = [
    'first',
    'last',
    'offset',
    'after',
    'before',
    'condition',
    'filter',
    'orderBy',
  ].map((name) =>
    t.argument({
      name,
      value: t.variable({ name }),
    })
  );

  const ast: DocumentNode = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions,
        selectionSet: t.selectionSet({
          selections: [
            t.field({
              name: operationName,
              args,
              selectionSet: t.selectionSet({
                selections: [
                  t.field({ name: 'totalCount' }),
                  t.field({
                    name: 'pageInfo',
                    selectionSet: t.selectionSet({
                      selections: [
                        t.field({ name: 'hasNextPage' }),
                        t.field({ name: 'hasPreviousPage' }),
                        t.field({ name: 'endCursor' }),
                        t.field({ name: 'startCursor' }),
                      ],
                    }),
                  }),
                  t.field({
                    name: 'edges',
                    selectionSet: t.selectionSet({
                      selections: [
                        t.field({ name: 'cursor' }),
                        t.field({
                          name: 'node',
                          selectionSet: t.selectionSet({ selections }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface GetManyPaginatedNodesArgs {
  operationName: string;
  query: GqlField;
  fields: string[];
}

export interface GetManyPaginatedNodesResult {
  name: string;
  ast: DocumentNode;
}

export const getManyPaginatedNodes = ({
  operationName,
  query,
  fields,
}: GetManyPaginatedNodesArgs): GetManyPaginatedNodesResult => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'query'].join('_'),
    true
  );

  const Singular = query.model;
  const Plural = operationName.charAt(0).toUpperCase() + operationName.slice(1);
  const Condition = `${Singular}Condition`;
  const Filter = `${Singular}Filter`;
  const OrderBy = `${Plural}OrderBy`;

  const selections: FieldNode[] = getSelections(query, fields);

  const variableDefinitions: VariableDefinitionNode[] = [
    'first',
    'last',
    'after',
    'before',
    'offset',
  ].map((name) =>
    t.variableDefinition({
      variable: t.variable({ name }),
      type: t.namedType({ type: name === 'after' || name === 'before' ? 'Cursor' : 'Int' }),
    })
  );

  variableDefinitions.push(
    t.variableDefinition({
      variable: t.variable({ name: 'condition' }),
      type: t.namedType({ type: Condition }),
    }),
    t.variableDefinition({
      variable: t.variable({ name: 'filter' }),
      type: t.namedType({ type: Filter }),
    }),
    t.variableDefinition({
      variable: t.variable({ name: 'orderBy' }),
      type: t.listType({
        type: t.nonNullType({
          type: t.namedType({ type: OrderBy }),
        }),
      }),
    })
  );

  const args: ArgumentNode[] = [
    'first',
    'last',
    'offset',
    'after',
    'before',
    'condition',
    'filter',
    'orderBy',
  ].map((name) =>
    t.argument({
      name,
      value: t.variable({ name }),
    })
  );

  const ast: DocumentNode = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions,
        selectionSet: t.selectionSet({
          selections: [
            t.field({
              name: operationName,
              args,
              selectionSet: t.selectionSet({
                selections: [
                  t.field({ name: 'totalCount' }),
                  t.field({
                    name: 'pageInfo',
                    selectionSet: t.selectionSet({
                      selections: [
                        t.field({ name: 'hasNextPage' }),
                        t.field({ name: 'hasPreviousPage' }),
                        t.field({ name: 'endCursor' }),
                        t.field({ name: 'startCursor' }),
                      ],
                    }),
                  }),
                  t.field({
                    name: 'nodes',
                    selectionSet: t.selectionSet({ selections }),
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface GetOrderByEnumsArgs {
  operationName: string;
  query: {
    model: string;
  };
}

export interface GetOrderByEnumsResult {
  name: string;
  ast: DocumentNode;
}

export const getOrderByEnums = ({
  operationName,
  query,
}: GetOrderByEnumsArgs): GetOrderByEnumsResult => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'Order', 'By', 'Enums'].join('_'),
    true
  );

  const Model = operationName.charAt(0).toUpperCase() + operationName.slice(1);
  const OrderBy = `${Model}OrderBy`;

  const ast: DocumentNode = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        selectionSet: t.selectionSet({
          selections: [
            t.field({
              name: '__type',
              args: [
                t.argument({
                  name: 'name',
                  value: t.stringValue({ value: OrderBy }),
                }),
              ],
              selectionSet: t.selectionSet({
                selections: [
                  t.field({
                    name: 'enumValues',
                    selectionSet: t.selectionSet({
                      selections: [t.field({ name: 'name' })],
                    }),
                  }),
                ],
              }),
            }),
          ],
        }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface GetFragmentArgs {
  operationName: string;
  query: GqlField;
}

export interface GetFragmentResult {
  name: string;
  ast: DocumentNode;
}

export const getFragment = ({
  operationName,
  query,
}: GetFragmentArgs): GetFragmentResult => {
  const queryName = inflection.camelize(
    [inflection.underscore(query.model), 'Fragment'].join('_'),
    true
  );

  const selections: FieldNode[] = getSelections(query);

  const ast: DocumentNode = t.document({
    definitions: [
      t.fragmentDefinition({
        name: queryName,
        typeCondition: t.namedType({
          type: query.model,
        }),
        selectionSet: t.selectionSet({
          selections,
        }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface FieldProperty {
  name: string;
  type: string;
  isNotNull?: boolean;
  isArray?: boolean;
  isArrayNotNull?: boolean;
}

export interface GetOneArgs {
  operationName: string;
  query: GqlField;
  fields: string[];
}

export interface GetOneResult {
  name: string;
  ast: DocumentNode;
}

export const getOne = ({
  operationName,
  query,
  fields,
}: GetOneArgs): GetOneResult => {
  const queryName = inflection.camelize(
    ['get', inflection.underscore(operationName), 'query'].join('_'),
    true
  );

  const variableDefinitions: VariableDefinitionNode[] = objectToArray(query.properties)
    .filter((field) => field.isNotNull)
    .map(({ name, type, isNotNull, isArray, isArrayNotNull }) => {
      let gqlType = t.namedType({ type }) as any;

      if (isNotNull) {
        gqlType = t.nonNullType({ type: gqlType });
      }

      if (isArray) {
        gqlType = t.listType({ type: gqlType });
        if (isArrayNotNull) {
          gqlType = t.nonNullType({ type: gqlType });
        }
      }

      return t.variableDefinition({
        variable: t.variable({ name }),
        type: gqlType,
      });
    });

  const selectArgs: ArgumentNode[] = objectToArray(query.properties)
    .filter((field) => field.isNotNull)
    .map((field) =>
      t.argument({
        name: field.name,
        value: t.variable({ name: field.name }),
      })
    );

  const selections: FieldNode[] = getSelections(query, fields);

  const opSel: FieldNode[] = [
    t.field({
      name: operationName,
      args: selectArgs,
      selectionSet: t.selectionSet({ selections }),
    }),
  ];

  const ast: DocumentNode = t.document({
    definitions: [
      t.operationDefinition({
        operation: 'query',
        name: queryName,
        variableDefinitions,
        selectionSet: t.selectionSet({ selections: opSel }),
      }),
    ],
  });

  return { name: queryName, ast };
};

export interface CreateOneArgs {
  operationName: string;
  mutation: MutationSpec;
}

export interface CreateOneResult {
  name: string;
  ast: DocumentNode;
}

export const createOne = ({
  operationName,
  mutation,
}: CreateOneArgs): CreateOneResult | undefined => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for ' + mutationName);
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

  const variableDefinitions: VariableDefinitionNode[] = attrs.map(
    ({ name, type, isNotNull, isArray, isArrayNotNull }) => {
      let gqlType: TypeNode = t.namedType({ type });

      if (isNotNull) {
        gqlType = t.nonNullType({ type: gqlType });
      }

      if (isArray) {
        gqlType = t.listType({ type: gqlType });
        if (isArrayNotNull) {
          gqlType = t.nonNullType({ type: gqlType });
        }
      }

      return t.variableDefinition({
        variable: t.variable({ name }),
        type: gqlType,
      });
    }
  );

  const selectArgs: ArgumentNode[] = [
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
                  value: t.variable({ name: field.name }),
                })
              ),
            }),
          }),
        ],
      }),
    }),
  ];

  const selections: FieldNode[] = allAttrs.map((field) =>
    t.field({ name: 'id' })
  );

  const ast: DocumentNode = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections: [t.field({ name: 'clientMutationId' })],
    variableDefinitions,
    modelName,
    useModel: false,
  });

  return { name: mutationName, ast };
};

interface MutationOutput {
  name: string;
  type: {
    kind: string; // typically "SCALAR", "OBJECT", etc. from GraphQL introspection
  };
}

export interface MutationSpec {
  model: string;
  properties: {
    input?: {
      properties?: Record<string, any>;
    };
  };
  outputs?: MutationOutput[]; // ✅ Add this line

}

export interface PatchOneArgs {
  operationName: string;
  mutation: MutationSpec;
}

export interface PatchOneResult {
  name: string;
  ast: DocumentNode;
}

export const patchOne = ({
  operationName,
  mutation,
}: PatchOneArgs): PatchOneResult | undefined => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for ' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  // @ts-ignore
  const allAttrs: FieldNode[] = objectToArray(
    mutation.properties.input.properties['patch']?.properties || {}
  );

  const patchAttrs = allAttrs.filter(
    // @ts-ignore
    (prop) => !NON_MUTABLE_PROPS.includes(prop.name)
  );

  const patchByAttrs = objectToArray(
    mutation.properties.input.properties
  ).filter((n) => n.name !== 'patch');

  const patchers = patchByAttrs.map((p) => p.name);

  const patchAttrVarDefs: VariableDefinitionNode[] = patchAttrs
    // @ts-ignore
    .filter((field) => !patchers.includes(field.name))
    .map(
    // @ts-ignore
    ({ name, type, isArray }) => {
      let gqlType: TypeNode = t.namedType({ type });

      if (isArray) {
        gqlType = t.listType({ type: gqlType });
      }

      // @ts-ignore
      if (patchers.includes(name)) {
        gqlType = t.nonNullType({ type: gqlType });
      }

      return t.variableDefinition({
        // @ts-ignore
        variable: t.variable({ name }),
        type: gqlType,
      });
    }
  );

  const patchByVarDefs: VariableDefinitionNode[] = patchByAttrs.map(({ name, type, isNotNull, isArray, isArrayNotNull }) => {
    let gqlType: TypeNode = t.namedType({ type });
    if (isNotNull) {
      gqlType = t.nonNullType({ type: gqlType });
    }
    if (isArray) {
      gqlType = t.listType({ type: gqlType });
      if (isArrayNotNull) {
        gqlType = t.nonNullType({ type: gqlType });
      }
    }
    return t.variableDefinition({ variable: t.variable({ name }), type: gqlType });
  });

  const selectArgs: ArgumentNode[] = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: [
          ...patchByAttrs.map((field) =>
            t.objectField({
              name: field.name,
              value: t.variable({ name: field.name }),
            })
          ),
          t.objectField({
            name: 'patch',
            value: t.objectValue({
              fields: patchAttrs
              // @ts-ignore
                .filter((field) => !patchers.includes(field.name))
                .map((field) =>
                  t.objectField({
                    // @ts-ignore
                    name: field.name,
                    // @ts-ignore
                    value: t.variable({ name: field.name }),
                  })
                ),
            }),
          }),
        ],
      }),
    }),
  ];

  const selections: FieldNode[] = [t.field({ name: 'clientMutationId' })];

  const ast: DocumentNode = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions: [...patchByVarDefs, ...patchAttrVarDefs],
    modelName,
    useModel: false,
  });

  return { name: mutationName, ast };
};


export interface DeleteOneArgs {
  operationName: string;
  mutation: MutationSpec;
}

export interface DeleteOneResult {
  name: string;
  ast: DocumentNode;
}

export const deleteOne = ({
  operationName,
  mutation,
}: DeleteOneArgs): DeleteOneResult | undefined => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for ' + mutationName);
    return;
  }

  const modelName = inflection.camelize(
    [plz.singular(mutation.model)].join('_'),
    true
  );

  // @ts-ignore
  const deleteAttrs: FieldProperty[] = objectToArray(
    mutation.properties.input.properties
  );

  const variableDefinitions: VariableDefinitionNode[] = deleteAttrs.map(
    ({ name, type, isNotNull, isArray }) => {
      let gqlType: TypeNode = t.namedType({ type });

      if (isNotNull) {
        gqlType = t.nonNullType({ type: gqlType });
      }

      if (isArray) {
        gqlType = t.listType({ type: gqlType });
        // Always non-null list for deletion fields
        gqlType = t.nonNullType({ type: gqlType });
      }

      return t.variableDefinition({
        variable: t.variable({ name }),
        type: gqlType,
      });
    }
  );

  const selectArgs: ArgumentNode[] = [
    t.argument({
      name: 'input',
      value: t.objectValue({
        fields: deleteAttrs.map((f) =>
          t.objectField({
            name: f.name,
            value: t.variable({ name: f.name }),
          })
        ),
      }),
    }),
  ];

  const selections: FieldNode[] = [t.field({ name: 'clientMutationId' })];

  const ast: DocumentNode = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
    modelName,
    useModel: false,
  });

  return { name: mutationName, ast };
};

export interface CreateMutationArgs {
  operationName: string;
  mutation: MutationSpec;
}

export interface CreateMutationResult {
  name: string;
  ast: DocumentNode;
}

export const createMutation = ({
  operationName,
  mutation,
}: CreateMutationArgs): CreateMutationResult | undefined => {
  const mutationName = inflection.camelize(
    [inflection.underscore(operationName), 'mutation'].join('_'),
    true
  );

  if (!mutation.properties?.input?.properties) {
    console.log('no input field for mutation for ' + mutationName);
    return;
  }

  // @ts-ignore
  const otherAttrs: FieldProperty[] = objectToArray(
    mutation.properties.input.properties
  );

  const variableDefinitions: VariableDefinitionNode[] = otherAttrs.map(
    ({ name, type, isArray, isArrayNotNull }) => {
      let gqlType: TypeNode = t.namedType({ type });

      // Force as non-nullable for mutation reliability (as per your comment)
      gqlType = t.nonNullType({ type: gqlType });

      if (isArray) {
        gqlType = t.listType({ type: gqlType });
        if (isArrayNotNull) {
          gqlType = t.nonNullType({ type: gqlType });
        }
      }

      return t.variableDefinition({
        variable: t.variable({ name }),
        type: gqlType,
      });
    }
  );

  const selectArgs: ArgumentNode[] =
    otherAttrs.length > 0
      ? [
        t.argument({
          name: 'input',
          value: t.objectValue({
            fields: otherAttrs.map((f) =>
              t.objectField({
                name: f.name,
                value: t.variable({ name: f.name }),
              })
            ),
          }),
        }),
      ]
      : [];

  const outputFields: string[] =
    mutation.outputs
      ?.filter((field) => field.type.kind === 'SCALAR')
      .map((f) => f.name) || [];

  if (outputFields.length === 0) {
    outputFields.push('clientMutationId');
  }

  const selections: FieldNode[] = outputFields.map((o) => t.field({ name: o }));

  const ast: DocumentNode = createGqlMutation({
    operationName,
    mutationName,
    selectArgs,
    selections,
    variableDefinitions,
  });

  return { name: mutationName, ast };
};

type QType = 'mutation' | 'getOne' | 'getMany';
type MutationType = 'create' | 'patch' | 'delete' | string;

interface FlatField {
  name: string;
  selection: string[];
}

interface GqlField {
  qtype: QType;
  mutationType?: MutationType;
  model?: string;
  properties?: Record<string, Omit<FieldProperty, 'name'>>;
  outputs?: {
    name: string;
    type: {
      kind: string;
    };
  }[];
  selection?: QueryField[]
}

type QueryField = string | FlatField;

export interface GqlMap {
  [operationName: string]: GqlField;
}

interface AstMapEntry {
  name: string;
  ast: DocumentNode;
}

interface AstMap {
  [key: string]: AstMapEntry;
}

export const generate = (gql: GqlMap): AstMap => {
  return Object.keys(gql).reduce<AstMap>((m, operationName) => {
    const defn = gql[operationName];
    let name: string | undefined;
    let ast: DocumentNode | undefined;

    if (defn.qtype === 'mutation') {
      if (defn.mutationType === 'create') {
        ({ name, ast } = createOne({ operationName, mutation: defn as MutationSpec }) ?? {});
      } else if (defn.mutationType === 'patch') {
        ({ name, ast } = patchOne({ operationName, mutation: defn as MutationSpec }) ?? {});
      } else if (defn.mutationType === 'delete') {
        ({ name, ast } = deleteOne({ operationName, mutation: defn as MutationSpec }) ?? {});
      } else {
        ({ name, ast } = createMutation({ operationName, mutation: defn as MutationSpec }) ?? {});
      }
    } else if (defn.qtype === 'getMany') {
      // getMany + related
      [
        getMany,
        getManyPaginatedEdges,
        getManyPaginatedNodes,
        getOrderByEnums,
        getFragment
      ].forEach(fn => {
        // @ts-ignore
        const result = fn({ operationName, query: defn });
        if (result?.name && result?.ast) {
          m[result.name] = result;
        }
      });
    } else if (defn.qtype === 'getOne') {
      // @ts-ignore
      ({ name, ast } = getOne({ operationName, query: defn }) ?? {});
    } else {
      console.warn('Unknown qtype for key: ' + operationName);
    }

    if (name && ast) {
      m[name] = { name, ast };
    }

    return m;
  }, {});
};

export const generateGranular = (
  gql: GqlMap,
  model: string,
  fields: string[]
): AstMap => {
  return Object.keys(gql).reduce<AstMap>((m, operationName) => {
    const defn = gql[operationName];
    const matchModel = defn.model;

    let name: string | undefined;
    let ast: DocumentNode | undefined;

    if (defn.qtype === 'getMany') {
      const many = getMany({ operationName, query: defn, fields });
      if (many?.name && many?.ast && model === matchModel) {
        m[many.name] = many;
      }

      const paginatedEdges = getManyPaginatedEdges({
        operationName,
        query: defn,
        fields,
      });
      if (paginatedEdges?.name && paginatedEdges?.ast && model === matchModel) {
        m[paginatedEdges.name] = paginatedEdges;
      }

      const paginatedNodes = getManyPaginatedNodes({
        operationName,
        query: defn,
        fields,
      });
      if (paginatedNodes?.name && paginatedNodes?.ast && model === matchModel) {
        m[paginatedNodes.name] = paginatedNodes;
      }
    } else if (defn.qtype === 'getOne') {
      const one = getOne({ operationName, query: defn, fields });
      if (one?.name && one?.ast && model === matchModel) {
        m[one.name] = one;
      }
    }

    return m;
  }, {});
};


export function getSelections(
  query: GqlField,
  fields: string[] = []
): FieldNode[] {
  const useAll = fields.length === 0;

  const mapItem = (item: QueryField): FieldNode | null => {
    if (typeof item === 'string') {
      if (!useAll && !fields.includes(item)) return null;
      return t.field({ name: item });
    }
    if (
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      'selection' in item &&
      Array.isArray(item.selection)
    ) {
      if (!useAll && !fields.includes(item.name)) return null;
      const isMany = (item as any).qtype === 'getMany';
      if (isMany) {
        return t.field({
          name: item.name,
          args: [
            t.argument({ name: 'first', value: t.intValue({ value: '3' as any }) }),
          ],
          selectionSet: t.selectionSet({
            selections: [
              t.field({
                name: 'nodes',
                selectionSet: t.selectionSet({ selections: item.selection.map((s) => mapItem(s)).filter(Boolean) as FieldNode[] }),
              }),
            ],
          }),
        });
      }
      return t.field({
        name: item.name,
        selectionSet: t.selectionSet({ selections: item.selection.map((s) => mapItem(s)).filter(Boolean) as FieldNode[] }),
      });
    }
    return null;
  };

  return query.selection.map((field) => mapItem(field)).filter((i): i is FieldNode => Boolean(i));
}
