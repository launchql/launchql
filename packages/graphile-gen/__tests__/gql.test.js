import {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getMany,
  getManyOwned,
  crudify,
  owned
} from '../src';

import cases from 'jest-in-case';
import { print } from 'graphql';
import tables from '../__fixtures__/tables';
const introspectron = JSON.parse(
  require('fs')
    .readFileSync(__dirname + '/../__fixtures__/introspectron.json')
    .toString()
);

// introspect(introspectron);

it('crudify', () => {
  const crud = crudify(introspectron);
  Object.assign(crud, owned(introspectron));
  const fn = Object.keys(crud).reduce((m, key) => {
    m[key] = print(crud[key]);
    return m;
  }, {});
  expect(fn).toMatchSnapshot();
});

cases(
  'getOne',
  (options) => {
    const { ast } = getOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'getMany',
  (options) => {
    const { ast } = getMany(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'getManyOwned',
  (options) => {
    const { ast } = getManyOwned(options.defn, 'owner_id');
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'updateOne',
  (options) => {
    const { ast } = updateOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'createOne',
  (options) => {
    const { ast } = createOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'deleteOne',
  (options) => {
    const { ast } = deleteOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);
