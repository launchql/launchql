import {
  graphql,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  Kind,
  parse,
  print,
  type SelectionNode
} from 'graphql';

import {
  _buildFieldMeta,
  _pgTypeToGqlType,
  getTablesMetaForSchema,
  MetaSchemaPlugin
} from '../src';
import { collectTablesMeta } from '../src/table-meta-builder';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockAttribute(pgType: string, opts: Record<string, any> = {}) {
  return {
    codec: { name: pgType, arrayOfCodec: null, ...opts.codec },
    notNull: false,
    hasDefault: false,
    ...opts
  };
}

function createMockCodec(
  name: string,
  attributes: Record<string, any>,
  schemaName = 'app_public'
) {
  return {
    name,
    attributes,
    isAnonymous: false,
    extensions: { pg: { schemaName, name } }
  };
}

function createMockResource(opts: Record<string, any>) {
  const relations = opts.relations || {};
  return {
    ...opts,
    relations,
    uniques: opts.uniques || [],
    getRelations: () => relations,
    getRelation: (name: string) => relations[name]
  };
}

/**
 * Build a minimal mock of the PostGraphile `build` object that the init hook
 * expects. `resources` is a map of resource‐name → { codec, uniques?, relations? }.
 */
function createMockBuild(
  resources: Record<string, any>,
  schemas: string[] = ['app_public'],
  overrides: Record<string, any> = {}
) {
  const resourceList = Object.values(resources).filter((resource: any) => resource.codec);
  const baseBuild = {
    input: {
      pgRegistry: {
        pgResources: resources,
        pgCodecs: Object.fromEntries(
          resourceList.map((resource: any) => [resource.codec.name, resource.codec])
        ),
        pgRelations: Object.fromEntries(
          resourceList.map((resource: any) => [resource.codec.name, resource.relations || {}])
        )
      }
    },
    inflection: {
      tableType: (codec: any) =>
        codec.name
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
          .replace(/ /g, ''),
      _attributeName: ({ attributeName }: { attributeName: string; codec: any }) =>
        attributeName.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase()),
      allRows: (resource: any) => {
        const name = resource.codec?.name || 'unknown';
        return name + 's';
      },
      connectionType: (typeName: string) => typeName + 'Connection',
      edgeType: (typeName: string) => typeName + 'Edge',
      filterType: (typeName: string) => typeName + 'Filter',
      orderByType: (typeName: string) => typeName + 'OrderBy',
      conditionType: (typeName: string) => typeName + 'Condition',
      patchType: (typeName: string) => typeName + 'Patch',
      createInputType: (resource: any) => 'Create' + (resource.codec?.name || '') + 'Input',
      createPayloadType: (resource: any) => 'Create' + (resource.codec?.name || '') + 'Payload',
      updatePayloadType: ({ resource }: any) =>
        'Update' + (resource.codec?.name || '') + 'Payload',
      deletePayloadType: ({ resource }: any) =>
        'Delete' + (resource.codec?.name || '') + 'Payload',
      tableFieldName: (resource: any) => (resource.codec?.name || 'unknown').toLowerCase(),
      createField: (resource: any) => 'create' + (resource.codec?.name || ''),
      updateByKeys: (resource: any) => 'update' + (resource.codec?.name || ''),
      deleteByKeys: (resource: any) => 'delete' + (resource.codec?.name || '')
    },
    options: { pgSchemas: schemas }
  };

  return {
    ...baseBuild,
    ...overrides,
    inflection: {
      ...baseBuild.inflection,
      ...(overrides.inflection || {})
    },
    options: {
      ...baseBuild.options,
      ...(overrides.options || {})
    }
  };
}

/** Build metadata directly for focused registry-unit tests. */
function callInitHook(build: any): any[] {
  return collectTablesMeta(build) as any[];
}

function callGraphQLObjectTypeFieldsHook(
  fields: Record<string, any>,
  build: any,
  selfName: string
): Record<string, any> {
  const fieldsHook = MetaSchemaPlugin.schema!.hooks!.GraphQLObjectType_fields as (
    fields: Record<string, any>,
    build: any,
    context: { scope: { isRootQuery: boolean } },
  ) => Record<string, any>;
  return fieldsHook(fields, build, {
    scope: { isRootQuery: selfName === 'Query' }
  });
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortByName<T extends { name?: string }>(items: T[] | undefined): T[] {
  return [...(items || [])].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function sortByFieldName<T extends { fieldName?: string | null }>(items: T[] | undefined): T[] {
  return [...(items || [])].sort((a, b) => (a.fieldName || '').localeCompare(b.fieldName || ''));
}

function normalizeTablesForSnapshot(input: any[]): any[] {
  const tables = deepClone(input);

  for (const table of tables) {
    table.fields = sortByName(table.fields);
    table.indexes = sortByName(table.indexes).map((idx: any) => ({
      ...idx,
      columns: [...(idx.columns || [])].sort(),
      fields: sortByName(idx.fields)
    }));

    if (table.constraints?.primaryKey) {
      table.constraints.primaryKey.fields = sortByName(table.constraints.primaryKey.fields);
    }
    table.constraints = {
      ...table.constraints,
      unique: sortByName(table.constraints?.unique).map((c: any) => ({
        ...c,
        fields: sortByName(c.fields)
      })),
      foreignKey: sortByName(table.constraints?.foreignKey).map((c: any) => ({
        ...c,
        fields: sortByName(c.fields),
        referencedFields: [...(c.referencedFields || [])].sort(),
        refFields: sortByName(c.refFields)
      }))
    };

    table.foreignKeyConstraints = sortByName(table.foreignKeyConstraints).map((c: any) => ({
      ...c,
      fields: sortByName(c.fields),
      referencedFields: [...(c.referencedFields || [])].sort(),
      refFields: sortByName(c.refFields)
    }));
    table.primaryKeyConstraints = sortByName(table.primaryKeyConstraints).map((c: any) => ({
      ...c,
      fields: sortByName(c.fields)
    }));
    table.uniqueConstraints = sortByName(table.uniqueConstraints).map((c: any) => ({
      ...c,
      fields: sortByName(c.fields)
    }));

    table.relations = {
      ...table.relations,
      belongsTo: sortByFieldName(table.relations?.belongsTo).map((rel: any) => ({
        ...rel,
        keys: sortByName(rel.keys)
      })),
      has: sortByFieldName(table.relations?.has).map((rel: any) => ({
        ...rel,
        keys: sortByName(rel.keys)
      })),
      hasOne: sortByFieldName(table.relations?.hasOne).map((rel: any) => ({
        ...rel,
        keys: sortByName(rel.keys)
      })),
      hasMany: sortByFieldName(table.relations?.hasMany).map((rel: any) => ({
        ...rel,
        keys: sortByName(rel.keys)
      })),
      manyToMany: sortByFieldName(table.relations?.manyToMany).map((rel: any) => ({
        ...rel,
        junctionLeftConstraint: {
          ...rel.junctionLeftConstraint,
          fields: sortByName(rel.junctionLeftConstraint?.fields),
          referencedFields: [...(rel.junctionLeftConstraint?.referencedFields || [])].sort(),
          refFields: sortByName(rel.junctionLeftConstraint?.refFields)
        },
        junctionLeftKeyAttributes: sortByName(rel.junctionLeftKeyAttributes),
        junctionRightConstraint: {
          ...rel.junctionRightConstraint,
          fields: sortByName(rel.junctionRightConstraint?.fields),
          referencedFields: [...(rel.junctionRightConstraint?.referencedFields || [])].sort(),
          refFields: sortByName(rel.junctionRightConstraint?.refFields)
        },
        junctionRightKeyAttributes: sortByName(rel.junctionRightKeyAttributes),
        leftKeyAttributes: sortByName(rel.leftKeyAttributes),
        rightKeyAttributes: sortByName(rel.rightKeyAttributes)
      }))
    };
  }

  return tables.sort((a, b) => {
    const schemaCompare = (a.schemaName || '').localeCompare(b.schemaName || '');
    return schemaCompare !== 0 ? schemaCompare : (a.name || '').localeCompare(b.name || '');
  });
}

function collectMetaInvariantErrors(tables: any[]): string[] {
  const errors: string[] = [];
  const seenTables = new Set<string>();

  for (const table of tables) {
    const tableKey = `${table.schemaName}.${table.name}`;
    if (seenTables.has(tableKey)) {
      errors.push(`duplicate table: ${tableKey}`);
    }
    seenTables.add(tableKey);

    const fields = table.fields || [];
    const fieldNames = new Set(fields.map((f: any) => f.name));

    for (const field of fields) {
      if (field?.isNotNull !== field?.type?.isNotNull) {
        errors.push(`nullability mismatch: ${table.name}.${field.name}`);
      }
      if (field?.hasDefault !== field?.type?.hasDefault) {
        errors.push(`default mismatch: ${table.name}.${field.name}`);
      }
    }

    for (const index of table.indexes || []) {
      for (const column of index.columns || []) {
        if (!fieldNames.has(column)) {
          errors.push(`index column missing field: ${table.name}.${column}`);
        }
      }
      for (const field of index.fields || []) {
        if (!fieldNames.has(field.name)) {
          errors.push(`index field missing field: ${table.name}.${field.name}`);
        }
      }
    }

    for (const constraint of table.primaryKeyConstraints || []) {
      for (const field of constraint.fields || []) {
        if (!fieldNames.has(field.name)) {
          errors.push(`pk field missing field: ${table.name}.${field.name}`);
        }
      }
    }
    for (const constraint of table.uniqueConstraints || []) {
      for (const field of constraint.fields || []) {
        if (!fieldNames.has(field.name)) {
          errors.push(`unique field missing field: ${table.name}.${field.name}`);
        }
      }
    }

    for (const fk of table.foreignKeyConstraints || []) {
      for (const field of fk.fields || []) {
        if (!fieldNames.has(field.name)) {
          errors.push(`fk field missing field: ${table.name}.${field.name}`);
        }
      }
      if ((fk.referencedFields || []).length !== (fk.refFields || []).length) {
        errors.push(`fk ref size mismatch: ${table.name}.${fk.name}`);
      }
      if (!fk.refTable?.name) {
        errors.push(`fk missing ref table: ${table.name}.${fk.name}`);
      }
    }

    for (const relationGroup of ['belongsTo', 'has', 'hasOne', 'hasMany']) {
      for (const relation of table.relations?.[relationGroup] || []) {
        for (const key of relation.keys || []) {
          if (!fieldNames.has(key.name)) {
            errors.push(`${relationGroup} key missing field: ${table.name}.${key.name}`);
          }
        }
      }
    }

    for (const relation of table.relations?.manyToMany || []) {
      if (!relation.junctionTable?.name) {
        errors.push(`manyToMany missing junction table: ${table.name}.${relation.fieldName}`);
      }
      if (!relation.rightTable?.name) {
        errors.push(`manyToMany missing right table: ${table.name}.${relation.fieldName}`);
      }
      for (const key of relation.leftKeyAttributes || []) {
        if (!fieldNames.has(key.name)) {
          errors.push(`manyToMany left key missing field: ${table.name}.${key.name}`);
        }
      }
      if (
        (relation.junctionLeftConstraint?.referencedFields || []).length !==
        (relation.junctionLeftConstraint?.refFields || []).length
      ) {
        errors.push(`manyToMany left constraint mismatch: ${table.name}.${relation.fieldName}`);
      }
      if (
        (relation.junctionRightConstraint?.referencedFields || []).length !==
        (relation.junctionRightConstraint?.refFields || []).length
      ) {
        errors.push(`manyToMany right constraint mismatch: ${table.name}.${relation.fieldName}`);
      }
    }
  }

  return errors;
}

const META_QUERY_CONTRACT = `
query MetaContract {
  _meta {
    tables {
      name
      tableName
      schemaName
      query { all one create update delete }
      fields { name columnName type { pgType gqlType isArray subtype } enumValues { name values } }
      indexes { name isUnique isPrimary columns fields { name } }
      constraints {
        primaryKey { name }
        unique { name }
        foreignKey { name referencedTable referencedFields fields { name } refFields { name } }
      }
      foreignKeyConstraints { name referencedTable referencedFields fields { name } refFields { name } }
      primaryKeyConstraints { name }
      uniqueConstraints { name }
      relations {
        belongsTo { fieldName keys { name } }
        has { fieldName keys { name } }
        hasOne { fieldName keys { name } }
        hasMany { fieldName keys { name } }
        manyToMany {
          fieldName
          type
          junctionTable { name }
          junctionLeftConstraint {
            name
            referencedTable
            referencedFields
            fields { name }
            refFields { name }
          }
          junctionLeftKeyAttributes { name }
          junctionRightConstraint {
            name
            referencedTable
            referencedFields
            fields { name }
            refFields { name }
          }
          junctionRightKeyAttributes { name }
          leftKeyAttributes { name }
          rightKeyAttributes { name }
          rightTable { name }
        }
      }
      storage {
        isFilesTable
        isBucketsTable
        filesType
        bucketsType
        downloadUrlField
        upload {
          mutation
          inputType
          payloadType
          bulkMutation
          bulkInputType
          bulkPayloadType
          bulkFileInputType
          bulkFilePayloadType
          requiresOwnerId
        }
      }
      search {
        algorithms
        columns { name algorithm }
        hasUnifiedSearch
        config { weights boostRecent boostRecencyField boostRecencyDecay }
      }
      i18n {
        translationTable
        translatableFields { name type }
      }
      realtime {
        subscriptionFieldName
      }
      scope {
        scope
        tier
        keyColumn
        entityTable
        source
      }
    }
  }
}

`;

const REQUIRED_META_QUERY_PATHS = [
  'name',
  'tableName',
  'schemaName',
  'query.all',
  'query.one',
  'query.create',
  'query.update',
  'query.delete',
  'fields.name',
  'fields.columnName',
  'fields.type.pgType',
  'fields.type.gqlType',
  'fields.type.isArray',
  'fields.type.subtype',
  'indexes.name',
  'indexes.isUnique',
  'indexes.isPrimary',
  'indexes.columns',
  'indexes.fields.name',
  'constraints.primaryKey.name',
  'constraints.unique.name',
  'constraints.foreignKey.name',
  'constraints.foreignKey.referencedTable',
  'constraints.foreignKey.referencedFields',
  'constraints.foreignKey.fields.name',
  'constraints.foreignKey.refFields.name',
  'foreignKeyConstraints.name',
  'foreignKeyConstraints.referencedTable',
  'foreignKeyConstraints.referencedFields',
  'foreignKeyConstraints.fields.name',
  'foreignKeyConstraints.refFields.name',
  'primaryKeyConstraints.name',
  'uniqueConstraints.name',
  'relations.belongsTo.fieldName',
  'relations.belongsTo.keys.name',
  'relations.has.fieldName',
  'relations.has.keys.name',
  'relations.hasOne.fieldName',
  'relations.hasOne.keys.name',
  'relations.hasMany.fieldName',
  'relations.hasMany.keys.name',
  'relations.manyToMany.fieldName',
  'relations.manyToMany.type',
  'relations.manyToMany.junctionTable.name',
  'relations.manyToMany.junctionLeftConstraint.name',
  'relations.manyToMany.junctionLeftConstraint.referencedTable',
  'relations.manyToMany.junctionLeftConstraint.referencedFields',
  'relations.manyToMany.junctionLeftConstraint.fields.name',
  'relations.manyToMany.junctionLeftConstraint.refFields.name',
  'relations.manyToMany.junctionLeftKeyAttributes.name',
  'relations.manyToMany.junctionRightConstraint.name',
  'relations.manyToMany.junctionRightConstraint.referencedTable',
  'relations.manyToMany.junctionRightConstraint.referencedFields',
  'relations.manyToMany.junctionRightConstraint.fields.name',
  'relations.manyToMany.junctionRightConstraint.refFields.name',
  'relations.manyToMany.junctionRightKeyAttributes.name',
  'relations.manyToMany.leftKeyAttributes.name',
  'relations.manyToMany.rightKeyAttributes.name',
  'relations.manyToMany.rightTable.name',
  'storage.isFilesTable',
  'storage.isBucketsTable',
  'storage.filesType',
  'storage.bucketsType',
  'storage.downloadUrlField',
  'storage.upload.mutation',
  'storage.upload.inputType',
  'storage.upload.payloadType',
  'storage.upload.bulkMutation',
  'storage.upload.bulkInputType',
  'storage.upload.bulkPayloadType',
  'storage.upload.bulkFileInputType',
  'storage.upload.bulkFilePayloadType',
  'storage.upload.requiresOwnerId',
  'search.algorithms',
  'search.columns.name',
  'search.columns.algorithm',
  'search.hasUnifiedSearch',
  'search.config.weights',
  'search.config.boostRecent',
  'search.config.boostRecencyField',
  'search.config.boostRecencyDecay',
  'fields.enumValues.name',
  'fields.enumValues.values',
  'i18n.translationTable',
  'i18n.translatableFields.name',
  'i18n.translatableFields.type',
  'realtime.subscriptionFieldName',
  'scope.scope',
  'scope.tier',
  'scope.keyColumn',
  'scope.entityTable',
  'scope.source'
];

function collectSelectionPaths(selections: readonly SelectionNode[], prefix = ''): string[] {
  const paths: string[] = [];
  for (const selection of selections) {
    if (selection.kind !== Kind.FIELD) continue;
    const name = selection.name.value;
    const path = prefix ? `${prefix}.${name}` : name;
    paths.push(path);
    if (selection.selectionSet) {
      paths.push(...collectSelectionPaths(selection.selectionSet.selections, path));
    }
  }
  return paths;
}

function getMetaQueryTablePaths(query: string): string[] {
  const document = parse(query);
  for (const definition of document.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
    const metaField = definition.selectionSet.selections.find(
      (sel) => sel.kind === Kind.FIELD && sel.name.value === '_meta'
    );
    if (!metaField || metaField.kind !== Kind.FIELD) continue;
    const tablesField = metaField.selectionSet?.selections.find(
      (sel) => sel.kind === Kind.FIELD && sel.name.value === 'tables'
    );
    if (!tablesField || tablesField.kind !== Kind.FIELD || !tablesField.selectionSet) continue;
    return collectSelectionPaths(tablesField.selectionSet.selections);
  }
  return [];
}

function buildComplexScenarioTables(): any[] {
  const userCodec = createMockCodec('user', {
    id: createMockAttribute('uuid', { notNull: true, hasDefault: true }),
    email_address: createMockAttribute('email', { notNull: true }),
    display_name: createMockAttribute('text')
  });
  const postCodec = createMockCodec('post', {
    id: createMockAttribute('uuid', { notNull: true, hasDefault: true }),
    author_id: createMockAttribute('uuid', { notNull: true }),
    title: createMockAttribute('text', { notNull: true }),
    metadata: createMockAttribute('jsonb')
  });
  const commentCodec = createMockCodec('comment', {
    id: createMockAttribute('uuid', { notNull: true, hasDefault: true }),
    post_id: createMockAttribute('uuid', { notNull: true }),
    author_id: createMockAttribute('uuid', { notNull: true }),
    body: createMockAttribute('text', { notNull: true })
  });
  const tagCodec = createMockCodec('tag', {
    id: createMockAttribute('uuid', { notNull: true, hasDefault: true }),
    slug: createMockAttribute('text', { notNull: true })
  });
  const postTagCodec = createMockCodec('post_tag', {
    post_id: createMockAttribute('uuid', { notNull: true }),
    tag_id: createMockAttribute('uuid', { notNull: true })
  });

  const userUniques = [
    { attributes: ['id'], isPrimary: true, tags: { name: 'users_pkey' } },
    { attributes: ['email_address'], isPrimary: false, tags: { name: 'users_email_key' } }
  ];
  const postUniques = [
    { attributes: ['id'], isPrimary: true, tags: { name: 'posts_pkey' } }
  ];
  const commentUniques = [
    { attributes: ['id'], isPrimary: true, tags: { name: 'comments_pkey' } }
  ];
  const tagUniques = [
    { attributes: ['id'], isPrimary: true, tags: { name: 'tags_pkey' } },
    { attributes: ['slug'], isPrimary: false, tags: { name: 'tags_slug_key' } }
  ];
  const postTagUniques = [
    { attributes: ['post_id', 'tag_id'], isPrimary: true, tags: { name: 'post_tags_pkey' } }
  ];

  const postTagResource = createMockResource({
    codec: postTagCodec,
    uniques: postTagUniques,
    relations: {
      post_tag_post_fkey: {
        isReferencee: false,
        localAttributes: ['post_id'],
        remoteAttributes: ['id'],
        remoteResource: { codec: postCodec, uniques: postUniques }
      },
      post_tag_tag_fkey: {
        isReferencee: false,
        localAttributes: ['tag_id'],
        remoteAttributes: ['id'],
        remoteResource: { codec: tagCodec, uniques: tagUniques }
      }
    }
  });

  const postResource = createMockResource({
    codec: postCodec,
    uniques: postUniques,
    relations: {
      post_author_fkey: {
        isReferencee: false,
        localAttributes: ['author_id'],
        remoteAttributes: ['id'],
        remoteResource: { codec: userCodec, uniques: userUniques }
      },
      post_comments: {
        isReferencee: true,
        localAttributes: ['id'],
        remoteAttributes: ['post_id'],
        remoteResource: { codec: commentCodec, uniques: commentUniques }
      },
      post_post_tags: {
        isReferencee: true,
        localAttributes: ['id'],
        remoteAttributes: ['post_id'],
        remoteResource: { codec: postTagCodec, uniques: postTagUniques }
      }
    }
  });

  const tagResource = createMockResource({
    codec: tagCodec,
    uniques: tagUniques,
    relations: {
      tag_post_tags: {
        isReferencee: true,
        localAttributes: ['id'],
        remoteAttributes: ['tag_id'],
        remoteResource: { codec: postTagCodec, uniques: postTagUniques }
      }
    }
  });

  const pgManyToManyRealtionshipsByResource = new Map<any, any[]>([
    [
      postResource,
      [
        {
          leftTable: postResource,
          leftRelationName: 'post_post_tags',
          junctionTable: postTagResource,
          rightRelationName: 'post_tag_tag_fkey',
          rightTable: tagResource,
          allowsMultipleEdgesToNode: false
        }
      ]
    ],
    [
      tagResource,
      [
        {
          leftTable: tagResource,
          leftRelationName: 'tag_post_tags',
          junctionTable: postTagResource,
          rightRelationName: 'post_tag_post_fkey',
          rightTable: postResource,
          allowsMultipleEdgesToNode: false
        }
      ]
    ]
  ]);

  const build = createMockBuild(
    {
      user: {
        codec: userCodec,
        uniques: userUniques,
        relations: {
          user_posts: {
            isReferencee: true,
            localAttributes: ['id'],
            remoteAttributes: ['author_id'],
            remoteResource: { codec: postCodec, uniques: postUniques }
          },
          user_comments: {
            isReferencee: true,
            localAttributes: ['id'],
            remoteAttributes: ['author_id'],
            remoteResource: { codec: commentCodec, uniques: commentUniques }
          }
        }
      },
      user_duplicate_codec: { codec: userCodec, uniques: userUniques, relations: {} },
      user_unique_lookup: {
        codec: userCodec,
        uniques: userUniques,
        relations: {},
        isUnique: true
      },
      user_virtual: {
        codec: userCodec,
        uniques: userUniques,
        relations: {},
        isVirtual: true
      },
      helper_fn_resource: {
        codec: createMockCodec('helper_function', { value: createMockAttribute('text') }),
        uniques: [],
        relations: {},
        parameters: [{ name: 'input' }]
      },
      post: postResource,
      comment: {
        codec: commentCodec,
        uniques: commentUniques,
        relations: {
          comment_post_fkey: {
            isReferencee: false,
            localAttributes: ['post_id'],
            remoteAttributes: ['id'],
            remoteResource: { codec: postCodec, uniques: postUniques }
          },
          comment_author_fkey: {
            isReferencee: false,
            localAttributes: ['author_id'],
            remoteAttributes: ['id'],
            remoteResource: { codec: userCodec, uniques: userUniques }
          }
        }
      },
      tag: tagResource,
      post_tag: postTagResource
    },
    ['app_public'],
    {
      pgManyToManyRealtionshipsByResource,
      hasGraphQLTypeForPgCodec: (codec: any) => codec?.name === 'email',
      getGraphQLTypeNameByPgCodec: (codec: any) =>
        codec?.name === 'email' ? 'ConstructiveInternalTypeEmail' : codec?.name,
      inflection: {
        camelCase: (value: string) =>
          value.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase()),
        _manyToManyRelation: (details: any) => {
          const rightName = details?.rightTable?.codec?.name;
          if (rightName === 'tag') return 'tags';
          if (rightName === 'post') return 'posts';
          return details?.rightRelationName || null;
        }
      }
    }
  );

  return callInitHook(build);
}

// ---------------------------------------------------------------------------
// Unit tests — pgTypeToGqlType
// ---------------------------------------------------------------------------

describe('MetaSchemaPlugin', () => {
  describe('pgTypeToGqlType', () => {
    it.each([
      ['text', 'String'],
      ['varchar', 'String'],
      ['char', 'String'],
      ['name', 'String'],
      ['bpchar', 'String']
    ])('maps %s → %s', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it('maps uuid to UUID', () => {
      expect(_pgTypeToGqlType('uuid')).toBe('UUID');
    });

    it.each([
      ['int2', 'Int'],
      ['int4', 'Int'],
      ['integer', 'Int']
    ])('maps %s → %s (integer types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['int8', 'BigInt'],
      ['bigint', 'BigInt']
    ])('maps %s → %s (bigint types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['float4', 'Float'],
      ['float8', 'Float'],
      ['numeric', 'BigFloat']
    ])('maps %s → %s (float types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['bool', 'Boolean'],
      ['boolean', 'Boolean']
    ])('maps %s → %s (boolean types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['timestamptz', 'Datetime'],
      ['timestamp', 'Datetime']
    ])('maps %s → %s (timestamp types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['date', 'Date'],
      ['time', 'Time'],
      ['timetz', 'Time'],
      ['interval', 'Interval'],
      ['point', 'Point'],
      ['inet', 'InternetAddress'],
      ['cidr', 'InternetAddress'],
      ['xml', 'String'],
      ['bytea', 'String'],
      ['macaddr', 'String']
    ])('maps %s → %s (additional scalar types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['json', 'JSON'],
      ['jsonb', 'JSON']
    ])('maps %s → %s (json types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it.each([
      ['geometry', 'GeoJSON'],
      ['geography', 'GeoJSON']
    ])('maps %s → %s (geo types)', (pg, gql) => {
      expect(_pgTypeToGqlType(pg)).toBe(gql);
    });

    it('passes through unknown types unchanged', () => {
      expect(_pgTypeToGqlType('my_custom_enum')).toBe('my_custom_enum');
      expect(_pgTypeToGqlType('hstore')).toBe('hstore');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit tests — buildFieldMeta
  // ---------------------------------------------------------------------------

  describe('buildFieldMeta', () => {
    it('builds field meta with correct gqlType mapping', () => {
      const attr = createMockAttribute('timestamptz', { notNull: true, hasDefault: true });
      const result = _buildFieldMeta('createdAt', 'created_at', attr);

      expect(result).toEqual({
        name: 'createdAt',
        columnName: 'created_at',
        type: {
          pgType: 'timestamptz',
          gqlType: 'Datetime',
          isArray: false,
          isNotNull: true,
          hasDefault: true,
          subtype: null,
          encoding: { kind: 'datetime' }
        },
        isNotNull: true,
        hasDefault: true,
        isPrimaryKey: false,
        isForeignKey: false,
        description: null,
        enumValues: null,
        allowedValues: null,
        isRequiredOnCreate: null,
        isWritableOnCreate: null,
        isWritableOnUpdate: null
      });
    });

    it('handles null/undefined attributes gracefully', () => {
      const result = _buildFieldMeta('broken', 'broken', null);
      expect(result.name).toBe('broken');
      expect(result.type.pgType).toBe('unknown');
      expect(result.type.gqlType).toBe('unknown');
      expect(result.isNotNull).toBe(false);
    });

    it('detects array types via arrayOfCodec', () => {
      const attr = createMockAttribute('text', {
        codec: { name: 'text', arrayOfCodec: { name: '_text' } }
      });
      const result = _buildFieldMeta('tags', 'tags', attr);
      expect(result.type.isArray).toBe(true);
    });

    it('detects non-array types', () => {
      const attr = createMockAttribute('text');
      const result = _buildFieldMeta('name', 'name', attr);
      expect(result.type.isArray).toBe(false);
    });

    it('falls back to static type mapping if runtime codec lookup throws', () => {
      const attr = createMockAttribute('uuid');
      const build = {
        hasGraphQLTypeForPgCodec: () => {
          throw new Error('runtime lookup failed');
        },
        getGraphQLTypeNameByPgCodec: (): string | null => null
      };

      const result = _buildFieldMeta('id', 'id', attr, build);
      expect(result.type.gqlType).toBe('UUID');
    });

    it('maps array codecs by nested element type when root codec is unknown', () => {
      const attr = createMockAttribute('_int4', {
        codec: { name: '_int4', arrayOfCodec: { name: 'int4' } }
      });

      const result = _buildFieldMeta('ids', 'ids', attr, {});
      expect(result.type.gqlType).toBe('Int');
      expect(result.type.isArray).toBe(true);
    });

    it('reads geometrySubtype from attribute extensions', () => {
      const attr = createMockAttribute('geometry', {
        extensions: { geometrySubtype: 'Polygon' }
      });
      const result = _buildFieldMeta('zoneBoundary', 'zoneBoundary', attr);
      expect(result.type.subtype).toBe('Polygon');
      expect(result.type.gqlType).toBe('GeoJSON');
    });

    it('returns null subtype when no geometrySubtype extension', () => {
      const attr = createMockAttribute('geometry');
      const result = _buildFieldMeta('location', 'location', attr);
      expect(result.type.subtype).toBeNull();
      expect(result.type.gqlType).toBe('GeoJSON');
    });

    it('returns null subtype for non-geometry types', () => {
      const attr = createMockAttribute('text');
      const result = _buildFieldMeta('name', 'name', attr);
      expect(result.type.subtype).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Unit tests — scalar encoding contracts (type.encoding)
  // ---------------------------------------------------------------------------

  describe('buildFieldMeta — scalar encoding', () => {
    it.each([
      ['int8', 'bigint'],
      ['bigint', 'bigint'],
      ['numeric', 'bigint'],
      ['timestamptz', 'datetime'],
      ['timestamp', 'datetime'],
      ['date', 'date'],
      ['time', 'time'],
      ['timetz', 'time'],
      ['interval', 'interval'],
      ['uuid', 'uuid'],
      ['point', 'point'],
      ['inet', 'inet'],
      ['cidr', 'inet'],
      ['bytea', 'bytea']
    ])('maps %s → encoding.kind %s', (pg, kind) => {
      const result = _buildFieldMeta('col', 'col', createMockAttribute(pg));
      expect(result.type.encoding).toEqual({ kind });
    });

    it.each([['text'], ['varchar'], ['bool'], ['int4'], ['float8'], ['json'], ['jsonb']])(
      'returns null encoding for plain scalar %s',
      (pg) => {
        const result = _buildFieldMeta('col', 'col', createMockAttribute(pg));
        expect(result.type.encoding).toBeNull();
      }
    );

    it('returns null encoding when the attribute/codec is missing', () => {
      expect(_buildFieldMeta('broken', 'broken', null).type.encoding).toBeNull();
    });

    it('marks ltree with dotPath', () => {
      const result = _buildFieldMeta('path', 'path', createMockAttribute('ltree'));
      expect(result.type.encoding).toEqual({ kind: 'ltree', dotPath: true });
    });

    it('describes geometry with subtype and srid read verbatim from extensions', () => {
      const attr = createMockAttribute('geometry', {
        extensions: { geometrySubtype: 'Polygon', geometrySrid: 4326 }
      });
      const result = _buildFieldMeta('zoneBoundary', 'zoneBoundary', attr);
      expect(result.type.encoding).toEqual({
        kind: 'geojson',
        geometrySubtype: 'Polygon',
        srid: 4326
      });
    });

    it('describes geometry with null subtype/srid when extensions absent', () => {
      const result = _buildFieldMeta('location', 'location', createMockAttribute('geometry'));
      expect(result.type.encoding).toEqual({
        kind: 'geojson',
        geometrySubtype: null,
        srid: null
      });
    });

    it('describes vector with elementType and dimensions', () => {
      const attr = createMockAttribute('vector', {
        extensions: { vectorDimensions: 1536 }
      });
      const result = _buildFieldMeta('embedding', 'embedding', attr);
      expect(result.type.encoding).toEqual({
        kind: 'vector',
        elementType: 'float',
        dimensions: 1536
      });
    });

    it('describes vector with null dimensions when unspecified', () => {
      const result = _buildFieldMeta('embedding', 'embedding', createMockAttribute('vector'));
      expect(result.type.encoding).toEqual({
        kind: 'vector',
        elementType: 'float',
        dimensions: null
      });
    });

    it('resolves kind from the underlying element codec for arrays', () => {
      const attr = createMockAttribute('_uuid', {
        codec: { name: '_uuid', arrayOfCodec: { name: 'uuid' } }
      });
      const result = _buildFieldMeta('ids', 'ids', attr);
      expect(result.type.isArray).toBe(true);
      expect(result.type.encoding).toEqual({ kind: 'uuid' });
    });

    it('unwraps a domain codec to its underlying type', () => {
      const attr = createMockAttribute('citext_domain', {
        codec: { name: 'citext_domain', arrayOfCodec: null, domainOfCodec: { name: 'int8' } }
      });
      const result = _buildFieldMeta('big', 'big', attr);
      expect(result.type.encoding).toEqual({ kind: 'bigint' });
    });

    it('marks composite (record) codecs as composite', () => {
      const attr = createMockAttribute('address', {
        codec: {
          name: 'address',
          arrayOfCodec: null,
          attributes: { street: { codec: { name: 'text' } } }
        }
      });
      const result = _buildFieldMeta('addr', 'addr', attr);
      expect(result.type.encoding).toEqual({ kind: 'composite', fields: null });
    });
  });

  // ---------------------------------------------------------------------------
  // Integration tests — init hook: field name inflection
  // ---------------------------------------------------------------------------

  describe('init hook — field name inflection', () => {
    it('inflects snake_case field names to camelCase', () => {
      const codec = createMockCodec('user', {
        display_name: createMockAttribute('text'),
        created_at: createMockAttribute('timestamptz'),
        is_active: createMockAttribute('bool')
      });
      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      const fieldNames = tables[0].fields.map((f: any) => f.name);

      expect(fieldNames).toEqual(['displayName', 'createdAt', 'isActive']);
      expect(fieldNames).not.toContain('display_name');
      expect(fieldNames).not.toContain('created_at');
      expect(fieldNames).not.toContain('is_active');
    });

    it('falls back to raw PG name if inflection fails', () => {
      const codec = createMockCodec('user', {
        display_name: createMockAttribute('text')
      });
      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} }
      });
      // Sabotage inflection so it throws
      build.inflection._attributeName = () => {
        throw new Error('inflection failure');
      };

      const tables = callInitHook(build);
      // Should fall back to raw attribute name
      expect(tables[0].fields[0].name).toBe('display_name');
    });

    it('inflects FK constraint field names', () => {
      const userCodec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid'),
        author_id: createMockAttribute('uuid')
      });

      const build = createMockBuild({
        user: { codec: userCodec, uniques: [], relations: {} },
        post: {
          codec: postCodec,
          uniques: [],
          relations: {
            post_author_fkey: {
              isReferencee: false,
              localAttributes: ['author_id'],
              remoteAttributes: ['id'],
              remoteResource: { codec: userCodec, uniques: [] }
            }
          }
        }
      });

      const tables = callInitHook(build);
      const postTable = tables.find((t: any) => t.name === 'Post');
      const fk = postTable!.foreignKeyConstraints[0];

      // FK field names should be inflected
      expect(fk.fields[0].name).toBe('authorId');
      expect(fk.fields[0].columnName).toBe('author_id');
      expect(fk.referencedFields[0]).toBe('id');
      expect(fk.refFields[0].columnName).toBe('id');
    });

    it('inflects relation key field names', () => {
      const userCodec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid'),
        author_id: createMockAttribute('uuid')
      });

      const build = createMockBuild({
        user: { codec: userCodec, uniques: [], relations: {} },
        post: {
          codec: postCodec,
          uniques: [],
          relations: {
            post_author_fkey: {
              isReferencee: false,
              localAttributes: ['author_id'],
              remoteAttributes: ['id'],
              remoteResource: { codec: userCodec, uniques: [] }
            }
          }
        }
      });

      const tables = callInitHook(build);
      const postTable = tables.find((t: any) => t.name === 'Post');
      const belongsTo = postTable!.relations.belongsTo[0];

      // Relation key field names should be inflected
      expect(belongsTo.keys[0].name).toBe('authorId');
    });

    it('inflects index and PK constraint field names', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid'),
        email_address: createMockAttribute('text')
      });

      const build = createMockBuild({
        user: {
          codec,
          uniques: [
            { attributes: ['id'], isPrimary: true, tags: { name: 'user_pkey' } },
            { attributes: ['email_address'], isPrimary: false, tags: { name: 'user_email_key' } }
          ],
          relations: {}
        }
      });

      const tables = callInitHook(build);
      const user = tables[0];

      // PK constraint fields should be inflected
      expect(user.constraints.primaryKey!.fields[0].name).toBe('id');

      // Unique constraint fields should be inflected
      expect(user.constraints.unique[0].fields[0].name).toBe('emailAddress');

      // Index columns should be inflected
      expect(user.indexes[0].columns).toEqual(['id']);
      expect(user.indexes[1].columns).toEqual(['emailAddress']);
    });
  });

  // ---------------------------------------------------------------------------
  // Integration tests — init hook: table deduplication
  // ---------------------------------------------------------------------------

  describe('init hook — table deduplication', () => {
    it('deduplicates resources sharing the same codec', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });
      codec.extensions.pg.name = 'app_user';

      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} },
        user_2: { codec, uniques: [], relations: {} } // same codec object
      });

      const tables = callInitHook(build);
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('User');
      expect(tables[0].tableName).toBe('app_user');
    });

    it('includes distinct tables with different codecs', () => {
      const userCodec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid')
      });

      const build = createMockBuild({
        user: { codec: userCodec, uniques: [], relations: {} },
        post: { codec: postCodec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      expect(tables).toHaveLength(2);
      const names = tables.map((t: any) => t.name).sort();
      expect(names).toEqual(['Post', 'User']);
    });

    it('includes a final GraphQL interface with an unregistered attribute codec', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('text')
      });
      const build = createMockBuild(
        { user: { codec, uniques: [], relations: {} } },
        ['app_public'],
        {
          hasGraphQLTypeForPgCodec: () => false,
          getGraphQLTypeNameByPgCodec: () => {
            throw new Error('unregistered codec lookup');
          }
        }
      );
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: { ping: { type: GraphQLString } }
        }),
        types: [
          new GraphQLInterfaceType({
            name: 'User',
            fields: { id: { type: GraphQLString } }
          })
        ]
      });

      const tables = collectTablesMeta(build, schema);

      expect(tables).toHaveLength(1);
      expect(tables[0]).toMatchObject({
        name: 'User',
        fields: [{ name: 'id', columnName: 'id' }]
      });
    });

    it('skips anonymous codecs', () => {
      const anonCodec = {
        name: 'anon',
        attributes: { id: createMockAttribute('uuid') },
        isAnonymous: true,
        extensions: { pg: { schemaName: 'app_public' } }
      };

      const build = createMockBuild({
        anon: { codec: anonCodec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      expect(tables).toHaveLength(0);
    });

    it('skips resources without schema name', () => {
      const codec = {
        name: 'no_schema',
        attributes: { id: createMockAttribute('uuid') },
        isAnonymous: false,
        extensions: { pg: {} } // no schemaName
      };

      const build = createMockBuild({
        no_schema: { codec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      expect(tables).toHaveLength(0);
    });

    it('skips non-table resources (unique lookups, virtual resources, functions)', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });

      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} },
        user_lookup: { codec, uniques: [], relations: {}, isUnique: true },
        user_virtual: { codec, uniques: [], relations: {}, isVirtual: true },
        user_function: { codec, uniques: [], relations: {}, parameters: [{ name: 'id' }] }
      });

      const tables = callInitHook(build);
      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('User');
    });

    it('skips resources missing a codec or codec attributes', () => {
      const codecWithoutAttributes = {
        name: 'broken',
        isAnonymous: false,
        extensions: { pg: { schemaName: 'app_public' } }
      };

      const build = createMockBuild({
        no_codec: {},
        no_attributes: { codec: codecWithoutAttributes, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      expect(tables).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  // Integration tests — init hook: gqlType mapping
  // ---------------------------------------------------------------------------

  describe('init hook — gqlType mapping', () => {
    it('field.type.gqlType uses GraphQL type names, not PG type names', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid'),
        name: createMockAttribute('text'),
        age: createMockAttribute('int4'),
        balance: createMockAttribute('numeric'),
        is_active: createMockAttribute('bool'),
        created_at: createMockAttribute('timestamptz'),
        metadata: createMockAttribute('jsonb')
      });

      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      const fields = tables[0].fields;

      const fieldMap = Object.fromEntries(fields.map((f: any) => [f.name, f.type.gqlType]));

      expect(fieldMap.id).toBe('UUID');
      expect(fieldMap.name).toBe('String');
      expect(fieldMap.age).toBe('Int');
      expect(fieldMap.balance).toBe('BigFloat');
      expect(fieldMap.isActive).toBe('Boolean');
      expect(fieldMap.createdAt).toBe('Datetime');
      expect(fieldMap.metadata).toBe('JSON');
    });

    it('preserves pgType alongside gqlType', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      });

      const build = createMockBuild({
        user: { codec, uniques: [], relations: {} }
      });

      const tables = callInitHook(build);
      const idField = tables[0].fields[0];

      expect(idField.type.pgType).toBe('uuid');
      expect(idField.type.gqlType).toBe('UUID');
    });

    it('uses runtime build codec mappings for custom scalar types', () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid'),
        email_address: createMockAttribute('email')
      });

      const build = createMockBuild(
        {
          user: { codec, uniques: [], relations: {} }
        },
        ['app_public'],
        {
          hasGraphQLTypeForPgCodec: (attrCodec: any) => attrCodec?.name === 'email',
          getGraphQLTypeNameByPgCodec: (attrCodec: any) =>
            attrCodec?.name === 'email' ? 'ConstructiveInternalTypeEmail' : null
        }
      );

      const tables = callInitHook(build);
      const emailField = tables[0].fields.find((field: any) => field.name === 'emailAddress');
      expect(emailField.type.gqlType).toBe('ConstructiveInternalTypeEmail');
    });
  });

  // ---------------------------------------------------------------------------
  // Integration tests — schema filtering
  // ---------------------------------------------------------------------------

  describe('init hook — schema filtering', () => {
    it('only includes tables from configured schemas', () => {
      const publicCodec = createMockCodec('user', {
        id: createMockAttribute('uuid')
      }, 'app_public');
      const privateCodec = createMockCodec('secret', {
        id: createMockAttribute('uuid')
      }, 'app_private');

      const build = createMockBuild({
        user: { codec: publicCodec, uniques: [], relations: {} },
        secret: { codec: privateCodec, uniques: [], relations: {} }
      }, ['app_public']);

      const tables = callInitHook(build);
      expect(tables).toHaveLength(1);
      expect(tables[0].schemaName).toBe('app_public');
    });

    it('includes all schemas when pgSchemas is empty', () => {
      const publicCodec = createMockCodec(
        'user',
        {
          id: createMockAttribute('uuid')
        },
        'app_public'
      );
      const privateCodec = createMockCodec(
        'audit_log',
        {
          id: createMockAttribute('uuid')
        },
        'app_private'
      );

      const build = createMockBuild(
        {
          user: { codec: publicCodec, uniques: [], relations: {} },
          audit_log: { codec: privateCodec, uniques: [], relations: {} }
        },
        []
      );

      const tables = callInitHook(build);
      expect(tables).toHaveLength(2);
      expect(new Set(tables.map((t: any) => t.schemaName))).toEqual(new Set(['app_public', 'app_private']));
    });
  });

  describe('init hook — inflection and query fallbacks', () => {
    it('falls back when tableType inflection throws', () => {
      const codec = createMockCodec('audit_log', {
        id: createMockAttribute('uuid')
      });

      const build = createMockBuild(
        {
          audit_log: {
            codec,
            uniques: [{ attributes: ['id'], isPrimary: true }],
            relations: {}
          }
        },
        ['app_public'],
        {
          inflection: {
            tableType: () => {
              throw new Error('tableType failed');
            },
            createField: () => {
              throw new Error('createField failed');
            },
            updateByKeys: () => {
              throw new Error('updateByKeys failed');
            },
            deleteByKeys: () => {
              throw new Error('deleteByKeys failed');
            }
          }
        }
      );

      const table = callInitHook(build)[0];
      expect(table.name).toBe('AuditLog');
      expect(table.inflection.tableType).toBe('AuditLog');
      expect(table.query.create).toBe('createAuditLog');
      expect(table.query.update).toBe('updateAuditLog');
      expect(table.query.delete).toBe('deleteAuditLog');
    });

    it('uses deterministic fallback names when inflectors throw or return nullish', () => {
      const codec = createMockCodec('audit_log', {
        id: createMockAttribute('uuid')
      });

      const build = createMockBuild(
        {
          audit_log: {
            codec,
            uniques: [{ attributes: ['id'], isPrimary: true }],
            relations: {}
          }
        },
        ['app_public'],
        {
          inflection: {
            tableType: () => 'AuditLog',
            allRows: () => {
              throw new Error('allRows failed');
            },
            connectionType: (): string | null => null,
            edgeType: (): string | undefined => undefined,
            filterType: (): string | null => null,
            orderByType: () => {
              throw new Error('orderByType failed');
            },
            conditionType: (): string | undefined => undefined,
            patchType: (): string | null => null,
            createInputType: () => {
              throw new Error('createInputType failed');
            },
            createPayloadType: (): string | undefined => undefined,
            updatePayloadType: (): string | null => null,
            deletePayloadType: () => {
              throw new Error('deletePayloadType failed');
            },
            tableFieldName: () => {
              throw new Error('tableFieldName failed');
            },
            createField: (): string | undefined => undefined,
            updateByKeys: (): string | null => null,
            deleteByKeys: () => {
              throw new Error('deleteByKeys failed');
            }
          }
        }
      );

      const table = callInitHook(build)[0];

      expect(table.inflection).toMatchObject({
        tableType: 'AuditLog',
        allRows: 'auditlogs',
        connection: 'AuditLogConnection',
        edge: 'AuditLogEdge',
        filterType: 'AuditLogFilter',
        orderByType: 'AuditLogOrderBy',
        conditionType: 'AuditLogCondition',
        patchType: 'AuditLogPatch',
        createInputType: 'CreateAuditLogInput',
        createPayloadType: 'CreateAuditLogPayload',
        updatePayloadType: 'UpdateAuditLogPayload',
        deletePayloadType: 'DeleteAuditLogPayload'
      });

      expect(table.query).toEqual({
        all: 'auditlogs',
        one: 'auditlog',
        create: 'createAuditLog',
        update: 'updateAuditLog',
        delete: 'deleteAuditLog'
      });
    });

    it('omits one/update/delete when a table has no primary key', () => {
      const codec = createMockCodec('event_log', {
        occurred_at: createMockAttribute('timestamptz')
      });
      const build = createMockBuild({
        event_log: { codec, uniques: [], relations: {} }
      });

      const table = callInitHook(build)[0];
      expect(table.query.all).toBe('event_logs');
      expect(table.query.one).toBeNull();
      expect(table.query.update).toBeNull();
      expect(table.query.delete).toBeNull();
    });
  });

  describe('init hook — relation and naming behavior', () => {
    it('classifies reverse relations using registry cardinality', () => {
      const userCodec = createMockCodec('user', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const profileCodec = createMockCodec('profile', {
        id: createMockAttribute('uuid', { notNull: true }),
        user_id: createMockAttribute('uuid', { notNull: true })
      });
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid', { notNull: true }),
        author_id: createMockAttribute('uuid', { notNull: true })
      });

      const build = createMockBuild({
        user: {
          codec: userCodec,
          uniques: [{ attributes: ['id'], isPrimary: true, tags: { name: 'users_pkey' } }],
          relations: {
            user_profile: {
              isReferencee: true,
              isUnique: true,
              localAttributes: ['id'],
              remoteAttributes: ['user_id'],
              remoteResource: { codec: profileCodec }
            },
            user_posts: {
              isReferencee: true,
              isUnique: false,
              localAttributes: ['id'],
              remoteAttributes: ['author_id'],
              remoteResource: { codec: postCodec }
            }
          }
        }
      });

      const user = callInitHook(build)[0];
      expect(user.relations.hasOne).toHaveLength(1);
      expect(user.relations.hasOne[0]).toMatchObject({ fieldName: 'user_profile', isUnique: true });
      expect(user.relations.hasMany).toHaveLength(1);
      expect(user.relations.hasMany[0]).toMatchObject({ fieldName: 'user_posts', isUnique: false });
      expect(user.relations.has).toHaveLength(2);
    });

    it.each([
      ['a singular field', 'profile', (type: GraphQLObjectType) => type],
      [
        'a list field',
        'profilesList',
        (type: GraphQLObjectType) => new GraphQLList(type)
      ]
    ])(
      'uses registry cardinality when a unique reverse relation is exposed as %s',
      (_label, fieldName, fieldType) => {
        const userCodec = createMockCodec('user', {
          id: createMockAttribute('text')
        });
        const profileCodec = createMockCodec('profile', {
          user_id: createMockAttribute('text')
        });
        const profileResource = createMockResource({
          codec: profileCodec,
          uniques: [],
          relations: {}
        });
        const build = createMockBuild(
          {
            user: {
              codec: userCodec,
              uniques: [],
              relations: {
                profile: {
                  isReferencee: true,
                  isUnique: true,
                  localAttributes: ['id'],
                  remoteAttributes: ['user_id'],
                  remoteResource: profileResource
                }
              }
            },
            profile: profileResource
          },
          ['app_public'],
          {
            inflection: {
              singleRelationBackwards: () => 'profile',
              manyRelationConnection: () => 'profilesConnection',
              manyRelationList: () => 'profilesList',
              tableConnectionType: () => 'ProfileConnection'
            }
          },
        );
        const profileType = new GraphQLObjectType({
          name: 'Profile',
          fields: { userId: { type: GraphQLString } }
        });
        const userType = new GraphQLObjectType({
          name: 'User',
          fields: {
            id: { type: GraphQLString },
            [fieldName]: { type: fieldType(profileType) }
          }
        });
        const schema = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields: { ping: { type: GraphQLString } }
          }),
          types: [userType, profileType]
        });

        const user = collectTablesMeta(build, schema).find(
          (table) => table.name === 'User'
        );

        expect(user?.relations.hasOne).toEqual([
          expect.objectContaining({
            fieldName,
            isUnique: true,
            type: 'Profile'
          })
        ]);
        expect(user?.relations.hasMany).toEqual([]);
      }
    );

    it('marks belongsTo relation unique when local fk columns are uniquely constrained', () => {
      const userCodec = createMockCodec('user', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const profileCodec = createMockCodec('profile', {
        id: createMockAttribute('uuid', { notNull: true }),
        user_id: createMockAttribute('uuid', { notNull: true })
      });

      const build = createMockBuild({
        user: { codec: userCodec, uniques: [{ attributes: ['id'], isPrimary: true }], relations: {} },
        profile: {
          codec: profileCodec,
          uniques: [
            { attributes: ['id'], isPrimary: true },
            { attributes: ['user_id'], isPrimary: false }
          ],
          relations: {
            profile_user_fkey: {
              isReferencee: false,
              localAttributes: ['user_id'],
              remoteAttributes: ['id'],
              remoteResource: { codec: userCodec, uniques: [{ attributes: ['id'], isPrimary: true }] }
            }
          }
        }
      });

      const profile = callInitHook(build).find((table: any) => table.name === 'Profile');
      expect(profile.relations.belongsTo).toHaveLength(1);
      expect(profile.relations.belongsTo[0]).toMatchObject({
        fieldName: 'profile_user_fkey',
        isUnique: true
      });
    });

    it('falls back to deterministic index and constraint names when tags are missing', () => {
      const codec = createMockCodec('invoice_line', {
        id: createMockAttribute('uuid', { notNull: true }),
        account_id: createMockAttribute('uuid', { notNull: true }),
        order_id: createMockAttribute('uuid', { notNull: true })
      });

      const build = createMockBuild({
        invoice_line: {
          codec,
          uniques: [
            { attributes: ['id'], isPrimary: true },
            { attributes: ['account_id', 'order_id'], isPrimary: false }
          ],
          relations: {}
        }
      });

      const table = callInitHook(build)[0];
      expect(table.constraints.primaryKey?.name).toBe('invoice_line_pkey');
      expect(table.constraints.unique.map((u: any) => u.name)).toEqual([
        'invoice_line_account_id_order_id_key'
      ]);
      expect(table.indexes.map((idx: any) => idx.name)).toEqual([
        'invoice_line_id_idx',
        'invoice_line_account_id_order_id_idx'
      ]);
    });

    it('builds many-to-many metadata from pg-many-to-many relationship details', () => {
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const tagCodec = createMockCodec('tag', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const postTagCodec = createMockCodec('post_tag', {
        post_id: createMockAttribute('uuid', { notNull: true }),
        tag_id: createMockAttribute('uuid', { notNull: true })
      });

      const postUniques = [{ attributes: ['id'], isPrimary: true }];
      const tagUniques = [{ attributes: ['id'], isPrimary: true }];
      const postTagUniques = [{ attributes: ['post_id', 'tag_id'], isPrimary: true }];

      const postTagResource = createMockResource({
        codec: postTagCodec,
        uniques: postTagUniques,
        relations: {
          post_tag_post_fkey: {
            isReferencee: false,
            localAttributes: ['post_id'],
            remoteAttributes: ['id'],
            remoteResource: { codec: postCodec, uniques: postUniques }
          },
          post_tag_tag_fkey: {
            isReferencee: false,
            localAttributes: ['tag_id'],
            remoteAttributes: ['id'],
            remoteResource: { codec: tagCodec, uniques: tagUniques }
          }
        }
      });
      const postResource = createMockResource({
        codec: postCodec,
        uniques: postUniques,
        relations: {
          post_post_tags: {
            isReferencee: true,
            localAttributes: ['id'],
            remoteAttributes: ['post_id'],
            remoteResource: { codec: postTagCodec, uniques: postTagUniques }
          }
        }
      });
      const tagResource = createMockResource({
        codec: tagCodec,
        uniques: tagUniques,
        relations: {}
      });

      const pgManyToManyRealtionshipsByResource = new Map<any, any[]>([
        [
          postResource,
          [
            {
              leftTable: postResource,
              leftRelationName: 'post_post_tags',
              junctionTable: postTagResource,
              rightRelationName: 'post_tag_tag_fkey',
              rightTable: tagResource,
              allowsMultipleEdgesToNode: false
            }
          ]
        ]
      ]);

      const build = createMockBuild(
        {
          post: postResource,
          tag: tagResource,
          post_tag: postTagResource
        },
        ['app_public'],
        {
          pgManyToManyRealtionshipsByResource,
          inflection: {
            _manyToManyRelation: () => 'tags'
          }
        }
      );

      const post = callInitHook(build).find((table: any) => table.name === 'Post');
      expect(post.relations.manyToMany).toHaveLength(1);
      expect(post.relations.manyToMany[0]).toMatchObject({
        fieldName: 'tags',
        type: 'tag',
        junctionTable: { name: 'post_tag' },
        junctionLeftConstraint: {
          name: 'post_post_tags',
          referencedTable: 'post',
          referencedFields: ['id']
        },
        junctionRightConstraint: {
          name: 'post_tag_tag_fkey',
          referencedTable: 'tag',
          referencedFields: ['id']
        },
        rightTable: { name: 'tag' }
      });
      expect(post.relations.manyToMany[0].junctionLeftKeyAttributes.map((f: any) => f.name)).toEqual([
        'postId'
      ]);
      expect(post.relations.manyToMany[0].junctionRightKeyAttributes.map((f: any) => f.name)).toEqual([
        'tagId'
      ]);
      expect(post.relations.manyToMany[0].leftKeyAttributes.map((f: any) => f.name)).toEqual(['id']);
      expect(post.relations.manyToMany[0].rightKeyAttributes.map((f: any) => f.name)).toEqual(['id']);
    });

    it('skips malformed many-to-many relation details', () => {
      const postCodec = createMockCodec('post', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const tagCodec = createMockCodec('tag', {
        id: createMockAttribute('uuid', { notNull: true })
      });
      const postTagCodec = createMockCodec('post_tag', {
        post_id: createMockAttribute('uuid', { notNull: true }),
        tag_id: createMockAttribute('uuid', { notNull: true })
      });

      const postResource = createMockResource({
        codec: postCodec,
        uniques: [{ attributes: ['id'], isPrimary: true }],
        relations: {
          post_post_tags: {
            isReferencee: true,
            localAttributes: ['id'],
            remoteAttributes: ['post_id'],
            remoteResource: { codec: postTagCodec, uniques: [{ attributes: ['post_id', 'tag_id'], isPrimary: true }] }
          }
        }
      });
      const tagResource = createMockResource({
        codec: tagCodec,
        uniques: [{ attributes: ['id'], isPrimary: true }],
        relations: {}
      });
      const postTagResource = createMockResource({
        codec: postTagCodec,
        uniques: [{ attributes: ['post_id', 'tag_id'], isPrimary: true }],
        relations: {}
      });

      const build = createMockBuild(
        {
          post: postResource,
          tag: tagResource,
          post_tag: postTagResource
        },
        ['app_public'],
        {
          pgManyToManyRealtionshipsByResource: new Map<any, any[]>([
            [
              postResource,
              [
                {
                  leftTable: postResource,
                  leftRelationName: 'missing_left_relation',
                  junctionTable: postTagResource,
                  rightRelationName: 'missing_right_relation',
                  rightTable: tagResource,
                  allowsMultipleEdgesToNode: false
                }
              ]
            ]
          ])
        }
      );

      let tables: any[] = [];
      expect(() => {
        tables = callInitHook(build);
      }).not.toThrow();
      const post = tables.find((table: any) => table.name === 'Post');
      expect(post.relations.manyToMany).toEqual([]);
    });
  });

  describe('hook wiring — GraphQLObjectType_fields', () => {
    it('does not modify non-Query GraphQL types', () => {
      const originalFields = { id: { type: GraphQLString } };
      const result = callGraphQLObjectTypeFieldsHook(originalFields, {}, 'Mutation');
      expect(result).toBe(originalFields);
      expect(result).not.toHaveProperty('_meta');
    });

    it('adds _meta to Query and resolves cached tables through an executable schema', async () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('uuid', { notNull: true }),
        email_address: createMockAttribute('text')
      });
      const build = createMockBuild({
        user: {
          codec,
          uniques: [{ attributes: ['id'], isPrimary: true, tags: { name: 'users_pkey' } }],
          relations: {}
        }
      });

      const queryFields = callGraphQLObjectTypeFieldsHook(
        {
          ping: {
            type: GraphQLString,
            resolve: () => 'pong'
          }
        },
        build,
        'Query'
      );

      const GraphQLUUID = new GraphQLScalarType({
        name: 'UUID',
        serialize: (value) => value
      });
      const userType = new GraphQLObjectType({
        name: 'User',
        fields: {
          id: { type: GraphQLUUID },
          emailAddress: { type: GraphQLString }
        }
      });

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: () => queryFields
        }),
        types: [userType]
      });
      const result = await graphql({
        schema,
        source: `
          query {
            ping
            _meta {
              tables {
                name
                tableName
                schemaName
                fields { name columnName type { pgType gqlType isArray } }
                query { all one create update delete }
              }
            }
          }
        `
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.ping).toBe('pong');
      const seededTables = getTablesMetaForSchema(schema) as any[];
      expect((result.data as any)?._meta?.tables).toHaveLength(seededTables.length);
      expect((result.data as any)?._meta?.tables?.[0]).toMatchObject({
        name: 'User',
        tableName: 'user',
        schemaName: 'app_public',
        query: seededTables[0].query
      });
      expect((result.data as any)?._meta?.tables?.[0]?.fields).toEqual([
        {
          name: 'id',
          columnName: 'id',
          type: { pgType: 'uuid', gqlType: 'UUID', isArray: false }
        },
        {
          name: 'emailAddress',
          columnName: 'email_address',
          type: { pgType: 'text', gqlType: 'String', isArray: false }
        }
      ]);
    });

    it('keeps resolver metadata scoped per executable schema', async () => {
      const buildSchema = (resourceName: string, typeName: string) => {
        const build = createMockBuild({
          [resourceName]: {
            codec: createMockCodec(resourceName, {
              id: createMockAttribute('text')
            }),
            uniques: [],
            relations: {}
          }
        });
        const queryFields = callGraphQLObjectTypeFieldsHook(
          {},
          build,
          'Query'
        );
        const schema = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields: () => queryFields
          }),
          types: [
            new GraphQLObjectType({
              name: typeName,
              fields: { id: { type: GraphQLString } }
            })
          ]
        });
        return schema;
      };

      const userSchema = buildSchema('user', 'User');
      const projectSchema = buildSchema('project', 'Project');
      const source = '{ _meta { tables { name } } }';

      const [userResult, projectResult] = await Promise.all([
        graphql({ schema: userSchema, source }),
        graphql({ schema: projectSchema, source })
      ]);

      expect(userResult.errors).toBeUndefined();
      expect(projectResult.errors).toBeUndefined();
      expect((userResult.data as any)._meta.tables).toEqual([{ name: 'User' }]);
      expect((projectResult.data as any)._meta.tables).toEqual([
        { name: 'Project' }
      ]);
      expect(
        getTablesMetaForSchema(userSchema)!.map((table) => table.name)
      ).toEqual(['User']);
      expect(
        getTablesMetaForSchema(projectSchema)!.map((table) => table.name)
      ).toEqual(['Project']);
    });

    it('validates metadata against schema changes made by later finalizers', async () => {
      const codec = createMockCodec('user', {
        id: createMockAttribute('text')
      });
      const build = createMockBuild(
        {
          user: { codec, uniques: [], relations: {} }
        },
        ['app_public'],
        {
          inflection: {
            allRowsList: () => 'users'
          }
        }
      );
      const userType = new GraphQLObjectType({
        name: 'User',
        fields: { id: { type: GraphQLString } }
      });
      const queryFields = callGraphQLObjectTypeFieldsHook(
        {
          users: { type: new GraphQLList(userType) }
        },
        build,
        'Query'
      );
      const queryType = new GraphQLObjectType({
        name: 'Query',
        fields: queryFields
      });
      const schema = new GraphQLSchema({ query: queryType });

      // Before later finalizers mutate the schema, the metadata resolves the
      // list entry-point; the resolver must recompute from the final schema.
      expect((collectTablesMeta(build, schema) as any[])[0].query.all).toBe('users');

      delete queryType.getFields().users;
      const result = await graphql({
        schema,
        source: '{ _meta { tables { query { all } } } }'
      });

      expect(result.errors).toBeUndefined();
      expect((result.data as any)._meta.tables[0].query.all).toBeNull();
    });
  });

  describe('snapshot scenarios', () => {
    it('produces stable metadata for a multi-table scenario', () => {
      const tables = buildComplexScenarioTables();
      const normalized = normalizeTablesForSnapshot(tables);

      expect(collectMetaInvariantErrors(normalized)).toEqual([]);
      expect(normalized).toMatchSnapshot();
    });
  });

  describe('storage metadata', () => {
    it('returns null storage for tables without storage tags', () => {
      const build = createMockBuild({
        user: {
          codec: createMockCodec('user', { id: createMockAttribute('uuid') }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].storage).toBeNull();
    });

    function createStoragePlaneResources(
      filesName: string,
      bucketsName: string,
      opts: { ownerId?: boolean } = {}
    ): Record<string, any> {
      const bucketsCodec = createMockCodec(bucketsName, {
        id: createMockAttribute('uuid'),
        key: createMockAttribute('text'),
        ...(opts.ownerId ? { owner_id: createMockAttribute('uuid') } : {})
      });
      (bucketsCodec as any).extensions = {
        ...bucketsCodec.extensions,
        tags: { storageBuckets: true }
      };
      const filesCodec = createMockCodec(filesName, {
        id: createMockAttribute('uuid'),
        key: createMockAttribute('text'),
        bucket_id: createMockAttribute('uuid')
      });
      (filesCodec as any).extensions = {
        ...filesCodec.extensions,
        tags: { storageFiles: true }
      };
      return {
        [filesName]: {
          codec: filesCodec,
          uniques: [],
          relations: {
            [`${filesName}_bucket_fkey`]: {
              isReferencee: false,
              localAttributes: ['bucket_id'],
              remoteAttributes: ['id'],
              remoteResource: { codec: bucketsCodec }
            }
          }
        },
        [bucketsName]: { codec: bucketsCodec, uniques: [], relations: {} }
      };
    }

    it('reports the full plane surface for @storageFiles tables', () => {
      const build = createMockBuild(createStoragePlaneResources('app_file', 'app_bucket'));
      const tables = callInitHook(build);
      const files = tables.find((t: any) => t.tableName === 'app_file');
      expect(files.storage).toEqual({
        isFilesTable: true,
        isBucketsTable: false,
        filesType: 'AppFile',
        bucketsType: 'AppBucket',
        downloadUrlField: 'downloadUrl',
        upload: {
          mutation: 'uploadAppFile',
          inputType: 'UploadAppFileInput',
          payloadType: 'UploadAppFilePayload',
          bulkMutation: 'uploadAppFiles',
          bulkInputType: 'UploadAppFileBulkInput',
          bulkPayloadType: 'UploadAppFileBulkPayload',
          bulkFileInputType: 'UploadAppFileBulkFileInput',
          bulkFilePayloadType: 'UploadAppFileBulkFilePayload',
          requiresOwnerId: false
        }
      });
    });

    it('reports the same plane from the @storageBuckets side', () => {
      const build = createMockBuild(createStoragePlaneResources('app_file', 'app_bucket'));
      const tables = callInitHook(build);
      const buckets = tables.find((t: any) => t.tableName === 'app_bucket');
      expect(buckets.storage).toMatchObject({
        isFilesTable: false,
        isBucketsTable: true,
        filesType: 'AppFile',
        bucketsType: 'AppBucket',
        downloadUrlField: null
      });
      expect(buckets.storage.upload.mutation).toBe('uploadAppFile');
    });

    it('pairs unprefixed files/buckets tables (database-scope planes)', () => {
      const build = createMockBuild(createStoragePlaneResources('files', 'buckets'));
      const tables = callInitHook(build);
      const files = tables.find((t: any) => t.tableName === 'files');
      expect(files.storage).toMatchObject({
        isFilesTable: true,
        filesType: 'Files',
        bucketsType: 'Buckets'
      });
      expect(files.storage.upload.mutation).toBe('uploadFiles');
    });

    it('reports requiresOwnerId for entity-keyed planes', () => {
      const build = createMockBuild(
        createStoragePlaneResources('data_room_file', 'data_room_bucket', { ownerId: true })
      );
      const tables = callInitHook(build);
      const files = tables.find((t: any) => t.tableName === 'data_room_file');
      expect(files.storage.upload.requiresOwnerId).toBe(true);
    });

    it('throws for a @storageFiles table with no FK to a @storageBuckets table', () => {
      const codec = createMockCodec('app_file', {
        id: createMockAttribute('uuid'),
        key: createMockAttribute('text'),
        bucket_id: createMockAttribute('uuid')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        tags: { storageFiles: true }
      };
      const build = createMockBuild({
        app_file: { codec, uniques: [], relations: {} }
      });
      expect(() => callInitHook(build)).toThrow(/STORAGE_PLANE_UNPAIRED/);
    });
  });

  describe('search metadata', () => {
    it('returns null search for tables without search features', () => {
      const build = createMockBuild({
        user: {
          codec: createMockCodec('user', { id: createMockAttribute('uuid') }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].search).toBeNull();
    });

    it('detects tsvector columns', () => {
      const codec = createMockCodec('article', {
        id: createMockAttribute('uuid'),
        title: createMockAttribute('text'),
        tsv: createMockAttribute('tsvector')
      });
      const build = createMockBuild({
        article: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].search).toEqual({
        algorithms: ['tsvector'],
        columns: [{ name: 'tsv', algorithm: 'tsvector' }],
        hasUnifiedSearch: true,
        config: null
      });
    });

    it('detects vector columns (pgvector)', () => {
      const codec = createMockCodec('document', {
        id: createMockAttribute('uuid'),
        embedding: createMockAttribute('vector')
      });
      const build = createMockBuild({
        document: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].search).toEqual({
        algorithms: ['vector'],
        columns: [{ name: 'embedding', algorithm: 'vector' }],
        hasUnifiedSearch: false,
        config: null
      });
    });

    it('detects @bm25Index tagged columns', () => {
      const bm25Attr = createMockAttribute('text');
      (bm25Attr as any).extensions = { tags: { bm25Index: true } };
      const codec = createMockCodec('article', {
        id: createMockAttribute('uuid'),
        body: bm25Attr
      });
      const build = createMockBuild({
        article: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].search).toEqual({
        algorithms: ['bm25'],
        columns: [{ name: 'body', algorithm: 'bm25' }],
        hasUnifiedSearch: true,
        config: null
      });
    });

    it('parses @searchConfig smart tag', () => {
      const codec = createMockCodec('article', {
        id: createMockAttribute('uuid'),
        tsv: createMockAttribute('tsvector')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        tags: {
          searchConfig: {
            weights: { bm25: 0.6, tsv: 0.4 },
            boost_recent: true,
            boost_recency_field: 'created_at',
            boost_recency_decay: 0.95
          }
        }
      };
      const build = createMockBuild({
        article: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].search).toEqual({
        algorithms: ['tsvector'],
        columns: [{ name: 'tsv', algorithm: 'tsvector' }],
        hasUnifiedSearch: true,
        config: {
          weights: { bm25: 0.6, tsv: 0.4 },
          boostRecent: true,
          boostRecencyField: 'created_at',
          boostRecencyDecay: 0.95
        }
      });
    });

    it('detects multiple search algorithms on one table', () => {
      const bm25Attr = createMockAttribute('text');
      (bm25Attr as any).extensions = { tags: { bm25Index: true } };
      const codec = createMockCodec('article', {
        id: createMockAttribute('uuid'),
        tsv: createMockAttribute('tsvector'),
        embedding: createMockAttribute('vector'),
        body: bm25Attr
      });
      const build = createMockBuild({
        article: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].search!.algorithms).toEqual(['bm25', 'tsvector', 'vector']);
      expect(tables[0].search!.hasUnifiedSearch).toBe(true);
      expect(tables[0].search!.columns).toHaveLength(3);
    });
  });

  describe('enum metadata', () => {
    it('returns null enumValues for non-enum fields', () => {
      const build = createMockBuild({
        user: {
          codec: createMockCodec('user', {
            id: createMockAttribute('uuid'),
            name: createMockAttribute('text')
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      for (const field of tables[0].fields) {
        expect(field.enumValues).toBeNull();
      }
    });

    it('detects enum type on a field', () => {
      const enumCodec = {
        name: 'status_enum',
        values: [{ value: 'active' }, { value: 'inactive' }, { value: 'pending' }]
      };
      const build = createMockBuild({
        task: {
          codec: createMockCodec('task', {
            id: createMockAttribute('uuid'),
            status: createMockAttribute('status_enum', { codec: enumCodec })
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const statusField = tables[0].fields.find((f: any) => f.name === 'status');
      expect(statusField.enumValues).toEqual({
        name: 'status_enum',
        values: ['active', 'inactive', 'pending']
      });
    });

    it('detects enum values as plain strings', () => {
      const enumCodec = {
        name: 'priority_enum',
        values: ['low', 'medium', 'high']
      };
      const build = createMockBuild({
        task: {
          codec: createMockCodec('task', {
            id: createMockAttribute('uuid'),
            priority: createMockAttribute('priority_enum', { codec: enumCodec })
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const priorityField = tables[0].fields.find((f: any) => f.name === 'priority');
      expect(priorityField.enumValues).toEqual({
        name: 'priority_enum',
        values: ['low', 'medium', 'high']
      });
    });

    it('detects enum through domain wrapper', () => {
      const innerEnumCodec = {
        name: 'color_enum',
        values: [{ value: 'red' }, { value: 'green' }, { value: 'blue' }]
      };
      const domainCodec = {
        name: 'color_domain',
        domainOfCodec: innerEnumCodec
      };
      const build = createMockBuild({
        item: {
          codec: createMockCodec('item', {
            id: createMockAttribute('uuid'),
            color: createMockAttribute('color_domain', { codec: domainCodec })
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const colorField = tables[0].fields.find((f: any) => f.name === 'color');
      expect(colorField.enumValues).toEqual({
        name: 'color_enum',
        values: ['red', 'green', 'blue']
      });
    });

    it('does not detect enum on non-enum array codec', () => {
      const innerCodec = { name: 'text', arrayOfCodec: null as any };
      const arrayCodec = { name: '_text', arrayOfCodec: innerCodec };
      const build = createMockBuild({
        item: {
          codec: createMockCodec('item', {
            id: createMockAttribute('uuid'),
            tags: createMockAttribute('_text', { codec: arrayCodec })
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const tagsField = tables[0].fields.find((f: any) => f.name === 'tags');
      expect(tagsField.enumValues).toBeNull();
    });
  });

  describe('i18n metadata', () => {
    it('returns null i18n for tables without @i18n tag', () => {
      const build = createMockBuild({
        user: {
          codec: createMockCodec('user', {
            id: createMockAttribute('uuid'),
            name: createMockAttribute('text')
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].i18n).toBeNull();
    });

    it('detects @i18n tagged tables with translation table name', () => {
      const baseCodec = {
        name: 'post',
        attributes: {
          id: createMockAttribute('uuid'),
          title: createMockAttribute('text'),
          body: createMockAttribute('text'),
          views: createMockAttribute('int4')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public' },
          tags: { i18n: 'post_translations' }
        }
      };
      const translationCodec = {
        name: 'postTranslations',
        attributes: {
          post_id: createMockAttribute('uuid'),
          lang_code: createMockAttribute('text'),
          title: createMockAttribute('text'),
          body: createMockAttribute('text')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public', name: 'post_translations' }
        }
      };
      const build = createMockBuild({
        post: {
          codec: baseCodec,
          uniques: [],
          relations: {}
        },
        post_translations: {
          codec: translationCodec,
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const postTable = tables.find((t: any) => t.name === 'Post');
      expect(postTable.i18n).toEqual({
        translationTable: 'post_translations',
        translatableFields: [
          { name: 'title', type: 'text' },
          { name: 'body', type: 'text' }
        ]
      });
    });

    it('excludes non-text columns from translatable fields', () => {
      const baseCodec = {
        name: 'item',
        attributes: {
          id: createMockAttribute('uuid'),
          label: createMockAttribute('text'),
          count: createMockAttribute('int4')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public' },
          tags: { i18n: 'item_translations' }
        }
      };
      const translationCodec = {
        name: 'itemTranslations',
        attributes: {
          item_id: createMockAttribute('uuid'),
          lang_code: createMockAttribute('text'),
          label: createMockAttribute('text')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public', name: 'item_translations' }
        }
      };
      const build = createMockBuild({
        item: {
          codec: baseCodec,
          uniques: [],
          relations: {}
        },
        item_translations: {
          codec: translationCodec,
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      const itemTable = tables.find((t: any) => t.name === 'Item');
      expect(itemTable.i18n).toEqual({
        translationTable: 'item_translations',
        translatableFields: [{ name: 'label', type: 'text' }]
      });
    });
  });

  describe('realtime metadata', () => {
    it('returns null realtime for tables without @realtime tag', () => {
      const build = createMockBuild({
        user: {
          codec: createMockCodec('user', {
            id: createMockAttribute('uuid'),
            name: createMockAttribute('text')
          }),
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].realtime).toBeNull();
    });

    it('detects @realtime tagged tables', () => {
      const realtimeCodec = {
        name: 'message',
        attributes: {
          id: createMockAttribute('uuid'),
          content: createMockAttribute('text')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public' },
          tags: { realtime: true }
        }
      };
      const build = createMockBuild({
        message: {
          codec: realtimeCodec,
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].realtime).toEqual({
        subscriptionFieldName: 'onMessageChanged'
      });
    });

    it('generates correct subscription field name from table type', () => {
      const realtimeCodec = {
        name: 'chat_room',
        attributes: {
          id: createMockAttribute('uuid')
        },
        isAnonymous: false,
        extensions: {
          pg: { schemaName: 'app_public' },
          tags: { realtime: true }
        }
      };
      const build = createMockBuild({
        chat_room: {
          codec: realtimeCodec,
          uniques: [],
          relations: {}
        }
      });
      const tables = callInitHook(build);
      expect(tables[0].realtime).toEqual({
        subscriptionFieldName: 'onChatRoomChanged'
      });
    });
  });

  describe('scope metadata', () => {
    it('returns null scope for tables without an @scope tag (no column inference)', () => {
      const codec = createMockCodec('widget', {
        id: createMockAttribute('uuid'),
        // a database_id column must NOT be enough to infer a scope
        database_id: createMockAttribute('uuid')
      });
      const build = createMockBuild({
        widget: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].scope).toBeNull();
    });

    it('reads a database @scope smart tag verbatim', () => {
      const codec = createMockCodec('app_setting', {
        id: createMockAttribute('uuid'),
        database_id: createMockAttribute('uuid')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        tags: { scope: 'database', scopeTier: 'database', scopeKey: 'database_id' }
      };
      const build = createMockBuild({
        app_setting: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].scope).toEqual({
        scope: 'database',
        tier: 'database',
        keyColumn: 'databaseId',
        entityTable: null,
        source: 'smartTag'
      });
    });

    it('reads a global @scope smart tag with no key column', () => {
      const codec = createMockCodec('feature_flag', {
        id: createMockAttribute('uuid'),
        key: createMockAttribute('text')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        tags: { scope: 'platform', scopeTier: 'global' }
      };
      const build = createMockBuild({
        feature_flag: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].scope).toEqual({
        scope: 'platform',
        tier: 'global',
        keyColumn: null,
        entityTable: null,
        source: 'smartTag'
      });
    });

    it('reads an entity @scope smart tag with the exact key column and entity table', () => {
      const codec = createMockCodec('project', {
        id: createMockAttribute('uuid'),
        tenant_ref: createMockAttribute('uuid')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        // key column named freely by the generator — must be taken verbatim
        tags: {
          scope: 'org',
          scopeTier: 'entity',
          scopeKey: 'tenant_ref',
          scopeEntityTable: 'organizations'
        }
      };
      const build = createMockBuild({
        project: { codec, uniques: [], relations: {} }
      });
      const tables = callInitHook(build);
      expect(tables[0].scope).toEqual({
        scope: 'org',
        tier: 'entity',
        keyColumn: 'tenantRef',
        entityTable: 'organizations',
        source: 'smartTag'
      });
    });

    it('throws when @scope is present but scopeTier is missing or invalid', () => {
      const codec = createMockCodec('broken', {
        id: createMockAttribute('uuid')
      });
      (codec as any).extensions = {
        ...codec.extensions,
        tags: { scope: 'org' }
      };
      const build = createMockBuild({
        broken: { codec, uniques: [], relations: {} }
      });
      expect(() => callInitHook(build)).toThrow(/scopeTier/);
    });
  });

  describe('_meta query contract', () => {
    it('contains required selection paths', () => {
      const paths = getMetaQueryTablePaths(META_QUERY_CONTRACT).sort();
      const missing = REQUIRED_META_QUERY_PATHS.filter((required) => !paths.includes(required));

      expect(missing).toEqual([]);
      expect(paths).toMatchSnapshot();
    });

    it('has stable printed GraphQL text', () => {
      expect(print(parse(META_QUERY_CONTRACT))).toMatchSnapshot();
    });
  });
});
