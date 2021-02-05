import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';
import { GraphileClient } from '../src';

it('getMany', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true,
      actionResults: {
        select: {
          id: true
        },
        variables: {
          first: 10,
          last: 10,
          before: null
        }
      }
    })
    .getMany()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});

it('getMany edges', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true,
      actionResults: {
        select: {
          id: true
        },
        variables: {
          first: 10,
          last: 10,
          before: null
        }
      }
    })
    .edges(true)
    .getMany()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});

it('getOne', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true,
      actionResults: {
        select: {
          id: true
        },
        variables: {
          first: 10,
          last: 10,
          before: null
        }
      }
    })
    .getOne()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});

it('getAll', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true,
      actionResults: {
        select: {
          id: true
        },
        variables: {
          first: 10,
          last: 10,
          before: null
        }
      }
    })
    .all()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});

it('create', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true
    })
    .create()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});
it('delete', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true
    })
    .delete()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});
it('update', () => {
  const client = new GraphileClient({ ...queries, ...mutations });
  const result = client
    .query('Action')
    .select({
      id: true,
      name: true,
      photo: true,
      title: true
    })
    .update()
    .print();
  expect(client._hash).toMatchSnapshot();
  expect(client._queryName).toMatchSnapshot();
});
