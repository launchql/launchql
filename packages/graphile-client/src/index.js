import { print } from 'graphql';
import {generateGranular as generate } from 'graphile-gen';

export class GraphileClient {
  constructor (meta) {
    this.meta = meta;
    this.query = '';
    this.model = '';
    this.fields = [];
  }

  model(model) {
    this.model = model;
    return this;
  }
  
  fields(fields) {
    this.fields = fields;
    return this;
  }
  
  gen() {
    this.generate = generate({ ...this.meta }, this.model, this.fields);
    this.hash = Object.keys(this.generate).reduce((m, key) => {
      if (this.generate[key]?.ast) {
        m[key] = print(this.generate[key].ast);
      }
      return m;
    }, {});
    return this;
  }

}
