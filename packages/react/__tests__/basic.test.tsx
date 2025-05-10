// @ts-nocheck
jest.setTimeout(20000);
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {
  LqlProvider,
  useGraphqlClient,
  useLaunchqlClient,
  useTableRowsPaginated
} from '../src';
import { QueryClientProvider, QueryClient } from 'react-query';
import { useQuery } from 'react-query';

const TESTING_URL = process.env.TESTING_URL;
if (!TESTING_URL) {
  throw new Error(
    'process.env.TESTING_URL required. Please set a GraphQL Endpoint.'
  );
}
const queryClient = new QueryClient();

afterEach(cleanup);

it('works', async () => {
  const { container } = render(<h1>Hello, World!</h1>);
  expect(container.firstChild).toMatchInlineSnapshot(`
    <h1>
      Hello, World!
    </h1>
  `);
});

const Component = () => {
  const graphqlClient = useGraphqlClient();
  const lqlClient = useLaunchqlClient();
  return <div>Yolo</div>;
};

const FetchUsers = ({ onSuccess, onError }) => {
  const {
    isLoading,
    isFetching,
    isFetched,
    data,
    error
  } = useTableRowsPaginated({
    tableName: 'User',
    skip: !'User',
    select: {
      id: true,
      displayName: true,
      username: true
    },
    onSuccess,
    onError
    // ...queryParams
  });
  if (isLoading || isFetching) {
    return <div>Loading</div>;
  }
  if (isFetched) {
    console.log(data);
    expect(error).toBeFalsy();
    expect(data.nodes).toBeTruthy();
  }
  return <div>Finished</div>;
};

const BasicQuery = ({ onSuccess, onError }) => {
  const graphqlClient = useGraphqlClient();
  const { isLoading, isFetching, isFetched, data, error } = useQuery(
    'userAgent',
    async () => {
      if (!graphqlClient) return null;
      const result = await graphqlClient.request(`query GetUserAgent {
        currentUserAgent
      }
      `);
      return result;
    },
    {
      onError,
      onSuccess,
      enabled: !!graphqlClient
    }
  );
  if (isLoading || isFetching) {
    return <div>Loading</div>;
  }
  if (isFetched) {
    console.log(data);
    expect(error).toBeFalsy();
    expect(data.nodes).toBeTruthy();
  }
  return <div>Finished</div>;
};

it('missing LqlProvider', async () => {
  expect(() => {
    render(<Component>Hello, World!</Component>);
  }).toThrowError('Missing LqlProvider');
});

it('missing QueryClient', async () => {
  expect(() => {
    render(
      <LqlProvider endpointUrl={TESTING_URL}>
        <Component>Hello, World!</Component>
      </LqlProvider>
    );
  }).toThrowError('No QueryClient set, use QueryClientProvider to set one');
});

// const getAuthHeaders = (token) => ({
//   authorization: `Bearer ${token}`
// });

it('useTableRowsPaginated', async (done) => {
  const onSuccess = () => {
    done();
  };
  const onError = () => {
    expect(true).toBe(false);
    done();
  };
  render(
    <QueryClientProvider client={queryClient}>
      <LqlProvider endpointUrl={TESTING_URL} headers={{}}>
        <FetchUsers onSuccess={onSuccess} onError={onError}>
          Hello, World!
        </FetchUsers>
      </LqlProvider>
    </QueryClientProvider>
  );
});

it('useGraphqlClient', async (done) => {
  const onSuccess = () => {
    done();
  };
  const onError = () => {
    expect(true).toBe(false);
    done();
  };
  render(
    <QueryClientProvider client={queryClient}>
      <LqlProvider endpointUrl={TESTING_URL} headers={{}}>
        <BasicQuery onSuccess={onSuccess} onError={onError}>
          Hello, World!
        </BasicQuery>
      </LqlProvider>
    </QueryClientProvider>
  );
});
