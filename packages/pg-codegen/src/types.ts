export type Namespace = {
  kind: 'namespace';
  id: string;
  name: string;
  description: string | null;
};

export type Procedure = {
  kind: 'procedure';
  id: string;
  name: string;
  description: string | null;
  namespaceId: string;
  namespaceName: string;
  isStrict: boolean;
  returnsSet: boolean;
  isStable: boolean;
  returnTypeId: string;
  argTypeIds: string[];
  argModes: string[];
  argNames: string[];
  inputArgsCount: number;
  argDefaultsNum: number | null;
  cost: number;
  aclExecutable: boolean;
  language: string | null;
};

export type Class = {
  kind: 'class';
  id: string;
  name: string;
  classKind: string;
  description: string | null;
  namespaceId: string;
  namespaceName: string;
  typeId: string;
  isSelectable: boolean;
  isDeletable: boolean;
  isInsertable: boolean;
  isUpdatable: boolean;
  aclSelectable: boolean;
  aclInsertable: boolean;
  aclUpdatable: boolean;
  aclDeletable: boolean;
};

export type Attribute = {
  kind: 'attribute';
  classId: string;
  num: number;
  name: string;
  description: string | null;
  typeId: string;
  typeModifier: number | null;
  isNotNull: boolean;
  hasDefault: boolean;
  identity: string;
  aclSelectable: boolean;
  aclInsertable: boolean;
  aclUpdatable: boolean;
  columnLevelSelectGrant: boolean;
};

export type Type = {
  kind: 'type';
  id: string;
  name: string;
  description: string | null;
  namespaceId: string;
  namespaceName: string;
  type: string;
  category: string;
  domainIsNotNull: boolean;
  arrayItemTypeId: string | null;
  typeLength: number;
  isPgArray: boolean;
  classId: string | null;
  domainBaseTypeId: string | null;
  domainTypeModifier: number | null;
  domainHasDefault: boolean;
  enumVariants: string[] | null;
  rangeSubTypeId: string | null;
};

export type Constraint = {
  kind: 'constraint';
  id: string;
  name: string;
  type: string;
  classId: string;
  foreignClassId: string | null;
  description: string | null;
  keyAttributeNums: number[];
  foreignKeyAttributeNums: number[] | null;
};

export type Extension = {
  kind: 'extension';
  id: string;
  name: string;
  namespaceId: string;
  namespaceName: string;
  relocatable: boolean;
  version: string;
  configurationClassIds: string[] | null;
  description: string | null;
};

export type Index = {
  kind: 'index';
  id: string;
  name: string;
  namespaceName: string;
  classId: string;
  numberOfAttributes: number;
  isUnique: boolean;
  isPrimary: boolean;
  isImmediate: boolean;
  isReplicaIdentity: boolean;
  isValid: boolean;
  isPartial: boolean;
  attributeNums: number[];
  indexType: string;
  attributePropertiesAsc: boolean[];
  attributePropertiesNullsFirst: boolean[];
  description: string | null;
};

export type DatabaseObject =
  | Namespace
  | Procedure
  | Class
  | Attribute
  | Type
  | Constraint
  | Extension
  | Index;

export type IntrospectionResult = {
  object: DatabaseObject;
};

export type IntrospectionQueryResult = {
  rows: IntrospectionResult[]
};