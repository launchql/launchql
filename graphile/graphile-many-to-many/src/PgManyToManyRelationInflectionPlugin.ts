import type { Plugin } from 'graphile-build';
import type { PgAttribute, PgClass, PgConstraint } from 'graphile-build-pg';

type InflectionFn = (
  leftKeyAttributes: PgAttribute[],
  junctionLeftKeyAttributes: PgAttribute[],
  junctionRightKeyAttributes: PgAttribute[],
  rightKeyAttributes: PgAttribute[],
  junctionTable: PgClass,
  rightTable: PgClass,
  junctionLeftConstraint: PgConstraint,
  junctionRightConstraint: PgConstraint,
  leftTableTypeName?: string
) => string;

const PgManyToManyRelationInflectionPlugin: Plugin = (builder) => {
  (builder as any).hook('inflection', (inflection: any) => {
    const manyToManyRelationByKeys: InflectionFn = function manyToManyRelationByKeys(
      this: any,
      _leftKeyAttributes,
      junctionLeftKeyAttributes,
      junctionRightKeyAttributes,
      _rightKeyAttributes,
      junctionTable,
      rightTable,
      _junctionLeftConstraint,
      junctionRightConstraint
    ) {
      if (junctionRightConstraint.tags.manyToManyFieldName) {
        return junctionRightConstraint.tags.manyToManyFieldName;
      }
      return this.camelCase(
        `${this.pluralize(this._singularizedTableName(rightTable))}-by-${this._singularizedTableName(
          junctionTable
        )}-${[...junctionLeftKeyAttributes, ...junctionRightKeyAttributes]
          .map((attr) => this.column(attr))
          .join('-and-')}`
      );
    };

    const manyToManyRelationByKeysSimple: InflectionFn = function manyToManyRelationByKeysSimple(
      this: any,
      _leftKeyAttributes,
      junctionLeftKeyAttributes,
      junctionRightKeyAttributes,
      _rightKeyAttributes,
      junctionTable,
      rightTable,
      _junctionLeftConstraint,
      junctionRightConstraint
    ) {
      if (junctionRightConstraint.tags.manyToManySimpleFieldName) {
        return junctionRightConstraint.tags.manyToManySimpleFieldName;
      }
      return this.camelCase(
        `${this.pluralize(this._singularizedTableName(rightTable))}-by-${this._singularizedTableName(
          junctionTable
        )}-${[...junctionLeftKeyAttributes, ...junctionRightKeyAttributes]
          .map((attr) => this.column(attr))
          .join('-and-')}-list`
      );
    };

    const manyToManyRelationEdge: InflectionFn = function manyToManyRelationEdge(
      this: any,
      leftKeyAttributes,
      junctionLeftKeyAttributes,
      junctionRightKeyAttributes,
      rightKeyAttributes,
      junctionTable,
      rightTable,
      junctionLeftConstraint,
      junctionRightConstraint,
      leftTableTypeName
    ) {
      const relationName = inflection.manyToManyRelationByKeys(
        leftKeyAttributes,
        junctionLeftKeyAttributes,
        junctionRightKeyAttributes,
        rightKeyAttributes,
        junctionTable,
        rightTable,
        junctionLeftConstraint,
        junctionRightConstraint
      );
      return this.upperCamelCase(`${leftTableTypeName}-${relationName}-many-to-many-edge`);
    };

    const manyToManyRelationConnection: InflectionFn = function manyToManyRelationConnection(
      this: any,
      leftKeyAttributes,
      junctionLeftKeyAttributes,
      junctionRightKeyAttributes,
      rightKeyAttributes,
      junctionTable,
      rightTable,
      junctionLeftConstraint,
      junctionRightConstraint,
      leftTableTypeName
    ) {
      const relationName = inflection.manyToManyRelationByKeys(
        leftKeyAttributes,
        junctionLeftKeyAttributes,
        junctionRightKeyAttributes,
        rightKeyAttributes,
        junctionTable,
        rightTable,
        junctionLeftConstraint,
        junctionRightConstraint,
        leftTableTypeName
      );
      return this.upperCamelCase(`${leftTableTypeName}-${relationName}-many-to-many-connection`);
    };

    const manyToManyRelationSubqueryName: InflectionFn = function manyToManyRelationSubqueryName(
      this: any,
      _leftKeyAttributes,
      _junctionLeftKeyAttributes,
      _junctionRightKeyAttributes,
      _rightKeyAttributes,
      junctionTable
    ) {
      return `many-to-many-subquery-by-${this._singularizedTableName(junctionTable)}`;
    };

    return Object.assign(inflection, {
      manyToManyRelationByKeys,
      manyToManyRelationByKeysSimple,
      manyToManyRelationEdge,
      manyToManyRelationConnection,
      manyToManyRelationSubqueryName
    });
  });
};

export default PgManyToManyRelationInflectionPlugin;
