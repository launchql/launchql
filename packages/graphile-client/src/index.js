import { print as gqlPrint } from 'graphql';
import { getMany, getOne } from './ast';
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

  _find() {
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

  select(select) {
    this.fields(Object.keys(select));
    this._select = select;
    return this;
  }

  getMany() {
    this._op = 'getMany';
    this._key = this._find();

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

  getOne() {
    this._op = 'getOne';
    this._key = this._find();

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

  queryName(name) {
    this._queryName = name;
    return this;
  }

  print() {
    this._hash = gqlPrint(this._ast);
    return this;
  }
}
