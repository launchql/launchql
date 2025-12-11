import type { Build } from 'graphile-build';
import type {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgIntrospectionResultsByKind
} from 'graphile-build-pg';

export type SimpleCollectionSetting = 'only' | 'both' | 'omit' | null | undefined;

export interface PgManyToManyOptions {
  pgSimpleCollections?: SimpleCollectionSetting;
  pgForbidSetofFunctionsToReturnNull?: boolean;
}

export interface ManyToManyRelationship {
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

export interface PgManyToManyBuild extends Build {
  pgIntrospectionResultsByKind: PgIntrospectionResultsByKind;
  pgOmit: (entity: any, permission: string) => boolean;
  describePgEntity: (entity: any) => string;
}
