import { print } from 'graphql';

import queryNestedSelectionMany from '../__fixtures__/api/query-nested-selection-many.json';
import queryNestedSelectionOne from '../__fixtures__/api/query-nested-selection-one.json';
import mutations from '../__fixtures__/mutations.json';
import queries from '../__fixtures__/queries.json';
import {
  getMany,
  getManyPaginatedNodes,
  getOne
} from '../src';
import { generateKeyedObjFromGqlMap } from '../test-utils/generate-from-introspection';

// Type helper (optional but recommended for strong typing on selection fields)
interface FlatField {
  name: string;
  selection: string[];
}

type QueryField = string | FlatField;

interface NestedSelectionQuery {
  [key: string]: {
    model: string;
    selection: QueryField[];
  };
}

describe('GraphQL Code Generation', () => {
  it('generate(): full AST map snapshot', () => {
    // @ts-ignore
    const output = generateKeyedObjFromGqlMap({ ...queries, ...mutations });
    expect(output).toMatchSnapshot('full generate() output');
  });

  it('getManyPaginatedNodes(): works with nested selection', () => {
    const result = getManyPaginatedNodes({
      operationName: 'actionItems',
      // @ts-ignore
      query: (queryNestedSelectionMany as NestedSelectionQuery).actionItems
    });

    expect(print(result.ast)).toMatchSnapshot('getManyPaginatedNodes - actionItems');
  });

  it('getMany(): works with nested selection', () => {
    // @ts-ignore
    const result = getMany({
      operationName: 'actionItems',
      query: (queryNestedSelectionMany as NestedSelectionQuery).actionItems
    });

    expect(print(result.ast)).toMatchSnapshot('getMany - actionItems');
  });

  it('getOne(): works with nested selection', () => {
    const result = getOne({
      operationName: 'action',
      // @ts-ignore
      query: (queryNestedSelectionOne as NestedSelectionQuery).action
    });

    expect(print(result.ast)).toMatchSnapshot('getOne - action');
  });


  xit('getOne(): handles missing selection gracefully', () => {
    // @ts-ignore
    const badQuery = { model: 'action', selection: [] };
    const result = getOne({
      operationName: 'action',
      // @ts-ignore
      query: badQuery
    });

    expect(print(result.ast)).toMatchSnapshot('getOne - empty selection fallback');
  });
});
