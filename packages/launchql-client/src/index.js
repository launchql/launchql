import { print as gqlPrint } from 'graphql';
import { getMany, getOne, getAll, createOne, patchOne, deleteOne } from './ast';
import inflection from 'inflection';
import { validateMetaObject } from './meta-object';
import { isObject } from 'lodash';

export * as MetaObject from './meta-object';

export class Client {
  constructor({ meta = {}, introspection }) {
    this._introspection = introspection;
    this._meta = meta;
    this.clear();
    this.initModelMap();

    const validate = validateMetaObject(this._meta);
    if (typeof validate === 'object' && validate.errors) {
      throw new Error(
        `Client: meta object is not in correct format ${validate.errors}`
      );
    }
  }

  /*
   * Save all gql queries and mutations by model name for quicker lookup
   */
  initModelMap() {
    this._models = Object.keys(this._introspection).reduce((map, key) => {
      const defn = this._introspection[key];
      map = {
        ...map,
        [defn.model]: {
          ...map[defn.model],
          ...{ [key]: defn }
        }
      };
      return map;
    }, {});
  }

  clear() {
    this._model = '';
    this._fields = [];
    this._key = null;
    this._queryName = '';
    this._ast = null;
    this._edges = false;
  }

  query(model) {
    this.clear();
    this._model = model;
    return this;
  }

  _findQuery() {
    // based on the op, finds the relevant GQL query
    const queries = this._models[this._model];
    if (!queries) {
      throw new Error('No queries found for ' + this._model);
    }

    const matchQuery = Object.entries(queries).find(
      ([_, defn]) => defn.qtype === this._op
    );

    if (!matchQuery) {
      throw new Error('No query found for ' + this._model + ':' + this._op);
    }

    const queryKey = matchQuery[0];
    return queryKey;
  }

  _findMutation() {
    // based on the op, finds the relevant GQL query
    const q = Object.keys(this._introspection).reduce((m, v) => {
      const defn = this._introspection[v];
      if (
        defn.model === this._model &&
        defn.qtype === this._op &&
        defn.qtype === 'mutation' &&
        defn.mutationType === this._mutation
      ) {
        return v;
      }
      return m;
    }, null);
    if (!q) {
      throw new Error('no mutation found for ' + this._model + ':' + this._op);
    }
    return q;
  }

  select(selection) {
    // If selection not given, pick only scalar fields
    const defn = this._introspection[this._key];

    if (selection == null) {
      this._select = pickScalarFields(defn, this._meta);
      return this;
    }

    this._select = pickAllFields(selection, defn, this._meta);
    return this;
  }

  edges(useEdges) {
    this._edges = useEdges;
    return this;
  }

  getMany({ select } = {}) {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = getMany({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  all({ select } = {}) {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query', 'all'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = getAll({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  getOne({ select } = {}) {
    this._op = 'getOne';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];
    this.select(select);
    this._ast = getOne({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  create({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'create';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];
    this.select(select);
    this._ast = createOne({
      client: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  delete({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'delete';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = deleteOne({
      client: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  update({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'patch';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = patchOne({
      client: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  queryName(name) {
    this._queryName = name;
    return this;
  }

  print() {
    this._hash = gqlPrint(this._ast);
    return this;
  }
}

/**
 * Pick scalar fields of a query definition
 * @param {Object} defn Query definition
 * @param {Object} meta Meta object containing info about table relations
 * @returns {Array}
 */
function pickScalarFields(defn, meta) {
  const model = defn.model;
  const modelMeta = meta.tables.find((t) => t.name === model);

  const isReferenced = (fieldName) =>
    !!modelMeta.foreignConstraints.find(
      (constraint) => constraint.fromKey.name === fieldName
    );

  const isInTableSchema = (fieldName) =>
    !!modelMeta.fields.find((field) => field.name === fieldName);

  return defn.selection.filter(
    (fieldName) => !isReferenced(fieldName) && isInTableSchema(fieldName)
  );
}

/**
 * Pick scalar fields and sub-selection fields of a query definition
 * @param {Object} selection Selection clause object
 * @param {Object} defn Query definition
 * @param {Object} meta Meta object containing info about table relations
 * @returns {Array}
 */
function pickAllFields(selection, defn) {
  const selectionEntries = Object.entries(selection);
  let fields = [];

  const isWhiteListed = (selectValue) => {
    return typeof selectValue === 'boolean' && selectValue;
  };

  for (const entry of selectionEntries) {
    const [fieldName, fieldOptions] = entry;
    // Case
    // {
    //   goalResults: // fieldName
    //    { select: { id: true }, variables: { first: 100 } } // fieldOptions
    // }
    if (isObject(fieldOptions)) {
      if (!defn.selection.includes(fieldName)) {
        continue;
      }

      const subFields = Object.keys(fieldOptions.select).filter((subField) =>
        isWhiteListed(fieldOptions.select[subField])
      );

      const fieldSelection = {
        name: fieldName,
        selection: subFields,
        variables: fieldOptions.variables
      };

      fields = [...fields, fieldSelection];
    } else {
      // Case
      // {
      //   userId: true // [fieldName, fieldOptions]
      // }
      if (isWhiteListed(fieldOptions)) {
        fields = [...fields, fieldName];
      }
    }
  }

  return fields;
}
