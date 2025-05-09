import { getConnections } from './utils/graphql';
import gql from 'graphql-tag';

let teardown, graphQLQuery;

beforeAll(async () => {
  ({ teardown, graphQLQuery } = await getConnections(['myschema_public']));
});

afterAll(async () => {
  await teardown();
});

const CreateUser = gql`
  mutation CreateUser($username: String!) {
    createUser(input: { user: { username: $username } }) {
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
          username: 'pyramation'
        },
        true
      );
      expect(result.data).toBeTruthy();
      expect(result.data.createUser).toBeTruthy();
      expect(result.data.createUser.user).toBeTruthy();
      expect(result.data.createUser.user.id).toBeTruthy();
    });
  });
});
