import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';
import { GraphileClient } from '../src';

it('getMany', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .fields(['id', 'name', 'approved'])
    .getMany()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});

it('getOne', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .fields(['id', 'name', 'approved'])
    .getOne()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});
