import { print } from 'graphql';
import introQuery from '../__fixtures__/introQuery.json';
import { parseGraphQuery } from '../src';

let queries, mutations;

beforeAll(() => {
  ({ queries, mutations } = parseGraphQuery(introQuery));
});
it('queries', () => {
  expect(queries).toMatchSnapshot();
});
it('mutations', () => {
  expect(mutations).toMatchSnapshot();
});

// it('write', () => {
//   require('fs').writeFileSync(
//     __dirname + '/mutations.json',
//     JSON.stringify(mutations, null, 2)
//   );
//   require('fs').writeFileSync(
//     __dirname + '/queries.json',
//     JSON.stringify(queries, null, 2)
//   );
// });
