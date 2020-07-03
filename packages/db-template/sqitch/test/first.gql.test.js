import { getConnections } from './utils/graphql';
import gql from 'graphql-tag';

let teardown, graphQLQuery;

beforeAll(async () => {
  ({ teardown, graphQLQuery } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

const CreateUser = gql`
  mutation CreateUser($username: String!) {
    createUser(input: { username: $username }) {
      user {
        id
        username
      }
    }
  }
`;

describe('signup', () => {
  describe('has an API', () => {
    it('query your API', async () => {
      const result = await graphQLQuery(
        CreateUser,
        {
          name: 'pyramation'
        },
        true
      );
      console.log(result);
      expect(result.data).toBeTruthy();
      expect(result.data.CreateUser).toBeTruthy();
    });
  });
});
