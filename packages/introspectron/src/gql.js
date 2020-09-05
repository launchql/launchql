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
    if (/Create/.test(mutation.type.name)) {
      mutationType = 'create';
    } else if (/Update/.test(mutation.type.name)) {
      mutationType = 'patch';
    } else if (/Delete/.test(mutation.type.name)) {
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

  const getObjectType = (type) => {
    if (type.kind === 'OBJECT') return type.name;
    if (type.ofType) return getObjectType(type.ofType);
  };

  const queries = queriesRoot.fields.reduce((m, query) => {
    // m[query.name] = getInputForQueries(query.type);

    if (query.type.kind === 'OBJECT') {
      const fields = query.args.map((a) => a.name);
      if (
        /Connection$/.test(query.type.name) &&
        fields.includes('condition') &&
        fields.includes('filter')
      ) {
        // queries via nodes (later edges)

        const Connection = HASH[query.type.name];
        const nodes = Connection.fields.find((f) => f.name === 'nodes');
        const edges = Connection.fields.find((f) => f.name === 'edges');

        // multiple getters
        const model = getObjectType(nodes.type);
        // don't automatically select objects...
        const selectionFields = HASH[model].fields.filter(
          (f) => f.type.kind !== 'OBJECT'
        );
        const selection = selectionFields.map((f) => f.name);
        m[query.name] = {
          qtype: 'getMany',
          model,
          selection
        };
      } else {
        // single getters
        const model = query.type.name;
        // don't automatically select objects...
        const selectionFields = HASH[model].fields.filter(
          (f) => f.type.kind !== 'OBJECT'
        );
        const selection = selectionFields.map((f) => f.name);

        m[query.name] = {
          model,
          qtype: 'getOne',
          properties: query.args.reduce((m2, v) => {
            m2[v.name] = getInputForQueries(v.type);
            return m2;
          }, {}),
          selection
        };
      }
    }
    return m;
  }, {});

  return {
    queries,
    mutations
  };
};
