import { gql } from '../src';

import { print } from 'graphql';
import mutations from '../__fixtures__/mutations.json';
import queries from '../__fixtures__/queries.json';

it('generate', () => {
  const gen = gql.generate({ ...queries, ...mutations });

  const fn = Object.keys(gen).reduce((m, key) => {
    if (gen[key]?.ast) {
      m[key] = print(gen[key].ast);
    }
    return m;
  }, {});
  expect(fn).toMatchSnapshot();
});
