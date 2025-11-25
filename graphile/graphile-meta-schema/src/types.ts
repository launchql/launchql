import type { Build, Options } from 'graphile-build';
import type { GraphQLType } from 'graphql';

export type Identifier = string | number;

export interface PgType {
  id: Identifier;
  name: string;
  isPgArray: boolean;
  arrayItemType?: PgType | null;
  attrTypeModifier?: number | null;
}

export interface PgAttribute {
  num: number;
  name?: string;
  type: PgType;
  typeModifier: number;
}

export type ConstraintType = 'p' | 'f' | 'u' | 'c' | 'x' | string;

export interface PgConstraint {
  id: Identifier;
  name: string;
  type: ConstraintType;
  classId: Identifier;
  foreignClassId?: Identifier | null;
  foreignClass?: PgClass;
  keyAttributes: PgAttribute[];
  foreignKeyAttributes: PgAttribute[];
  keyAttributeNums: number[];
}

export interface PgClass {
  id?: Identifier;
  name: string;
  namespaceName: string;
  classKind: string;
  attributes: PgAttribute[];
  constraints: PgConstraint[];
  foreignConstraints: PgConstraint[];
  primaryKeyConstraint?: PgConstraint | null;
}

export interface PgIntrospectionResultsByKind {
  class: PgClass[];
  classById: Record<string, PgClass>;
}

export interface PgInflection {
  column(attr: PgAttribute): string;
  tableType(table: PgClass): string;
  allRows(table: PgClass): string;
  allRowsSimple(table: PgClass): string;
  tableFieldName(table: PgClass): string;
  orderByType(typeName: string): string;
  filterType?(typeName: string): string | null;
  inputType(typeName: string): string;
  patchType(typeName: string): string;
  conditionType(typeName: string): string;
  patchField(typeName: string): string;
  edge(typeName: string): string;
  edgeField(table: PgClass): string;
  connection(typeName: string): string;
  _typeName(table: PgClass): string;
  enumType(table: PgClass): string;
  createPayloadType(table: PgClass): string;
  updatePayloadType(table: PgClass): string;
  deletePayloadType(table: PgClass): string;
  createField(table: PgClass): string;
  createInputType(table: PgClass): string;
  deleteByKeys(keys: PgAttribute[], table: PgClass, constraint: PgConstraint): string;
  updateByKeys(keys: PgAttribute[], table: PgClass, constraint: PgConstraint): string;
  singleRelationByKeys(
    keys: PgAttribute[],
    foreignTable: PgClass,
    table: PgClass,
    constraint: PgConstraint
  ): string;
  singleRelationByKeysBackwards(
    keys: PgAttribute[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  manyRelationByKeys(
    keys: PgAttribute[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  manyToManyRelationByKeys?: (
    leftKeyAttributes: PgAttribute[],
    junctionLeftKeyAttributes: PgAttribute[],
    junctionRightKeyAttributes: PgAttribute[],
    rightKeyAttributes: PgAttribute[],
    junctionTable: PgClass,
    rightTable: PgClass,
    junctionLeftConstraint: PgConstraint,
    junctionRightConstraint: PgConstraint
  ) => string;
}

export type PgOmit = (entity: PgClass | PgConstraint | PgAttribute, action: string) => boolean;

export type PgBuild = Build & {
  inflection: PgInflection;
  pgIntrospectionResultsByKind: PgIntrospectionResultsByKind;
  pgGetGqlTypeByTypeIdAndModifier: (
    typeId: Identifier,
    typeModifier?: number | null
  ) => GraphQLType;
  pgOmit: PgOmit;
};

export type SchemaOptions = Options & {
  pgSchemas: string[];
};

export interface HasRelation {
  referencedBy: PgClass;
  isUnique: boolean;
  fieldName: string;
  type: 'hasOne' | 'hasMany';
  keys: PgAttribute[];
}

export interface BelongsToRelation {
  references: PgClass;
  isUnique: boolean;
  fieldName: string;
  keys: PgAttribute[];
}

export interface ManyToManyRelation {
  leftKeyAttributes: PgAttribute[];
  junctionLeftKeyAttributes: PgAttribute[];
  junctionRightKeyAttributes: PgAttribute[];
  rightKeyAttributes: PgAttribute[];
  junctionTable: PgClass;
  rightTable: PgClass;
  junctionLeftConstraint: PgConstraint;
  junctionRightConstraint: PgConstraint;
  allowsMultipleEdgesToNode: boolean;
}
