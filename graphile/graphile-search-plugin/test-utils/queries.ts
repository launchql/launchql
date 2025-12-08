import gql from 'graphql-tag';

export const GoalsSearchViaCondition = gql`
  query GoalsSearchViaCondition($search: String!) {
    goals(condition: { fullTextTsv: $search }) {
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
    goals(condition: { fullTextStsv: $search }) {
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
