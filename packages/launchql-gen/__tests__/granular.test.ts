import { generateGranular as generate } from '../src';

import { print } from 'graphql';
import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';

it('generate', () => {
  const gen = generate({ ...queries, ...mutations }, 'Action', [
    'id',
    'name',
    'approved'
  ]);

  const output = Object.keys(gen).reduce((m, key) => {
    if (gen[key]?.ast) {
      m[key] = print(gen[key].ast);
    }
    return m;
  }, {});
  expect(output).toMatchSnapshot();
});
