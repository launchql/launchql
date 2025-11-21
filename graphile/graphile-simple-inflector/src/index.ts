import type { Plugin } from 'graphile-build';

type InflectionStringFn = (this: PgInflection, str: string) => string;

type TagMap = Record<string, string | boolean | undefined>;

interface PgClass {
  name: string;
}

interface PgConstraint {
  classId: number | string;
  foreignClassId: number | string;
  type: string;
  tags: TagMap;
}

interface PgProc {
  returnsSet: boolean;
  tags: TagMap;
}

type DetailedKey = unknown;

interface PgInflection {
  camelCase: InflectionStringFn;
  upperCamelCase: InflectionStringFn;
  pluralize: InflectionStringFn;
  singularize: InflectionStringFn;
  distinctPluralize(str: string): string;
  deletedNodeId(table: PgClass): string;
  _columnName(key: DetailedKey): string;
  _functionName(proc: PgProc): string;
  _singularizedTableName(table: PgClass): string;
  column(key: DetailedKey): string;
  singleRelationByKeys(
    detailedKeys: DetailedKey[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  singleRelationByKeysBackwards(
    detailedKeys: DetailedKey[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  manyRelationByKeys(
    detailedKeys: DetailedKey[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  manyRelationByKeysSimple(
    detailedKeys: DetailedKey[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string;
  computedColumn(pseudoColumnName: string, proc: PgProc, table: PgClass): string;
  computedColumnList(pseudoColumnName: string, proc: PgProc, table: PgClass): string;
  functionQueryName(proc: PgProc): string;
  functionQueryNameList(proc: PgProc): string;
  rowByUniqueKeys(detailedKeys: DetailedKey[], table: PgClass, constraint: PgConstraint): string;
  updateByKeys(detailedKeys: DetailedKey[], table: PgClass, constraint: PgConstraint): string;
  deleteByKeys(detailedKeys: DetailedKey[], table: PgClass, constraint: PgConstraint): string;
  updateByKeysInputType(
    detailedKeys: DetailedKey[],
    table: PgClass,
    constraint: PgConstraint
  ): string;
  deleteByKeysInputType(
    detailedKeys: DetailedKey[],
    table: PgClass,
    constraint: PgConstraint
  ): string;
  tableNode(table: PgClass): string;
  updateNode(table: PgClass): string;
  deleteNode(table: PgClass): string;
  updateNodeInputType(table: PgClass): string;
  deleteNodeInputType(table: PgClass): string;
  getBaseName?(columnName: string): string | null;
  baseNameMatches?(baseName: string | null, otherName: string): boolean;
  baseNameMatchesAny?(baseName: string | null, otherName: string): boolean;
  patchField?(): string;
  getOppositeBaseName?(baseName: string | null): string | null;
  getBaseNameFromKeys?(detailedKeys: DetailedKey[]): string | null;
  _manyRelationByKeysBase?(
    detailedKeys: DetailedKey[],
    table: PgClass,
    foreignTable: PgClass,
    constraint: PgConstraint
  ): string | null;
}

export interface PgSimpleInflectorOptions {
  pgSimpleCollections?: 'only' | 'both';
  pgOmitListSuffix?: boolean;
  pgSimplifyPatch?: boolean;
  pgSimplifyAllRows?: boolean;
  pgShortPk?: boolean;
  pgSimplifyMultikeyRelations?: boolean;
  pgSimplifyOppositeBaseNames?: boolean;
  nodeIdFieldName?: string;
}

const fixCapitalisedPlural = (fn: InflectionStringFn): InflectionStringFn =>
  function capitalisedPlural(this: PgInflection, str: string): string {
    const original = fn.call(this, str);
    return original.replace(/[0-9]S(?=[A-Z]|$)/g, (match) => match.toLowerCase());
  };

const fixChangePlural = (fn: InflectionStringFn): InflectionStringFn =>
  function changePlural(this: PgInflection, str: string): string {
    const matches = str.match(/([A-Z]|_[a-z0-9])[a-z0-9]*_*$/);
    const index = matches ? (matches.index ?? 0) + matches[1].length - 1 : 0;
    const suffixMatches = str.match(/_*$/);
    const suffixIndex =
      suffixMatches && suffixMatches.index !== undefined ? suffixMatches.index : str.length;
    const prefix = str.slice(0, index);
    const word = str.slice(index, suffixIndex);
    const suffix = str.slice(suffixIndex);
    return `${prefix}${fn.call(this, word)}${suffix}`;
  };

const DEFAULT_NODE_ID = 'nodeId';

export const PgSimpleInflector: Plugin = (
  builder: any,
  {
    pgSimpleCollections,
    pgOmitListSuffix,
    pgSimplifyPatch = true,
    pgSimplifyAllRows = true,
    pgShortPk = true,
    pgSimplifyMultikeyRelations = true,
    pgSimplifyOppositeBaseNames = true,
    nodeIdFieldName = DEFAULT_NODE_ID,
  }: PgSimpleInflectorOptions = {}
) => {
  const hasConnections = pgSimpleCollections !== 'only';
  const hasSimpleCollections = pgSimpleCollections === 'only' || pgSimpleCollections === 'both';

  if (
    hasSimpleCollections &&
    !hasConnections &&
    pgOmitListSuffix !== true &&
    pgOmitListSuffix !== false
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      'You can simplify the inflector further by adding `{graphileBuildOptions: {pgOmitListSuffix: true}}` to the options passed to PostGraphile, however be aware that doing so will mean that later enabling relay connections will be a breaking change. To dismiss this message, set `pgOmitListSuffix` to false instead.'
    );
  }

  const connectionSuffix = pgOmitListSuffix ? '-connection' : '';
  const ConnectionSuffix = pgOmitListSuffix ? 'Connection' : '';
  const listSuffix = pgOmitListSuffix ? '' : '-list';
  const ListSuffix = pgOmitListSuffix ? '' : 'List';

  builder.hook('inflection', (oldInflection: PgInflection): PgInflection => {
    const inflection: PgInflection = {
      ...oldInflection,

      /*
       * This solves the issue with `blah-table1s` becoming `blahTable1S`
       * (i.e. the capital S at the end) or `table1-connection becoming `Table1SConnection`
       */
      camelCase: fixCapitalisedPlural(oldInflection.camelCase),
      upperCamelCase: fixCapitalisedPlural(oldInflection.upperCamelCase),

      /*
       * Pluralize/singularize only supports single words, so only run
       * on the final segment of a name.
       */
      pluralize: fixChangePlural(oldInflection.pluralize),
      singularize: fixChangePlural(oldInflection.singularize),

      distinctPluralize(this: PgInflection, str: string) {
        const singular = this.singularize(str);
        const plural = this.pluralize(singular);
        if (singular !== plural) {
          return plural;
        }
        if (
          plural.endsWith('ch') ||
          plural.endsWith('s') ||
          plural.endsWith('sh') ||
          plural.endsWith('x') ||
          plural.endsWith('z')
        ) {
          return `${plural}es`;
        } else if (plural.endsWith('y')) {
          return `${plural.slice(0, -1)}ies`;
        } else {
          return `${plural}s`;
        }
      },

      // Fix a naming bug
      deletedNodeId(this: PgInflection, table: PgClass) {
        return this.camelCase(
          `deleted-${this.singularize(table.name)}-${nodeIdFieldName}`
        );
      },

      getBaseName(this: PgInflection, columnName: string) {
        const matches = columnName.match(
          /^(.+?)(_row_id|_id|_uuid|_fk|_pk|RowId|Id|Uuid|UUID|Fk|Pk)$/
        );
        if (matches) {
          return matches[1];
        }
        return null;
      },

      baseNameMatches(this: PgInflection, baseName: string | null, otherName: string) {
        const singularizedName = this.singularize(otherName);
        return baseName === singularizedName;
      },

      baseNameMatchesAny(this: PgInflection, baseName: string | null, otherName: string) {
        if (!baseName) return false;
        return this.singularize(baseName) === this.singularize(otherName);
      },

      /* This is a good method to override. */
      getOppositeBaseName(this: PgInflection, baseName: string | null) {
        return (
          pgSimplifyOppositeBaseNames &&
          ({
            /*
             * Changes to this list are breaking changes and will require a
             * major version update, so we need to group as many together as
             * possible! Rather than sending a PR, please look for an open
             * issue called something like "Add more opposites" (if there isn't
             * one then please open it) and add your suggestions to the GitHub
             * comments.
             */
            // NOTE: reason to be careful using this:
            // field names to take into account this particular case (e.g. events with event.parent_id could not have parent OR child fields)
            inviter: 'invitee',
            parent: 'child',
            child: 'parent',
            owner: 'owned',
            author: 'authored',
            editor: 'edited',
            reviewer: 'reviewed',
          }[baseName ?? ''] || null)
        );
      },

      getBaseNameFromKeys(this: PgInflection, detailedKeys: DetailedKey[]) {
        if (detailedKeys.length === 1) {
          const key = detailedKeys[0];
          const columnName = this._columnName(key);
          return this.getBaseName?.(columnName) ?? null;
        }
        if (pgSimplifyMultikeyRelations) {
          const columnNames = detailedKeys.map((key) => this._columnName(key));
          const baseNames = columnNames.map((columnName) => this.getBaseName?.(columnName) ?? null);
          // Check none are null
          if (baseNames.every((n) => n)) {
            return baseNames.join('-');
          }
        }
        return null;
      },

      ...(pgSimplifyPatch
        ? {
            patchField(this: PgInflection) {
              return 'patch';
            },
          }
        : {}),

      ...(pgSimplifyAllRows
        ? {
            allRows(this: PgInflection, table: PgClass) {
              return this.camelCase(
                this.distinctPluralize(
                  this._singularizedTableName(table)
                ) + connectionSuffix
              );
            },
            allRowsSimple(this: PgInflection, table: PgClass) {
              return this.camelCase(
                this.distinctPluralize(
                  this._singularizedTableName(table)
                ) + listSuffix
              );
            },
          }
        : {}),

      computedColumn(this: PgInflection, pseudoColumnName: string, proc: PgProc) {
        return proc.tags.fieldName
          ? `${proc.tags.fieldName}${proc.returnsSet ? ConnectionSuffix : ''}`
          : this.camelCase(pseudoColumnName + (proc.returnsSet ? connectionSuffix : ''));
      },

      computedColumnList(this: PgInflection, pseudoColumnName: string, proc: PgProc) {
        return proc.tags.fieldName
          ? `${proc.tags.fieldName}${ListSuffix}`
          : this.camelCase(pseudoColumnName + listSuffix);
      },

      singleRelationByKeys(
        this: PgInflection,
        detailedKeys: DetailedKey[],
        table: PgClass,
        _foreignTable: PgClass,
        constraint: PgConstraint
      ) {
        if (constraint.tags.fieldName) {
          return constraint.tags.fieldName as string;
        }

        const baseName = this.getBaseNameFromKeys(detailedKeys);
        if (constraint.classId === constraint.foreignClassId) {
          if (baseName && this.baseNameMatchesAny?.(baseName, table.name)) {
            return oldInflection.singleRelationByKeys(
              detailedKeys,
              table,
              _foreignTable,
              constraint
            );
          }
        }

        if (baseName) {
          return this.camelCase(baseName);
        }

        if (this.baseNameMatches?.(baseName, table.name)) {
          return this.camelCase(`${this._singularizedTableName(table)}`);
        }
        return oldInflection.singleRelationByKeys(
          detailedKeys,
          table,
          _foreignTable,
          constraint
        );
      },

      singleRelationByKeysBackwards(
        this: PgInflection,
        detailedKeys: DetailedKey[],
        table: PgClass,
        foreignTable: PgClass,
        constraint: PgConstraint
      ) {
        if (constraint.tags.foreignSingleFieldName) {
          return constraint.tags.foreignSingleFieldName as string;
        }
        if (constraint.tags.foreignFieldName) {
          return constraint.tags.foreignFieldName as string;
        }
        const baseName = this.getBaseNameFromKeys(detailedKeys);
        const oppositeBaseName = baseName && this.getOppositeBaseName?.(baseName);

        if (oppositeBaseName) {
          return this.camelCase(
            `${oppositeBaseName}-${this._singularizedTableName(table)}`
          );
        }

        if (baseName && this.baseNameMatches?.(baseName, foreignTable.name)) {
          return this.camelCase(`${this._singularizedTableName(table)}`);
        }
        return oldInflection.singleRelationByKeysBackwards(
          detailedKeys,
          table,
          foreignTable,
          constraint
        );
      },

      _manyRelationByKeysBase(
        this: PgInflection,
        detailedKeys: DetailedKey[],
        table: PgClass,
        foreignTable: PgClass,
        constraint: PgConstraint
      ) {
        const baseName = this.getBaseNameFromKeys(detailedKeys);
        const oppositeBaseName = baseName && this.getOppositeBaseName?.(baseName);

        if (constraint.classId === constraint.foreignClassId) {
          if (baseName && this.baseNameMatches?.(baseName, table.name)) {
            return null;
          }
        }

        if (oppositeBaseName) {
          return this.camelCase(
            `${oppositeBaseName}-${this.distinctPluralize(
              this._singularizedTableName(table)
            )}`
          );
        }
        if (baseName && this.baseNameMatches?.(baseName, foreignTable.name)) {
          return this.camelCase(
            `${this.distinctPluralize(this._singularizedTableName(table))}`
          );
        }
        return null;
      },

      manyRelationByKeys(
        this: PgInflection,
        detailedKeys: DetailedKey[],
        table: PgClass,
        foreignTable: PgClass,
        constraint: PgConstraint
      ) {
        if (constraint.tags.foreignFieldName) {
          if (constraint.tags.foreignSimpleFieldName) {
            return constraint.tags.foreignFieldName as string;
          } else {
            return `${constraint.tags.foreignFieldName}${ConnectionSuffix}`;
          }
        }
        const base = this._manyRelationByKeysBase?.(
          detailedKeys,
          table,
          foreignTable,
          constraint
        );
        if (base) {
          return base + ConnectionSuffix;
        }
        return (
          oldInflection.manyRelationByKeys(
            detailedKeys,
            table,
            foreignTable,
            constraint
          ) + ConnectionSuffix
        );
      },

      manyRelationByKeysSimple(
        this: PgInflection,
        detailedKeys: DetailedKey[],
        table: PgClass,
        foreignTable: PgClass,
        constraint: PgConstraint
      ) {
        if (constraint.tags.foreignSimpleFieldName) {
          return constraint.tags.foreignSimpleFieldName as string;
        }
        if (constraint.tags.foreignFieldName) {
          return `${constraint.tags.foreignFieldName}${ListSuffix}`;
        }
        const base = this._manyRelationByKeysBase?.(
          detailedKeys,
          table,
          foreignTable,
          constraint
        );
        if (base) {
          return base + ListSuffix;
        }
        return (
          oldInflection.manyRelationByKeys(
            detailedKeys,
            table,
            foreignTable,
            constraint
          ) + ListSuffix
        );
      },

      functionQueryName(this: PgInflection, proc: PgProc) {
        return this.camelCase(
          this._functionName(proc) + (proc.returnsSet ? connectionSuffix : '')
        );
      },
      functionQueryNameList(this: PgInflection, proc: PgProc) {
        return this.camelCase(this._functionName(proc) + listSuffix);
      },

      ...(pgShortPk
        ? {
            tableNode(this: PgInflection, table: PgClass) {
              return this.camelCase(
                `${this._singularizedTableName(table)}-by-${nodeIdFieldName}`
              );
            },
            rowByUniqueKeys(
              this: PgInflection,
              detailedKeys: DetailedKey[],
              table: PgClass,
              constraint: PgConstraint
            ) {
              if (constraint.tags.fieldName) {
                return constraint.tags.fieldName as string;
              }
              if (constraint.type === 'p') {
                // Primary key, shorten!
                return this.camelCase(this._singularizedTableName(table));
              } else {
                return this.camelCase(
                  `${this._singularizedTableName(
                    table
                  )}-by-${detailedKeys
                    .map((key) => this.column(key))
                    .join('-and-')}`
                );
              }
            },

            updateByKeys(
              this: PgInflection,
              detailedKeys: DetailedKey[],
              table: PgClass,
              constraint: PgConstraint
            ) {
              if (constraint.tags.updateFieldName) {
                return constraint.tags.updateFieldName as string;
              }
              if (constraint.type === 'p') {
                // Primary key, shorten!
                return this.camelCase(
                  `update-${this._singularizedTableName(table)}`
                );
              } else {
                return this.camelCase(
                  `update-${this._singularizedTableName(
                    table
                  )}-by-${detailedKeys
                    .map((key) => this.column(key))
                    .join('-and-')}`
                );
              }
            },
            deleteByKeys(
              this: PgInflection,
              detailedKeys: DetailedKey[],
              table: PgClass,
              constraint: PgConstraint
            ) {
              if (constraint.tags.deleteFieldName) {
                return constraint.tags.deleteFieldName as string;
              }
              if (constraint.type === 'p') {
                // Primary key, shorten!
                return this.camelCase(
                  `delete-${this._singularizedTableName(table)}`
                );
              } else {
                return this.camelCase(
                  `delete-${this._singularizedTableName(
                    table
                  )}-by-${detailedKeys
                    .map((key) => this.column(key))
                    .join('-and-')}`
                );
              }
            },
            updateByKeysInputType(
              this: PgInflection,
              detailedKeys: DetailedKey[],
              table: PgClass,
              constraint: PgConstraint
            ) {
              if (constraint.tags.updateFieldName) {
                return this.upperCamelCase(
                  `${constraint.tags.updateFieldName}-input`
                );
              }
              if (constraint.type === 'p') {
                // Primary key, shorten!
                return this.upperCamelCase(
                  `update-${this._singularizedTableName(table)}-input`
                );
              } else {
                return this.upperCamelCase(
                  `update-${this._singularizedTableName(
                    table
                  )}-by-${detailedKeys
                    .map((key) => this.column(key))
                    .join('-and-')}-input`
                );
              }
            },
            deleteByKeysInputType(
              this: PgInflection,
              detailedKeys: DetailedKey[],
              table: PgClass,
              constraint: PgConstraint
            ) {
              if (constraint.tags.deleteFieldName) {
                return this.upperCamelCase(
                  `${constraint.tags.deleteFieldName}-input`
                );
              }
              if (constraint.type === 'p') {
                // Primary key, shorten!
                return this.upperCamelCase(
                  `delete-${this._singularizedTableName(table)}-input`
                );
              } else {
                return this.upperCamelCase(
                  `delete-${this._singularizedTableName(
                    table
                  )}-by-${detailedKeys
                    .map((key) => this.column(key))
                    .join('-and-')}-input`
                );
              }
            },
            updateNode(this: PgInflection, table: PgClass) {
              return this.camelCase(
                `update-${this._singularizedTableName(
                  table
                )}-by-${nodeIdFieldName}`
              );
            },
            deleteNode(this: PgInflection, table: PgClass) {
              return this.camelCase(
                `delete-${this._singularizedTableName(
                  table
                )}-by-${nodeIdFieldName}`
              );
            },
            updateNodeInputType(this: PgInflection, table: PgClass) {
              return this.upperCamelCase(
                `update-${this._singularizedTableName(
                  table
                )}-by-${nodeIdFieldName}-input`
              );
            },
            deleteNodeInputType(this: PgInflection, table: PgClass) {
              return this.upperCamelCase(
                `delete-${this._singularizedTableName(
                  table
                )}-by-${nodeIdFieldName}-input`
              );
            },
          }
        : {}),
    };

    return inflection;
  });
};

export default PgSimpleInflector;
