import {
  getNamedType,
  graphql,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';

import { MetaSchemaPlugin } from '../src';
import { allowedValuesForAttribute } from '../src/check-constraint-values';
import { collectTablesMeta } from '../src/table-meta-builder';
// conbin and pg_get_constraintdef() of CHECK constraints, captured from a
// PostgreSQL 18 temp table with one column per variant.
import checks from './__fixtures__/check-constraints.json';

type Check = { conkey: number[]; definition: string; conbin: string };
const fixtures = checks as Record<string, Check>;

function checkOf(name: string) {
  const { conkey, conbin } = fixtures[name];
  return { contype: 'c', conkey, conbin };
}

function attr(pgType: string, opts: Record<string, unknown> = {}) {
  return { codec: { name: pgType }, notNull: false, hasDefault: false, ...opts };
}

function codec(name: string, attributes: Record<string, unknown>, tags: Record<string, unknown> = {}) {
  return { name, attributes, extensions: { pg: { schemaName: 'app_public', name }, tags } };
}

function resource(codecValue: any, uniques: unknown[], relations: Record<string, any> = {}) {
  return { codec: codecValue, uniques, relations, getRelations: () => relations };
}

const typeName = (name: string) =>
  name.replace(/(^|_)([a-z])/g, (_: string, __: string, c: string) => c.toUpperCase());

function build(resources: Record<string, any>, overrides: Record<string, any> = {}) {
  return {
    input: { pgRegistry: { pgResources: resources } },
    inflection: {
      tableType: (c: any) => typeName(c.name),
      _attributeName: ({ attributeName }: { attributeName: string }) =>
        attributeName.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase()),
      ...overrides.inflection
    },
    options: { pgSchemas: ['app_public'] },
    ...overrides.build
  };
}

const pk = { attributes: ['id'], isPrimary: true };

// Link a junction's forward FK to its target, with the backward relation the
// registry keeps on the target.
function link(junction: any, column: string, target: any, name: string) {
  junction.relations[`${name}_fkey`] = {
    localAttributes: [column],
    remoteAttributes: ['id'],
    remoteResource: target
  };
  target.relations[`${name}_back`] = {
    isReferencee: true,
    localAttributes: ['id'],
    remoteAttributes: [column],
    remoteResource: junction
  };
}

describe('allowedValues from CHECK constraints', () => {
  it.each([
    ['s_in', ['open', 'full']],
    ['s_any', ['open', 'full']],
    ['s_or', ['open', 'full', 'cancelled']],
    ['s_rev', ['open', 'full']],
    ['s_eq', ['only']],
    ['s_vc', ['open', 'full']],
    ['s_bp', ['abc', 'def']],
    ['s_lit', ['open', 'full']],
    ['s_esc', ["it's", 'café', 'a b']]
  ])('reads %s', (name, expected) => {
    const check = checkOf(name);
    expect(allowedValuesForAttribute([check], check.conkey[0])).toEqual(expected);
  });

  it.each([
    ['n_int', 'a non-text constant'],
    ['s_and', 'an AND with another condition'],
    ['s_all', 'a <> ALL'],
    ['s_fn', 'a function of the column']
  ])('ignores %s (%s)', (name) => {
    const check = checkOf(name);
    expect(allowedValuesForAttribute([check], check.conkey[0])).toBeNull();
  });

  it('ignores a constraint spanning two columns, and constraints on other columns', () => {
    const ab = checkOf('ab');
    expect(allowedValuesForAttribute([ab], ab.conkey[0])).toBeNull();
    expect(allowedValuesForAttribute([checkOf('s_in')], 99)).toBeNull();
  });

  it('reports no fixed set when another check on the column is not simple', () => {
    const simple = checkOf('s_in');
    // s_fn's lower(...) check, moved onto s_in's column.
    const other = {
      ...simple,
      conbin: checkOf('s_fn').conbin.replace(/:varattno \d+ /, `:varattno ${simple.conkey[0]} `)
    };
    expect(allowedValuesForAttribute([simple, other], simple.conkey[0])).toBeNull();
  });

  it('intersects several simple constraints on one column', () => {
    const wide = checkOf('s_or');
    // s_in's open/full list, moved onto s_or's column.
    const narrow = {
      ...wide,
      conbin: checkOf('s_in').conbin.replace(':varattno 1 ', `:varattno ${wide.conkey[0]} `)
    };
    expect(allowedValuesForAttribute([wide, narrow], wide.conkey[0])).toEqual(['open', 'full']);
  });

  it('reaches _meta through the gather hook', () => {
    const check = checkOf('s_or');
    const attribute: any = { codec: { name: 'text' } };
    const hook = MetaSchemaPlugin.gather!.hooks!.pgCodecs_attribute as any;
    hook({}, {
      pgClass: { getConstraints: () => [check, checkOf('s_and')] },
      pgAttribute: { attnum: check.conkey[0] },
      attribute
    });

    const shifts = codec('shifts', { id: attr('uuid', { hasDefault: true }), status: attribute });
    const [table] = collectTablesMeta(build({ shifts: resource(shifts, [pk]) }) as any);
    expect(table.fields.find((f) => f.name === 'status')?.allowedValues).toEqual([
      'open',
      'full',
      'cancelled'
    ]);
    expect(table.fields.find((f) => f.name === 'id')?.allowedValues).toBeNull();
  });
});

describe('junction detection', () => {
  function foodBank(extra: Record<string, unknown> = {}) {
    const users = resource(codec('users', { id: attr('uuid', { hasDefault: true }) }), [pk]);
    const shifts = resource(codec('shifts', { id: attr('uuid', { hasDefault: true }) }), [pk]);
    const volunteers = resource(codec('volunteers', { id: attr('uuid', { hasDefault: true }) }), [pk]);
    const signups = resource(
      codec('shift_signups', {
        id: attr('uuid', { notNull: true, hasDefault: true }),
        shift_id: attr('uuid', { notNull: true }),
        volunteer_id: attr('uuid', { notNull: true }),
        owner_id: attr('uuid', { notNull: true, hasDefault: true }),
        created_at: attr('timestamptz', { notNull: true, hasDefault: true }),
        updated_at: attr('timestamptz', { notNull: true, hasDefault: true }),
        ...extra
      }),
      [pk]
    );
    link(signups, 'shift_id', shifts, 'shift_signups_shift');
    link(signups, 'volunteer_id', volunteers, 'shift_signups_volunteer');
    link(signups, 'owner_id', users, 'shift_signups_owner');
    return { users, shifts, volunteers, shift_signups: signups };
  }

  const byName = (tables: any[]) => Object.fromEntries(tables.map((t) => [t.tableName, t]));

  it('treats id, a defaulted owner FK and timestamps as system columns and links both sides', () => {
    const tables = byName(collectTablesMeta(build(foodBank()) as any));

    expect(tables.shift_signups.isJunction).toBe(true);
    expect(tables.shifts.isJunction).toBe(false);
    expect(tables.shifts.relations.manyToMany).toMatchObject([
      {
        fieldName: null,
        type: null,
        junctionTable: { name: 'shift_signups' },
        rightTable: { name: 'volunteers' }
      }
    ]);
    expect(tables.shifts.relations.manyToMany[0].junctionLeftKeyAttributes.map((f: any) => f.name)).toEqual(['shiftId']);
    expect(tables.shifts.relations.manyToMany[0].junctionRightKeyAttributes.map((f: any) => f.name)).toEqual(['volunteerId']);
    expect(tables.volunteers.relations.manyToMany).toMatchObject([
      { junctionTable: { name: 'shift_signups' }, rightTable: { name: 'shifts' } }
    ]);
    expect(tables.users.relations.manyToMany).toEqual([]);
  });

  it('counts trigger-filled and @scope key columns as system, but not a writable timestamp', () => {
    const scoped = foodBank({
      entity_id: attr('uuid', { notNull: true }),
      database_id: attr('uuid', { notNull: true })
    });
    scoped.shift_signups.codec.extensions.tags = { scope: 'org', scopeTier: 'entity', scopeKey: 'entity_id' };
    const insertable = (entity: [any, string], behavior: string) =>
      !(behavior === 'attribute:insert' && entity[1] === 'database_id');
    const withBehavior = build(scoped, { build: { behavior: { pgCodecAttributeMatches: insertable } } });
    expect(byName(collectTablesMeta(withBehavior as any)).shift_signups.isJunction).toBe(true);

    const withData = foodBank({ checked_in_at: attr('timestamptz') });
    expect(byName(collectTablesMeta(build(withData) as any)).shift_signups.isJunction).toBe(false);
  });

  it('treats a primary key made of the two foreign keys as the junction itself', () => {
    const posts = resource(codec('posts', { id: attr('uuid', { hasDefault: true }) }), [pk]);
    const tags = resource(codec('tags', { id: attr('uuid', { hasDefault: true }) }), [pk]);
    const postTags = resource(
      codec('post_tags', { post_id: attr('uuid', { notNull: true }), tag_id: attr('uuid', { notNull: true }) }),
      [{ attributes: ['post_id', 'tag_id'], isPrimary: true }]
    );
    link(postTags, 'post_id', posts, 'post_tags_post');
    link(postTags, 'tag_id', tags, 'post_tags_tag');

    const tables = byName(collectTablesMeta(build({ posts, tags, post_tags: postTags }) as any));
    expect(tables.post_tags.isJunction).toBe(true);
    expect(tables.tags.relations.manyToMany).toMatchObject([{ rightTable: { name: 'posts' } }]);
  });

  const singular: Record<string, string> = {
    shifts: 'Shift',
    volunteers: 'Volunteer',
    shift_signups: 'ShiftSignup',
    users: 'User'
  };
  const camel = (name: string) => name.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());

  // A final schema exposing each table's columns as fields and its create
  // mutation, minus the tables in `omit`, the columns in `hide` and the
  // create mutations in `noCreate`.
  function exposedSchema(
    resources: Record<string, any>,
    opts: {
      omit?: string[];
      hide?: Record<string, string[]>;
      noCreate?: string[];
      extra?: Record<string, Record<string, any>>;
    } = {}
  ) {
    const exposed = Object.values(resources).filter((r: any) => !opts.omit?.includes(r.codec.name));
    const types = exposed.map((r: any) => {
      const columns = Object.keys(r.codec.attributes).filter((c) => !opts.hide?.[r.codec.name]?.includes(c));
      return new GraphQLObjectType({
        name: singular[r.codec.name],
        fields: {
          ...Object.fromEntries(columns.map((c) => [camel(c), { type: GraphQLString }])),
          ...opts.extra?.[r.codec.name]
        }
      });
    });
    const creates = exposed
      .filter((r: any) => !opts.noCreate?.includes(r.codec.name))
      .map((r: any) => [
        `create${singular[r.codec.name]}`,
        {
          type: new GraphQLObjectType({
            name: `Create${singular[r.codec.name]}Payload`,
            fields: { clientMutationId: { type: GraphQLString } }
          })
        }
      ]);
    return new GraphQLSchema({
      query: new GraphQLObjectType({ name: 'Query', fields: { ping: { type: GraphQLString } } }),
      mutation: new GraphQLObjectType({ name: 'Mutation', fields: Object.fromEntries(creates) }),
      types
    });
  }

  const inflected = (overrides: Record<string, unknown> = {}) => ({
    inflection: {
      tableType: (c: any) => singular[c.name],
      createField: (r: any) => `create${singular[r.codec.name]}`,
      createPayloadType: (r: any) => `Create${singular[r.codec.name]}Payload`,
      ...overrides
    }
  });

  it('names the GraphQL field when the final schema has one, and reports null when not', () => {
    const resources = foodBank();
    const meta = build(
      resources,
      inflected({
        manyToManyRelationConnectionField: (details: any) =>
          details.leftTable.codec.name === 'shifts' ? 'volunteers' : null,
        manyToManyRelationConnectionType: () => 'ShiftVolunteersManyToManyConnection'
      })
    );
    const connection = new GraphQLObjectType({
      name: 'ShiftVolunteersManyToManyConnection',
      fields: { totalCount: { type: GraphQLString } }
    });
    const schema = exposedSchema(resources, { extra: { shifts: { volunteers: { type: connection } } } });

    const tables = byName(collectTablesMeta(meta as any, schema));
    expect(tables.shift_signups.isJunction).toBe(true);
    expect(tables.shifts.relations.manyToMany).toMatchObject([
      { fieldName: 'volunteers', type: 'ShiftVolunteersManyToManyConnection', rightTable: { name: 'Volunteer' } }
    ]);
    expect(tables.volunteers.relations.manyToMany).toMatchObject([
      { fieldName: null, type: null, rightTable: { name: 'Shift' } }
    ]);
  });

  it('reports no link, and no junction, when the other side is not exposed', () => {
    const resources = foodBank();
    const schema = exposedSchema(resources, { omit: ['volunteers'] });

    const tables = byName(collectTablesMeta(build(resources, inflected()) as any, schema));
    expect(tables.volunteers).toBeUndefined();
    expect(tables.shifts.relations.manyToMany).toEqual([]);
    expect(tables.shift_signups.isJunction).toBe(false);
  });

  it('reports no link when a key column is hidden', () => {
    const resources = foodBank();
    const schema = exposedSchema(resources, { hide: { shift_signups: ['volunteer_id'] } });

    const tables = byName(collectTablesMeta(build(resources, inflected()) as any, schema));
    expect(tables.shifts.relations.manyToMany).toEqual([]);
    expect(tables.shift_signups.isJunction).toBe(false);
  });

  it('reports no link when the junction has no create mutation', () => {
    const resources = foodBank();
    const schema = exposedSchema(resources, { noCreate: ['shift_signups'] });

    const tables = byName(collectTablesMeta(build(resources, inflected()) as any, schema));
    expect(tables.shifts.relations.manyToMany).toEqual([]);
    expect(tables.shift_signups.isJunction).toBe(false);
  });

  it('reports no link through a relation hidden from the API', () => {
    const resources = foodBank();
    const meta = build(resources, {
      ...inflected(),
      build: {
        behavior: {
          pgCodecRelationMatches: (relation: any, behavior: string) =>
            !(behavior === 'select' && relation.localAttributes?.includes('volunteer_id'))
        }
      }
    });

    const tables = byName(collectTablesMeta(meta as any, exposedSchema(resources)));
    expect(tables.shifts.relations.manyToMany).toEqual([]);
    expect(tables.shift_signups.isJunction).toBe(false);
  });

  it('gives the same answer whether or not the junction has hidden columns', () => {
    const resources = foodBank({ internal_note: attr('text') });
    const schema = exposedSchema(resources, { hide: { shift_signups: ['internal_note'] } });

    const tables = byName(collectTablesMeta(build(resources, inflected()) as any, schema));
    expect(tables.shift_signups.isJunction).toBe(true);
    expect(tables.shift_signups.fields.map((f: any) => f.columnName)).not.toContain('internal_note');
  });
});

describe('create and update writability', () => {
  it('reads requiredness from the create input, not from NOT NULL', async () => {
    const messages = codec('agent_message', {
      id: attr('uuid', { notNull: true, hasDefault: true }),
      thread_id: attr('uuid', { notNull: true }),
      entity_id: attr('uuid', { notNull: true }),
      kind: attr('text', { notNull: true, hasDefault: true })
    });
    const meta = build(
      { agent_message: resource(messages, [pk]) },
      {
        inflection: {
          createField: () => 'createAgentMessage',
          createPayloadType: () => 'CreateAgentMessagePayload',
          updateByKeysField: () => 'updateAgentMessage',
          updatePayloadType: () => 'UpdateAgentMessagePayload',
          tableFieldName: () => 'agentMessage',
          patchField: (name: string) => `${name}Patch`
        }
      }
    );

    // entity_id is NOT NULL with no default, yet absent from the create input
    // (a trigger fills it), as PostGraphile builds it for `@behavior -insert`.
    const messageType = new GraphQLObjectType({
      name: 'AgentMessage',
      fields: { id: { type: GraphQLID }, threadId: { type: GraphQLID }, entityId: { type: GraphQLID }, kind: { type: GraphQLString } }
    });
    const record = new GraphQLInputObjectType({
      name: 'AgentMessageInput',
      fields: { id: { type: GraphQLID }, threadId: { type: new GraphQLNonNull(GraphQLID) }, kind: { type: GraphQLString } }
    });
    const patch = new GraphQLInputObjectType({
      name: 'AgentMessagePatch',
      fields: { kind: { type: GraphQLString } }
    });
    const mutation = (name: string, input: Record<string, any>) => ({
      type: new GraphQLObjectType({ name: `${name[0].toUpperCase()}${name.slice(1)}Payload`, fields: { m: { type: messageType } } }),
      args: {
        input: {
          type: new GraphQLNonNull(
            new GraphQLInputObjectType({
              name: `${name[0].toUpperCase()}${name.slice(1)}Input`,
              fields: { clientMutationId: { type: GraphQLString }, ...input }
            })
          )
        }
      }
    });
    const queryFields = MetaSchemaPlugin.schema!.hooks!.GraphQLObjectType_fields as any;
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: () => queryFields({ ping: { type: GraphQLString } }, meta, { scope: { isRootQuery: true } })
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          // A nested-write input beside the record must not be taken for it.
          createAgentMessage: mutation('createAgentMessage', {
            agentMessage: { type: new GraphQLNonNull(record) },
            threadByThreadId: {
              type: new GraphQLInputObjectType({ name: 'NestedThreadInput', fields: { title: { type: GraphQLString } } })
            }
          }),
          updateAgentMessage: mutation('updateAgentMessage', {
            id: { type: new GraphQLNonNull(GraphQLID) },
            agentMessagePatch: { type: new GraphQLNonNull(patch) }
          })
        }
      })
    });

    const result = await graphql({
      schema,
      source: '{ _meta { tables { isJunction fields { name isNotNull isRequiredOnCreate isWritableOnCreate isWritableOnUpdate } } } }'
    });

    expect(result.errors).toBeUndefined();
    const [table] = (result.data as any)._meta.tables;
    expect(table.isJunction).toBe(false);
    expect(table.fields).toEqual([
      { name: 'id', isNotNull: true, isRequiredOnCreate: false, isWritableOnCreate: true, isWritableOnUpdate: false },
      { name: 'threadId', isNotNull: true, isRequiredOnCreate: true, isWritableOnCreate: true, isWritableOnUpdate: false },
      { name: 'entityId', isNotNull: true, isRequiredOnCreate: false, isWritableOnCreate: false, isWritableOnUpdate: false },
      { name: 'kind', isNotNull: true, isRequiredOnCreate: false, isWritableOnCreate: true, isWritableOnUpdate: true }
    ]);
  });
});

describe('only what the API exposes', () => {
  function allowedValuesIn(value: unknown, found: unknown[] = []): unknown[] {
    if (Array.isArray(value)) value.forEach((item) => allowedValuesIn(item, found));
    else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (key === 'allowedValues') found.push(child);
        else allowedValuesIn(child, found);
      }
    }
    return found;
  }

  it('reports no allowedValues for a hidden column, anywhere in the table', () => {
    const status = attr('text', { notNull: true, extensions: { allowedValues: ['open', 'full'] } });
    const shifts = resource(codec('shifts', { id: attr('uuid', { hasDefault: true }), status }), [
      pk,
      { attributes: ['status'], tags: { name: 'shifts_status_key' } }
    ]);
    const meta = build(
      { shifts },
      {
        inflection: { tableType: () => 'Shift' },
        build: {
          behavior: {
            pgCodecAttributeMatches: (entity: [any, string], behavior: string) =>
              !(behavior === 'attribute:select' && entity[1] === 'status')
          }
        }
      }
    );
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({ name: 'Query', fields: { ping: { type: GraphQLString } } }),
      types: [new GraphQLObjectType({ name: 'Shift', fields: { id: { type: GraphQLID } } })]
    });

    const [table] = collectTablesMeta(meta as any, schema);
    expect(table.fields.map((f) => f.columnName)).toEqual(['id']);
    expect(allowedValuesIn(table).every((values) => values === null)).toBe(true);
  });

  // Every type and field description `_meta` serves is public copy: it says
  // what a client may rely on, never how a value is derived.
  it('describes every _meta type and field without backend internals', () => {
    const hook = MetaSchemaPlugin.schema!.hooks!.GraphQLObjectType_fields as any;
    const metaField = hook({}, build({}), { scope: { isRootQuery: true } })._meta;
    const texts: string[] = [metaField.description];
    const seen = new Set<string>();
    const visit = (type: any) => {
      const named = getNamedType(type as GraphQLObjectType) as GraphQLObjectType;
      if (seen.has(named.name) || !('getFields' in named)) return;
      seen.add(named.name);
      if (named.description) texts.push(named.description);
      for (const field of Object.values(named.getFields())) {
        if (field.description) texts.push(field.description);
        visit(field.type);
      }
    };
    visit(metaField.type);

    expect(seen.has('MetaField') && seen.has('MetaScope') && seen.has('MetaStorageUpload')).toBe(true);
    const forbidden =
      /@\w|smart ?tag|plugin|registry|presigned|derived|inflect|introspect|trigger|behavio|provenance|check constraint/i;
    expect(texts.filter((text) => forbidden.test(text))).toEqual([]);
  });
});
