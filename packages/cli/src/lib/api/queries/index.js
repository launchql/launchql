import { gql } from 'graphql-request';

export const DatabasesQuery = gql`
  query DatabasesQuery {
    databases {
      nodes {
        __typename
        id
        name
      }
    }
  }
`;

export const SchemataQuery = gql`
  query SchemataQuery($databaseId: UUID!) {
    schemata(filter: { databaseId: { equalTo: $databaseId } }) {
      nodes {
        __typename
        id
        databaseId
        name
      }
    }
  }
`;

export const TablesQuery = gql`
  query TablesQuery($databaseId: UUID!) {
    tables(filter: { databaseId: { equalTo: $databaseId } }) {
      nodes {
        __typename
        id
        databaseId
        name
      }
    }
  }
`;

export const CreateDatabaseMutation = gql`
  mutation CreateDatabaseMutation($name: String!) {
    createDatabase(input: { database: { name: $name } }) {
      database {
        __typename
        id
      }
    }
  }
`;

// TODO wtf do we need singular/plural?
export const CreateTableMutation = gql`
  mutation CreateTableMutation($name: String!, $databaseId: UUID!) {
    createTable(
      input: {
        table: {
          name: $name
          singularName: $name
          pluralName: $name
          databaseId: $databaseId
        }
      }
    ) {
      table {
        __typename
        databaseId
        id
        name
      }
    }
  }
`;

export const CreateFieldMutation = gql`
  mutation CreateFieldMutation(
    $name: String!
    $type: String!
    $tableId: UUID!
  ) {
    createField(
      input: { field: { name: $name, type: $type, tableId: $tableId } }
    ) {
      field {
        __typename
        tableId
        id
        name
        type
      }
    }
  }
`;
