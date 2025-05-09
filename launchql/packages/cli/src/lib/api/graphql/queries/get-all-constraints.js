import { gql } from 'graphql-request';

export const allConstraintsQuery = gql`
  query allConstraintsQuery($tableId: UUID!) {
    foreignKeyConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        type
        name
        fieldId
        tableId
        refTableId
        refFieldId
        deleteAction
        updateAction
      }
    }
    primaryKeyConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        type
        name
        tableId
        fieldIds
      }
    }
    uniqueConstraints(condition: { tableId: $tableId }) {
      nodes {
        id
        name
        type
        tableId
        fieldIds
      }
    }
    table(id: $tableId) {
      database {
        tables {
          nodes {
            id
            name
            fields {
              nodes {
                id
                tableId
                name
                type
              }
            }
          }
        }
      }
    }
    fields(condition: { tableId: $tableId }) {
      nodes {
        id
        name
        type
      }
    }
  }
`;
