import { generate, getManyPaginatedNodes, getMany, getOne } from '../src';

import { print } from 'graphql';
import mutations from '../__fixtures__/mutations.json';
import queries from '../__fixtures__/queries.json';
import queryNestedSelectionMany from '../__fixtures__/api/query-nested-selection-many.json';
import queryNestedSelectionOne from '../__fixtures__/api/query-nested-selection-one.json';

it('generate', () => {
  const gen = generate({ ...queries, ...mutations });

  const output = Object.keys(gen).reduce((m, key) => {
    if (gen[key]?.ast) {
      m[key] = print(gen[key].ast);
    }
    return m;
  }, {});
  expect(output).toMatchSnapshot();
});

it('getManyPaginatedNodes(): works with nested selection', () => {
  const result = getManyPaginatedNodes({
    operationName: 'actionItems',
    query: queryNestedSelectionMany.actionItems
  });
  // console.log(print(result.ast));
  expect(print(result.ast)).toMatchSnapshot();
});

it('getMany(): works with nested selection', () => {
  const result = getMany({
    operationName: 'actionItems',
    query: queryNestedSelectionMany.actionItems
  });
  // console.log(print(result.ast));
  expect(print(result.ast)).toMatchSnapshot();
});

it('getOne(): works with nested selection', () => {
  const result = getOne({
    operationName: 'action',
    query: queryNestedSelectionOne.action
  });
  // console.log(print(result.ast));
  expect(print(result.ast)).toMatchSnapshot();
});
