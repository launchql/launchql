import {
  IntrospectionField,
  IntrospectionInputValue,
  IntrospectionQueryResult,
  IntrospectionType,
  IntrospectionTypeRef
} from './gql-types';

interface ParseContext {
  isNotNull?: boolean;
  isArray?: boolean;
  isArrayNotNull?: boolean;
  properties?: Record<string, any>;
  type?: string | null;
  name?: string;
}

interface SelectionContext {
  HASH: Record<string, IntrospectionType>;
  getInputForQueries: (input: IntrospectionTypeRef, context?: ParseContext) => ParseContext;
}

export const parseConnectionQuery = (
  context: SelectionContext,
  query: IntrospectionField,
  nesting: number
) => {
  const { HASH } = context;
  const objectType = getObjectType(query.type)!;
  const Connection = HASH[objectType];
  const nodes = Connection.fields!.find((f) => f.name === 'nodes')!;
  const model = getObjectType(nodes.type)!;

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

export const parseSingleQuery = (
  context: SelectionContext,
  query: IntrospectionField,
  nesting: number
) => {
  const { HASH, getInputForQueries } = context;
  const model = getObjectType(query.type)!;

  if (nesting === 0) {
    return {
      qtype: 'getOne',
      model,
      properties: query.args.reduce((m2, v) => {
        m2[v.name] = getInputForQueries(v.type);
        return m2;
      }, {} as Record<string, any>),
      selection: parseSelectionScalar(context, model)
    };
  }

  return {
    model,
    qtype: 'getOne',
    properties: query.args.reduce((m2, v) => {
      m2[v.name] = getInputForQueries(v.type);
      return m2;
    }, {} as Record<string, any>),
    selection: parseSelectionObject(context, model, 1)
  };
};

export const parseGraphQuery = (introQuery: IntrospectionQueryResult) => {
  const types = introQuery.__schema.types;
  const HASH: Record<string, IntrospectionType> = types.reduce((m, v) => {
    m[v.name] = v;
    return m;
  }, {} as Record<string, IntrospectionType>);

  const queriesRoot = types.find((t) => t.name === 'Query')!;
  const mutationsRoot = types.find((t) => t.name === 'Mutation')!;

  const getInputForQueries = (input: IntrospectionTypeRef, context: ParseContext = {}): ParseContext => {
    if (input.kind === 'NON_NULL') {
      context.isNotNull = true;
      return getInputForQueries(input.ofType!, context);
    }

    if (input.kind === 'LIST') {
      context.isArray = true;
      if (context.isNotNull) {
        context.isArrayNotNull = true;
        delete context.isNotNull;
      }
      return getInputForQueries(input.ofType!, context);
    }

    if (input.kind === 'INPUT_OBJECT' && input.name && HASH.hasOwnProperty(input.name)) {
      const schema = HASH[input.name];
      context.properties = schema.inputFields!.map((field) => ({ name: field.name, type: field.type })).reduce((m3, v) => {
        m3[v.name] = v;
        return m3;
      }, {} as Record<string, any>);
    } else if (input.kind === 'OBJECT' && input.name && HASH.hasOwnProperty(input.name)) {
      const schema = HASH[input.name];
      context.properties = schema.fields!.map((field) => ({ name: field.name, type: field.type })).reduce((m3, v) => {
        m3[v.name] = v;
        return m3;
      }, {} as Record<string, any>);
    } else {
      context.type = input.name ?? null;
    }

    return context;
  };

  const context: SelectionContext = {
    HASH,
    getInputForQueries
  };

  const getInputForMutations = (input: IntrospectionTypeRef, context: ParseContext = {}): ParseContext => {
    if (input.kind === 'NON_NULL') {
      context.isNotNull = true;
      return getInputForMutations(input.ofType!, context);
    }

    if (input.kind === 'LIST') {
      context.isArray = true;
      if (context.isNotNull) {
        context.isArrayNotNull = true;
        delete context.isNotNull;
      }
      return getInputForMutations(input.ofType!, context);
    }

    if (input.kind === 'INPUT_OBJECT' && input.name && HASH.hasOwnProperty(input.name)) {
      const schema = HASH[input.name];
      context.properties = schema.inputFields!.map((field) => getInputForMutations(field.type, { name: field.name })).reduce((m3, v) => {
        m3[v.name!] = v;
        return m3;
      }, {} as Record<string, any>);
    } else if (input.kind === 'OBJECT' && input.name && HASH.hasOwnProperty(input.name)) {
      const schema = HASH[input.name];
      context.properties = schema.fields!.map((field) => ({ name: field.name, type: field.type })).reduce((m3, v) => {
        m3[v.name] = v;
        return m3;
      }, {} as Record<string, any>);
    } else {
      context.type = input.name ?? null;
    }

    return context;
  };

  const mutations = mutationsRoot.fields!.reduce((m, mutation) => {
    let mutationType = 'other';
    if (/^Create/.test(mutation.type.name!)) mutationType = 'create';
    else if (/^Update/.test(mutation.type.name!)) mutationType = 'patch';
    else if (/^Delete/.test(mutation.type.name!)) mutationType = 'delete';

    const props = mutation.args.reduce((m2, arg) => {
      const type = arg.type?.ofType?.name;
      const isNotNull = arg.type?.kind === 'NON_NULL';
      if (type && HASH.hasOwnProperty(type)) {
        const schema = HASH[type];
        const fields = schema.inputFields!.filter((a) => a.name !== 'clientMutationId');
        const properties = fields.map((a) => getInputForMutations(a.type, { name: a.name })).reduce((m3, v) => {
          m3[v.name!] = v;
          return m3;
        }, {} as Record<string, any>);
        m2[arg.name] = { isNotNull, type, properties };
      }
      return m2;
    }, {} as Record<string, any>);

    const getModelTypes = (type: IntrospectionType) =>
      type.fields!.filter((t) => t.type.kind === 'OBJECT' && t.type.name !== 'Query').map((f) => ({ name: f.name, type: f.type }));

    const models = getModelTypes(HASH[mutation.type.name!]);
    if (models.length > 0) {
      const model = models[0].type.name!;
      m[mutation.name] = { qtype: 'mutation', mutationType, model, properties: props, output: mutation.type };
    } else {
      let outputFields: any[] = [];
      if (mutation.type.kind === 'OBJECT') {
        const t = HASH[mutation.type.name!];
        outputFields = t.fields!.map((f) => ({ name: f.name, type: f.type })).filter((f) => f.name !== 'clientMutationId' && f.type.name !== 'Query');
      }
      m[mutation.name] = { qtype: 'mutation', mutationType, properties: props, output: mutation.type, outputs: outputFields };
    }

    return m;
  }, {} as Record<string, any>);

  const queries = queriesRoot.fields!.reduce((m, query) => {
    if (query.type.kind === 'OBJECT') {
      if (isConnectionQuery(query)) {
        m[query.name] = parseConnectionQuery(context, query, 1);
      } else {
        m[query.name] = parseSingleQuery(context, query, 1);
      }
    }
    return m;
  }, {} as Record<string, any>);

  return {
    queries,
    mutations
  };
};

function parseSelectionObject(context: SelectionContext, model: string, nesting: number): any[] {
  const { HASH } = context;
  throwIfInvalidContext(context);

  const selectionFields = HASH[model].fields!.filter((f) => !isPureObjectType(f.type));

  return selectionFields.map((f) => {
    if (f.type.ofType?.kind === 'OBJECT') {
      if (isConnectionQuery(f)) {
        return { name: f.name, ...parseConnectionQuery(context, f, nesting - 1) };
      } else {
        return { name: f.name, ...parseSingleQuery(context, f, nesting - 1) };
      }
    }
    return f.name;
  });
}

function parseSelectionScalar(context: SelectionContext, model: string): string[] {
  const { HASH } = context;
  throwIfInvalidContext(context);

  const selectionFields = HASH[model].fields!.filter(
    (f) => !isPureObjectType(f.type) && !isConnectionQuery(f)
  );

  return selectionFields.map((f) => f.name);
}

function isConnectionQuery(query: { type: IntrospectionTypeRef; args: IntrospectionInputValue[] }): boolean {
  const objectType = getObjectType(query.type);
  const fields = query.args.map((a) => a.name);

  return (
    /Connection$/.test(objectType || '') &&
    fields.includes('condition') &&
    fields.includes('filter')
  );
}

function isPureObjectType(typeObj: IntrospectionTypeRef): boolean {
  return typeObj.kind === 'OBJECT' && typeObj.name == null;
}

function getObjectType(type: IntrospectionTypeRef): string | undefined {
  if (type.kind === 'OBJECT') return type.name || undefined;
  if (type.ofType) return getObjectType(type.ofType);
  return undefined;
}

function throwIfInvalidContext(context: SelectionContext): void {
  const { HASH, getInputForQueries } = context;
  if (!HASH || !getInputForQueries) {
    throw new Error('parseSelection: context missing');
  }
}
