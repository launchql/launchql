import { gql } from 'graphql-request';

export const foreignKeyConstraintsQuery = gql`
  query foreignKeyConstraintsQuery($tableId: UUID!) {
    foreignKeyConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        fieldId
        tableId
        refTableId
        refFieldId
        deleteAction
        updateAction
      }
    }
  }
`;
