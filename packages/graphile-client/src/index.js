import { print as gqlPrint } from 'graphql';
import { getMany, getOne, getAll, createOne } from './ast';
import inflection from 'inflection';

export class GraphileClient {
  constructor(meta) {
    this._meta = meta;
    this.clear();
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

  fields(fields) {
    this._fields = fields;
    return this;
  }

  _findQuery() {
    // based on the op, finds the relevant GQL query
    const q = Object.keys(this._meta).reduce((m, v) => {
      const defn = this._meta[v];
      const matchModel = defn.model;
      if (matchModel === this._model && defn.qtype === this._op) {
        return v;
      }
      return m;
    }, null);
    if (!q) {
      throw new Error('no query found for ' + this._model + ':' + this._op);
    }
    return q;
  }

  _findMutation() {
    // based on the op, finds the relevant GQL query
    const q = Object.keys(this._meta).reduce((m, v) => {
      const defn = this._meta[v];
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

  select(select) {
    this.fields(Object.keys(select));
    this._select = select;
    return this;
  }

  edges(useEdges) {
    this._edges = useEdges;
    return this;
  }

  getMany() {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._meta[this._key];

    this._ast = getMany({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      fields: this._fields
    });

    return this;
  }

  all() {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query', 'all'].join('_'),
        true
      )
    );

    const defn = this._meta[this._key];

    this._ast = getAll({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      fields: this._fields
    });

    return this;
  }

  getOne() {
    this._op = 'getOne';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._meta[this._key];

    this._ast = getOne({
      client: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      fields: this._fields
    });

    return this;
  }

  create() {
    this._op = 'mutation';
    this._mutation = 'create';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._meta[this._key];

    this._ast = createOne({
      client: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      fields: this._fields
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
