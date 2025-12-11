// @ts-nocheck
// import introQuery from '../__fixtures__/introQuery.json';
import introQueryDbe from '../__fixtures__/intro-query-dbe.json';
import { parseGraphQuery } from '../src';

// let queries, mutations;
let queriesDbe, mutationsDbe;

beforeAll(() => {
  // const { queries, mutations } = parseGraphQuery(introQuery);
  const { queries, mutations } = parseGraphQuery(introQueryDbe);
  queriesDbe = queries;
  mutationsDbe = mutations;
});

it('queriesDbe', () => {
  expect(queriesDbe).toMatchSnapshot();
});

it('mutationsDbe', () => {
  expect(mutationsDbe).toMatchSnapshot();
});

it('includes custom scalar types', () => {
  const actions = queriesDbe.actions;
  const names = actions.selection.map((sel) => (typeof sel === 'string' ? sel : sel.name));
  expect(names.includes('location')).toBeTruthy();
  expect(names.includes('timeRequired')).toBeTruthy();
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
