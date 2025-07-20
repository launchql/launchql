import { print } from 'graphql';

import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';
import { generateGranular as generate } from '../src';

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
