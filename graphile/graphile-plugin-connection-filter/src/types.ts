export type SimpleCollectionSetting = 'omit' | 'both' | 'only';

export interface ConnectionFilterOptions {
  connectionFilterAllowedOperators?: string[];
  connectionFilterAllowedFieldTypes?: string[];
  connectionFilterOperatorNames?: Record<string, string>;
  connectionFilterUseListInflectors?: boolean;
  connectionFilterArrays?: boolean;
  connectionFilterComputedColumns?: boolean;
  connectionFilterRelations?: boolean;
  connectionFilterSetofFunctions?: boolean;
  connectionFilterLogicalOperators?: boolean;
  connectionFilterAllowNullInput?: boolean;
  connectionFilterAllowEmptyObjectInput?: boolean;
  pgSimpleCollections?: SimpleCollectionSetting;
  pgOmitListSuffix?: boolean;
}

export type ConnectionFilterConfig = ConnectionFilterOptions & {
  connectionFilterArrays: boolean;
  connectionFilterComputedColumns: boolean;
  connectionFilterRelations: boolean;
  connectionFilterSetofFunctions: boolean;
  connectionFilterLogicalOperators: boolean;
  connectionFilterAllowNullInput: boolean;
  connectionFilterAllowEmptyObjectInput: boolean;
};
