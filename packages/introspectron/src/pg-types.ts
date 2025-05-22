type WithTags<T> = T & {
  comment?: string;
  description?: string;
  tags: Record<string, string>;
};

// === Core Types ===

export type PgNamespace = WithTags<{
  id: string;
  name: string;
}>;

export type PgClass = WithTags<{
  id: string;
  name: string;
  namespaceId: string;
  namespaceName: string;
  typeId?: string;
  isExtensionConfigurationTable?: boolean;

  // Linked
  namespace?: PgNamespace;
  type?: PgType;

  // Derived
  attributes?: PgAttribute[];
  canUseAsterisk?: boolean;
  constraints?: PgConstraint[];
  foreignConstraints?: PgConstraint[];
  primaryKeyConstraint?: PgConstraint;
}>;

export type PgAttribute = WithTags<{
  id: string;
  classId: string;
  name: string;
  num: number;
  typeId: string;

  // Linked
  class?: PgClass;
  type?: PgType;

  // Derived
  isIndexed?: boolean;
  isUnique?: boolean;
  columnLevelSelectGrant?: boolean;
}>;

export type PgType = WithTags<{
  id: string;
  name: string;
  namespaceId: string;
  type: string;
  classId?: string;
  domainBaseTypeId?: string;
  arrayItemTypeId?: string;

  // Linked
  namespace?: PgNamespace;
  class?: PgClass;
  domainBaseType?: PgType;
  arrayItemType?: PgType;
  arrayType?: PgType;
}>;

export type PgConstraint = WithTags<{
  id: string;
  name: string;
  classId: string;
  foreignClassId: string | null;
  type: 'p' | 'f' | 'u'; // primary, foreign, unique
  keyAttributeNums: number[];
  foreignKeyAttributeNums: number[] | null;
  isFake?: boolean;
  isIndexed?: boolean;

  // Linked
  class?: PgClass;
  foreignClass?: PgClass;

  // Derived
  keyAttributes?: PgAttribute[];
  foreignKeyAttributes?: PgAttribute[];
}>;

export type PgProcedure = WithTags<{
  id: string;
  name: string;
  namespaceId: string;

  // Linked
  namespace?: PgNamespace;
}>;

export type PgExtension = WithTags<{
  id: string;
  name: string;
  namespaceId: string;
  configurationClassIds: string[];

  // Linked
  namespace?: PgNamespace;
  configurationClasses?: PgClass[];
}>;

export type PgIndex = WithTags<{
  id: string;
  name: string;
  classId: string;
  attributeNums: number[];
  isUnique: boolean;

  // Linked
  class: PgClass;
}>;

// === Full Result Shape ===

export interface PgIntrospectionResultByKind {
  __pgVersion: number;

  namespace: PgNamespace[];
  class: PgClass[];
  attribute: PgAttribute[];
  type: PgType[];
  constraint: PgConstraint[];
  procedure: PgProcedure[];
  extension: PgExtension[];
  index: PgIndex[];

  // Indexed by ID for fast lookup
  namespaceById?: Record<string, PgNamespace>;
  classById?: Record<string, PgClass>;
  typeById?: Record<string, PgType>;
  attributeByClassIdAndNum?: Record<string, Record<string, PgAttribute>>;
  extensionById?: Record<string, PgExtension>;
}