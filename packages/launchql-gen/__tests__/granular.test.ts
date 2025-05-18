import { generateGranular as generate } from '../src';

import { print } from 'graphql';
import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';
// import queryNestedSelectionMany from '../__fixtures__/api/query-nested-selection-many.json';
// import queryNestedSelectionOne from '../__fixtures__/api/query-nested-selection-one.json';

it('generate', () => {
  // @ts-ignore
  const gen = generate({ ...queries, ...mutations }, 'Action', [
    'id',
    'name',
    'approved'
  ]);
  
  const output = Object.keys(gen).reduce((m, key) => {
    if (gen[key]?.ast) {
      // @ts-ignore
      m[key] = print(gen[key].ast);
    }
    return m;
  }, {});
  expect(output).toMatchSnapshot();
});

it('generate w count info', () => {
  const gen = generate(
    { ...queries, ...mutations },
    'ActionItem',
    ['userActionItems'],
    // @ts-ignore
    {
      userActionItems: {
        first: 10,
        offset: 10
      }
    }
  );
  
  const output = Object.keys(gen).reduce((m, key) => {
    if (gen[key]?.ast) {
      // @ts-ignore
      m[key] = print(gen[key].ast);
    }
    return m;
  }, {});
  expect(output).toMatchSnapshot();
});