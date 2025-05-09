import { gql } from 'graphql-request';

export const getSqlActionsQuery = gql`
  query getSqlActionsQuery($databaseId: UUID!) {
    sqlActions(condition: { databaseId: $databaseId }) {
      nodes {
        name
        deps
        deploy
        content
        revert
        verify
      }
    }
  }
`;
