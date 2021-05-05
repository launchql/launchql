export const parseGraphQuery = (introQuery) => {
  const types = introQuery.__schema.types;
  const HASH = types.reduce((m, v) => {
    m[v.name] = v;
    return m;
  }, {});

  const queriesRoot = types.find((t) => t.name === 'Query');
  const mutationsRoot = types.find((t) => t.name === 'Mutation');

  const getInputForQueries = (input, context = {}) => {
    if (input.kind === 'NON_NULL') {
      context.isNotNull = true;
      return getInputForQueries(input.ofType, context);
    }

    if (input.kind === 'LIST') {
      context.isArray = true;
      if (context.isNotNull) {
        context.isArrayNotNull = true;
        delete context.isNotNull;
      }
      return getInputForQueries(input.ofType, context);
    }

    if (input.kind === 'INPUT_OBJECT') {
      if (input.name && HASH.hasOwnProperty(input.name)) {
        const schema = HASH[input.name];
        context.properties = schema.inputFields
          .map((field) => {
            return {
              name: field.name,
              type: field.type
            };
          })
          .reduce((m3, v) => {
            m3[v.name] = v;
            return m3;
          }, {});
      }
    } else if (input.kind === 'OBJECT') {
      if (input.name && HASH.hasOwnProperty(input.name)) {
        const schema = HASH[input.name];
        context.properties = schema.fields
          .map((field) => {
            return {
              name: field.name,
              type: field.type
            };
          })
          .reduce((m3, v) => {
            m3[v.name] = v;
            return m3;
          }, {});
      }
    } else {
      context.type = input.name;
    }

    return context;
  };

  const getInputForMutations = (input, context = {}) => {
    if (input.kind === 'NON_NULL') {
      context.isNotNull = true;
      return getInputForMutations(input.ofType, context);
    }

    if (input.kind === 'LIST') {
      context.isArray = true;
      if (context.isNotNull) {
        context.isArrayNotNull = true;
        delete context.isNotNull;
      }
      return getInputForMutations(input.ofType, context);
    }

    if (input.kind === 'INPUT_OBJECT') {
      if (input.name && HASH.hasOwnProperty(input.name)) {
        const schema = HASH[input.name];
        context.properties = schema.inputFields
          .map((field) => {
            return getInputForMutations(field.type, { name: field.name });
          })
          .reduce((m3, v) => {
            m3[v.name] = v;
            return m3;
          }, {});
      }
    } else if (input.kind === 'OBJECT') {
      if (input.name && HASH.hasOwnProperty(input.name)) {
        const schema = HASH[input.name];
        context.properties = schema.fields
          .map((field) => {
            return {
              name: field.name,
              type: field.type
            };
          })
          .reduce((m3, v) => {
            m3[v.name] = v;
            return m3;
          }, {});
      }
    } else {
      context.type = input.name;
    }

    return context;
  };

  const mutations = mutationsRoot.fields.reduce((m, mutation) => {
    let mutationType = 'other';
    if (/^Create/.test(mutation.type.name)) {
      mutationType = 'create';
    } else if (/^Update/.test(mutation.type.name)) {
      mutationType = 'patch';
    } else if (/^Delete/.test(mutation.type.name)) {
      mutationType = 'delete';
    }

    const props = mutation.args.reduce((m2, arg) => {
      const type = arg.type?.ofType?.name;
      const isNotNull = arg.type?.kind === 'NON_NULL';
      if (type && HASH.hasOwnProperty(type)) {
        const schema = HASH[type];
        const fields = schema.inputFields.filter(
          (a) => a.name !== 'clientMutationId'
        );

        const properties = fields
          .map((a) => getInputForMutations(a.type, { name: a.name }))
          .reduce((m3, v) => {
            m3[v.name] = v;
            return m3;
          }, {});
        m2[arg.name] = {
          isNotNull,
          type,
          properties
        };
      } else {
        console.warn('whats wrong with ' + arg);
      }
      return m2;
    }, {});

    const getModelTypes = (type) => {
      return type.fields
        .filter((t) => t.type.kind === 'OBJECT')
        .filter((t) => t.type.name !== 'Query')
        .map((f) => ({ name: f.name, type: f.type }));
    };
    const models = getModelTypes(HASH[mutation.type.name]);
    if (models.length > 0) {
      // TODO this is probably brittle
      const model = models[0].type.name;
      m[mutation.name] = {
        qtype: 'mutation',
        mutationType,
        model,
        properties: props,
        output: mutation.type
      };
    } else {
      // no return args, probably void functions

      let t;
      let outputFields = [];
      if (mutation.type.kind === 'OBJECT') {
        t = HASH[mutation.type.name];
        outputFields = t.fields
          .map((f) => ({ name: f.name, type: f.type }))
          .filter((f) => f.name !== 'clientMutationId')
          .filter((f) => f.type.name !== 'Query');
      }

      m[mutation.name] = {
        qtype: 'mutation',
        mutationType,
        properties: props,
        output: mutation.type,
        outputs: outputFields
      };
    }

    return m;
  }, {});

  //   expect(mts).toMatchSnapshot();

  const parseConnectionQuery = (query, nesting) => {
    const objectType = getObjectType(query.type);
    const Connection = HASH[objectType];
    const nodes = Connection.fields.find((f) => f.name === 'nodes');
    const edges = Connection.fields.find((f) => f.name === 'edges');

    const model = getObjectType(nodes.type);
    const context = { HASH, parseConnectionQuery, parseSingleQuery };

    if (nesting === 0) {
      return {
        qtype: 'getMany',
        model,
        selection: parseSelectionScalar(context, model)
      };
    }

    return {
      qtype: 'getMany',
      model,
      selection: parseSelectionObject(context, model, 1)
    };
  };

  const parseSingleQuery = (query, nesting) => {
    const model = getObjectType(query.type);
    const context = { HASH, parseConnectionQuery, parseSingleQuery };

    if (nesting === 0) {
      return {
        qtype: 'getOne',
        model,
        properties: query.args.reduce((m2, v) => {
          m2[v.name] = getInputForQueries(v.type);
          return m2;
        }, {}),
        selection: parseSelectionScalar(context, model)
      };
    }

    return {
      model,
      qtype: 'getOne',
      properties: query.args.reduce((m2, v) => {
        m2[v.name] = getInputForQueries(v.type);
        return m2;
      }, {}),
      selection: parseSelectionObject(context, model, 1)
    };
  };

  const queries = queriesRoot.fields.reduce((m, query) => {
    // m[query.name] = getInputForQueries(query.type);

    if (query.type.kind === 'OBJECT') {
      if (isConnectionQuery(query)) {
        m[query.name] = parseConnectionQuery(query, 1);
      } else {
        m[query.name] = parseSingleQuery(query, 1);
      }
    }
    return m;
  }, {});

  return {
    queries,
    mutations
  };
};

// Parse selections for both scalar and object fields
function parseSelectionObject(context, model, nesting) {
  const { HASH, parseConnectionQuery, parseSingleQuery } = context;
  throwIfInvalidContext(context);

  const selectionFields = HASH[model].fields.filter(
    (f) => !isPureObjectType(f.type)
  );

  const selection = selectionFields.map((f) => {
    if (f.type.ofType?.kind === 'OBJECT') {
      if (isConnectionQuery(f)) {
        return { name: f.name, ...parseConnectionQuery(f, nesting - 1) };
      } else {
        return { name: f.name, ...parseSingleQuery(f, nesting - 1) };
      }
    }
    return f.name;
  });

  return selection;
}

// Parse selections for scalar types only, ignore all field selections
// that have more nesting selection level
function parseSelectionScalar(context, model) {
  const { HASH } = context;
  throwIfInvalidContext(context);

  const selectionFields = HASH[model].fields.filter(
    (f) => !isPureObjectType(f.type) && !isConnectionQuery(f)
  );

  const selection = selectionFields.map((f) => f.name);

  return selection;
}

function isConnectionQuery(query) {
  const objectType = getObjectType(query.type);
  const fields = query.args.map((a) => a.name);

  return (
    /Connection$/.test(objectType) &&
    fields.includes('condition') &&
    fields.includes('filter')
  );
}

/**
 * Check is a type is pure object type
 * pure object type is different from custom types in the sense that
 * it does not inherit from any type, custom types inherit from a parent type
 * @param {Object} typeObj
 * @returns {boolean}
 */
function isPureObjectType(typeObj) {
  return typeObj.kind === 'OBJECT' && typeObj.name == null;
}

function getObjectType(type) {
  if (type.kind === 'OBJECT') return type.name;
  if (type.ofType) return getObjectType(type.ofType);
}

function throwIfInvalidContext(context) {
  const { HASH, parseConnectionQuery, parseSingleQuery } = context;
  if (!HASH || !parseConnectionQuery || !parseSingleQuery) {
    throw new Error('parseSelection: context missing');
  }
}
