import {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getMany,
  getManyOwned
} from '../src';
import cases from 'jest-in-case';
import { print } from 'graphql';
import tables from '../__fixtures__/tables';

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
