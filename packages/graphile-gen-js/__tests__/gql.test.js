import {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getMany,
  getManyOwned
} from '../src';
import cases from 'jest-in-case';
import tables from '../__fixtures__/tables';

cases(
  'getOne',
  (options) => {
    const value = getOne(options.defn);
    expect(value).toMatchSnapshot();
  },
  tables
);

cases(
  'getMany',
  (options) => {
    const value = getMany(options.defn);
    expect(value).toMatchSnapshot();
  },
  tables
);

cases(
  'getManyOwned',
  (options) => {
    const value = getManyOwned(options.defn, 'owner_id');
    expect(value).toMatchSnapshot();
  },
  tables
);

cases(
  'updateOne',
  (options) => {
    const value = updateOne(options.defn);
    expect(value).toMatchSnapshot();
  },
  tables
);

cases(
  'createOne',
  (options) => {
    const value = createOne(options.defn);
    expect(value).toMatchSnapshot();
  },
  tables
);

cases(
  'deleteOne',
  (options) => {
    const value = deleteOne(options.defn);
    expect(value).toMatchSnapshot();
  },
  tables
);
