import { gql } from '../src';
import cases from 'jest-in-case';
const mutations = JSON.parse(
  require('fs')
    .readFileSync(__dirname + '/../../graphile-gen/__fixtures__/mutations.json')
    .toString()
);
const queries = JSON.parse(
  require('fs')
    .readFileSync(__dirname + '/../../graphile-gen/__fixtures__/queries.json')
    .toString()
);

it('works', () => {
  const results = gql.generate({ ...mutations, ...queries });
  expect(results).toMatchSnapshot();
});
