import { gql } from 'graphile-test';

export const GoalsSearchViaCondition = gql`
  query GoalsSearchViaCondition($search: String!) {
    goals(condition: { searchTsv: $search }) {
      nodes {
        id
        title
        description
      }
    }
  }
`;

export const GoalsSearchViaFilter = gql`
  query GoalsSearchViaFilter($search: String!) {
    goals(filter: { tsv: { matches: $search } }) {
      nodes {
        id
        title
        description
      }
    }
  }
`;

export const GoalsSearchViaCondition2 = gql`
  query GoalsSearchViaCondition($search: String!) {
    goals(condition: { searchStsv: $search }) {
      nodes {
        id
        title
        description
      }
    }
  }
`;

export const GoalsSearchViaFilter2 = gql`
  query GoalsSearchViaFilter($search: String!) {
    goals(filter: { stsv: { matches: $search } }) {
      nodes {
        id
        title
        description
      }
    }
  }
`;
