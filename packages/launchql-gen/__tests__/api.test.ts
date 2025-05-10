import { generate } from '../src';
import { print } from 'graphql';
import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';

it('generate', () => {
  // @ts-ignore
  const gen = generate({ ...queries, ...mutations });

  const output = Object.keys(gen).reduce<Record<string, string>>((acc, key) => {
    const entry = gen[key];
    if (entry?.ast) {
      acc[key] = print(entry.ast);
    }
    return acc;
  }, {});

  expect(output).toMatchSnapshot();
});
