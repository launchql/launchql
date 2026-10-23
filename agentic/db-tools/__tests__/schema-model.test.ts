import type { ProjectContext } from '../src/context';
import { accessOf, type ModelPolicy, readSchemaModel, SchemaReadError } from '../src/schema-model';
import { columnDefault, normalizeType, readCheck } from '../src/schema-model/normalize';

// Postgres AST JSON as the metaschema stores it.
const str = (sval: string) => ({ String: { sval } });
const col = (name: string) => ({ ColumnRef: { fields: [str(name)] } });
const inList = (column: string, items: unknown) => ({
  A_Expr: { kind: 'AEXPR_IN', name: [str('=')], lexpr: col(column), rexpr: items },
});

describe('normalizeType', () => {
  it.each([
    [{ name: 'int4' }, 'integer'],
    [{ name: 'int8' }, 'bigint'],
    [{ name: 'bool' }, 'boolean'],
    [{ name: 'decimal' }, 'numeric'],
    [{ name: 'timestamp with time zone' }, 'timestamptz'],
    [{ name: 'character varying' }, 'varchar'],
    [{ name: 'email' }, 'email'],
    [{ name: 'text', array_dimensions: 1 }, 'text[]'],
    [{ name: 'int4', array_dimensions: 2 }, 'integer[][]'],
    ['TIMESTAMPTZ', 'timestamptz'],
  ])('%j → %s', (raw, type) => {
    expect(normalizeType(raw)).toBe(type);
  });
});

describe('columnDefault', () => {
  it.each([
    [{ value: 'active' }, { kind: 'value', value: 'active' }],
    [{ value: 0 }, { kind: 'value', value: 0 }],
    [{ value: false }, { kind: 'value', value: false }],
    [{ sql_keyword: 'CURRENT_TIMESTAMP' }, { kind: 'now' }],
    [{ function: 'now' }, { kind: 'now' }],
    [{ sql_keyword: 'CURRENT_DATE' }, { kind: 'today' }],
    [{ function: 'uuidv7' }, { kind: 'generated', fn: 'uuidv7' }],
    [{ function: 'gen_random_uuid' }, { kind: 'generated', fn: 'gen_random_uuid' }],
    [
      { operator: '+', left: { function: 'now' }, right: { value: '1 day', cast: { name: 'interval' } } },
      { kind: 'expression', text: "now() + '1 day'::interval" },
    ],
    [{ function: 'nextval', args: ['items_seq'] }, { kind: 'expression', text: "nextval('items_seq')" }],
    ['now()', { kind: 'now' }],
    [{ value: null }, null],
    [null, null],
  ])('%j', (raw, expected) => {
    expect(columnDefault(raw)).toEqual(expected);
  });
});

describe('readCheck', () => {
  it('reads the plain sval constants DataStatusField writes', () => {
    const chk = { expression: inList('status', [{ A_Const: { sval: 'active' } }, { A_Const: { sval: 'archived' } }]) };

    expect(readCheck(chk)).toEqual({ values: ['active', 'archived'], other: false });
  });

  it("reads the parser's wrapped constants inside a List", () => {
    const expr = inList('size', { List: { items: [{ A_Const: { sval: { sval: 'small' } } }, { A_Const: { sval: { sval: 'large' } } }] } });

    expect(readCheck(expr)).toEqual({ values: ['small', 'large'], other: false });
  });

  it('reads integer constants, zero included', () => {
    const expr = inList('qty', [{ A_Const: { ival: { ival: 3 } } }, { A_Const: { ival: {} } }]);

    expect(readCheck(expr).values).toEqual(['3', '0']);
  });

  it('reads = ANY (ARRAY[...]) through casts', () => {
    const cast = (sval: string) => ({ TypeCast: { arg: { A_Const: { sval: { sval } } }, typeName: {} } });
    const expr = {
      A_Expr: {
        kind: 'AEXPR_OP_ANY',
        name: [str('=')],
        lexpr: col('status'),
        rexpr: { TypeCast: { arg: { A_ArrayExpr: { elements: [cast('open'), cast('closed')] } } } },
      },
    };

    expect(readCheck(expr)).toEqual({ values: ['open', 'closed'], other: false });
  });

  it('keeps the values of an IN-list ANDed with a range, and flags the range', () => {
    const range = { A_Expr: { kind: 'AEXPR_OP', name: [str('>=')], lexpr: col('qty'), rexpr: { A_Const: { ival: {} } } } };
    const expr = { BoolExpr: { boolop: 'AND_EXPR', args: [range, inList('qty', [{ A_Const: { ival: 1 } }])] } };

    expect(readCheck(expr)).toEqual({ values: ['1'], other: true });
  });

  it('flags a check it cannot read as other', () => {
    expect(readCheck({ expression: { FuncCall: { funcname: [str('char_length')] } } })).toEqual({ other: true });
  });
});

describe('accessOf', () => {
  const policy = (type: string, privilege: string, extra: Partial<ModelPolicy> = {}): ModelPolicy => ({
    id: `${type}-${privilege}`,
    type,
    privilege,
    role: 'authenticated',
    permissive: true,
    disabled: false,
    data: type === 'AuthzAppMemberOwner' ? { owner_field: 'owner_id' } : {},
    ...extra,
  });
  const crud = (type: string, extra: Partial<ModelPolicy> = {}) =>
    ['select', 'insert', 'update', 'delete'].map((p) => policy(type, p, extra));

  it('reads the app-member owner policy on owner_id as private', () => {
    expect(accessOf(crud('AuthzAppMemberOwner'))).toBe('private');
  });

  it('reads the plain app-membership policy as shared, ignoring an internal one', () => {
    expect(accessOf([...crud('AuthzAppMembership'), policy('AuthzNotReadOnly', 'update', { permissive: false })])).toBe(
      'shared',
    );
  });

  it('treats a parameter left at its no-op value as unset', () => {
    expect(accessOf(crud('AuthzAppMembership', { data: { is_admin: false, levels: [] } }))).toBe('shared');
  });

  it('ignores the keys the backend fills in for an app membership, as a provisioned table stores them', () => {
    const resolved = { sprt_table: 'app_memberships', sprt_schema: 'app_private', membership_type: 1 };
    expect(accessOf(crud('AuthzAppMembership', { data: resolved }))).toBe('shared');
    expect(accessOf(crud('AuthzAppMemberOwner', { data: { ...resolved, owner_field: 'owner_id' } }))).toBe('private');
  });

  it.each([
    ['no policies', []],
    ['a missing privilege', crud('AuthzAppMembership').slice(0, 3)],
    ['another owner field', crud('AuthzAppMemberOwner', { data: { owner_field: 'author_id' } })],
    ['a required level', crud('AuthzAppMembership', { data: { levels: ['gold'] } })],
    ['another role', crud('AuthzAppMembership', { role: 'anonymous' })],
    ['mixed modes', [...crud('AuthzAppMembership').slice(0, 2), ...crud('AuthzAppMemberOwner').slice(2)]],
    ['another policy type', crud('AuthzEntityMembership')],
    ['an org membership', crud('AuthzAppMembership', { data: { membership_type: 2 } })],
  ])('reads %s as custom', (_case, policies) => {
    expect(accessOf(policies)).toBe('custom');
  });
});

describe('readSchemaModel', () => {
  // A fake platform api: each model's findMany returns its rows, in call order.
  function fakeApi(overrides: Record<string, unknown> = {}) {
    const calls: { model: string; args: Record<string, unknown> }[] = [];
    const rows: Record<string, unknown> = {
      database: { databases: { nodes: [{ id: 'db-1', hash: 'h1' }] } },
      table: {
        tables: {
          nodes: [
            { id: 't-items', name: 'items', category: 'APP', label: 'Items' },
            { id: 't-lists', name: 'lists', category: 'APP' },
            { id: 't-users', name: 'users', category: 'CORE' },
            { id: 't-audit', name: 'audit_log', category: 'MODULE' },
          ],
        },
      },
      field: {
        fields: {
          nodes: [
            { id: 'f-id', tableId: 't-items', name: 'id', category: 'APP', fieldOrder: 1, type: { name: 'uuid' }, isRequired: true, defaultValue: { function: 'uuidv7' } },
            { id: 'f-name', tableId: 't-items', name: 'name', category: 'APP', fieldOrder: 2, type: { name: 'text' }, isRequired: true },
            {
              id: 'f-status', tableId: 't-items', name: 'status', category: 'MODULE', fieldOrder: 3, type: { name: 'text' },
              defaultValue: { value: 'active' },
              chk: { expression: inList('status', [{ A_Const: { sval: 'active' } }, { A_Const: { sval: 'archived' } }]) },
            },
            { id: 'f-size', tableId: 't-items', name: 'size', category: 'APP', fieldOrder: 4, type: { name: 'text' } },
            { id: 'f-code', tableId: 't-items', name: 'code', category: 'APP', fieldOrder: 5, type: { name: 'citext' } },
            { id: 'f-list', tableId: 't-items', name: 'list_id', category: 'APP', fieldOrder: 6, type: { name: 'uuid' } },
            { id: 'f-owner', tableId: 't-items', name: 'owner_id', category: 'APP', fieldOrder: 7, type: { name: 'uuid' } },
            { id: 'f-parent', tableId: 't-items', name: 'parent_id', category: 'APP', fieldOrder: 8, type: { name: 'uuid' } },
            { id: 'f-a', tableId: 't-items', name: 'a_id', category: 'APP', fieldOrder: 9, type: { name: 'uuid' } },
            { id: 'f-d', tableId: 't-items', name: 'd_id', category: 'APP', fieldOrder: 10, type: { name: 'uuid' } },
            { id: 'l-id', tableId: 't-lists', name: 'id', category: 'APP', fieldOrder: 1, type: { name: 'uuid' } },
          ],
        },
      },
      primaryKeyConstraint: {
        primaryKeyConstraints: {
          nodes: [
            { id: 'pk-items', tableId: 't-items', fieldIds: ['f-id'] },
            { id: 'pk-lists', tableId: 't-lists', fieldIds: ['l-id'] },
          ],
        },
      },
      uniqueConstraint: {
        uniqueConstraints: {
          nodes: [
            { id: 'u-code', tableId: 't-items', fieldIds: ['f-code'] },
            { id: 'u-pair', tableId: 't-items', fieldIds: ['f-name', 'f-list'] },
          ],
        },
      },
      checkConstraint: {
        checkConstraints: {
          nodes: [
            {
              id: 'c-size',
              tableId: 't-items',
              fieldIds: ['f-size'],
              expr: { expression: inList('size', { List: { items: [{ A_Const: { sval: { sval: 'small' } } }, { A_Const: { sval: { sval: 'large' } } }] } }) },
            },
          ],
        },
      },
      foreignKeyConstraint: {
        foreignKeyConstraints: {
          nodes: [
            { id: 'fk-list', tableId: 't-items', fieldIds: ['f-list'], refTableId: 't-lists', refFieldIds: ['l-id'], deleteAction: 'c', updateAction: 'a' },
            { id: 'fk-owner', tableId: 't-items', fieldIds: ['f-owner'], refTableId: 't-users', refFieldIds: ['u-id'], deleteAction: 'n', updateAction: 'a' },
            { id: 'fk-parent', tableId: 't-items', fieldIds: ['f-parent'], refTableId: 't-items', refFieldIds: ['f-id'], deleteAction: 'r', updateAction: 'a' },
            { id: 'fk-a', tableId: 't-items', fieldIds: ['f-a'], refTableId: 't-lists', refFieldIds: ['l-id'], deleteAction: 'a', updateAction: 'a' },
            { id: 'fk-d', tableId: 't-items', fieldIds: ['f-d'], refTableId: 't-lists', refFieldIds: ['l-id'], deleteAction: 'd', updateAction: 'c' },
          ],
        },
      },
      policy: {
        policies: {
          nodes: [
            ...['select', 'insert', 'update', 'delete'].map((privilege) => ({
              id: `p-items-${privilege}`, tableId: 't-items', policyType: 'AuthzAppMemberOwner', privilege,
              granteeName: 'authenticated', permissive: true, disabled: false, data: { owner_field: 'owner_id' },
            })),
            {
              id: 'p-items-ro', tableId: 't-items', policyType: 'AuthzNotReadOnly', privilege: 'update',
              granteeName: 'authenticated', permissive: false, disabled: false, data: {},
            },
            ...['select', 'insert', 'update', 'delete'].map((privilege) => ({
              id: `p-lists-${privilege}`, tableId: 't-lists', policyType: 'AuthzAppMembership', privilege,
              granteeName: 'authenticated', permissive: true, disabled: false, data: {},
            })),
          ],
        },
      },
      ...overrides,
    };
    const model = (name: string) => ({
      findMany: (args: Record<string, unknown>) => {
        calls.push({ model: name, args });
        return {
          execute: async () => {
            const where = args.where as { id?: { in?: string[] } } | undefined;
            // The second field read: the columns a foreign key points at outside the APP tables.
            if (name === 'field' && where?.id?.in) {
              return { ok: true, data: { fields: { nodes: [{ id: 'u-id', name: 'id' }] } }, errors: undefined };
            }
            const data = rows[name];
            return data && (data as { ok?: boolean }).ok === false
              ? data
              : { ok: true, data, errors: undefined };
          },
        };
      },
    });
    const api = Object.fromEntries(
      ['database', 'table', 'field', 'primaryKeyConstraint', 'uniqueConstraint', 'checkConstraint', 'foreignKeyConstraint', 'policy'].map(
        (name) => [name, model(name)],
      ),
    );
    return { api, calls };
  }

  const contextWith = (api: unknown) => ({ api, databaseId: 'db-1' }) as unknown as ProjectContext;

  it('reads the hash first, then only APP tables, resolving keys to tables outside them', async () => {
    const { api, calls } = fakeApi();

    const model = await readSchemaModel(contextWith(api));

    expect(calls[0].model).toBe('database');
    expect(model.hash).toBe('h1');
    expect(model.tables.map((t) => t.name)).toEqual(['items', 'lists']);
    const items = model.tables[0];
    expect(items.foreignKeys.find((fk) => fk.id === 'fk-owner')).toMatchObject({
      columns: ['owner_id'],
      targetTable: 'users',
      targetCategory: 'CORE',
      targetColumns: ['id'],
      onDelete: 'set_null',
    });
    expect(items.foreignKeys.map((fk) => fk.onDelete)).toEqual(['cascade', 'set_null', 'restrict', 'no_action', 'set_default']);
    expect(items.foreignKeys.find((fk) => fk.id === 'fk-d')?.onUpdate).toBe('cascade');
  });

  it('gives every field with its category, keys, defaults and allowed values', async () => {
    const { api } = fakeApi();

    const [items, lists] = (await readSchemaModel(contextWith(api))).tables;
    const column = (name: string) => items.columns.find((c) => c.name === name);

    expect(items.columns.map((c) => c.name)).toEqual([
      'id', 'name', 'status', 'size', 'code', 'list_id', 'owner_id', 'parent_id', 'a_id', 'd_id',
    ]);
    expect(column('id')).toMatchObject({ isPrimaryKey: true, isUnique: false, type: 'uuid', default: { kind: 'generated', fn: 'uuidv7' } });
    expect(column('status')).toMatchObject({
      category: 'MODULE',
      allowedValues: ['active', 'archived'],
      default: { kind: 'value', value: 'active' },
    });
    expect(column('size')).toMatchObject({ allowedValues: ['small', 'large'] });
    expect(column('code')).toMatchObject({ isUnique: true, type: 'citext' });
    expect(column('name')).toMatchObject({ isUnique: false, isRequired: true });
    expect(items.uniqueConstraints).toEqual([
      { id: 'u-code', columns: ['code'] },
      { id: 'u-pair', columns: ['name', 'list_id'] },
    ]);
    expect(items.access).toBe('private');
    expect(items.policies.map((p) => p.type)).not.toContain('AuthzNotReadOnly');
    expect(lists.access).toBe('shared');
  });

  it('throws instead of returning a partial model when one read fails', async () => {
    const { api } = fakeApi({
      policy: { ok: false, data: null, errors: [{ message: 'permission denied for table policy' }] },
    });

    const read = readSchemaModel(contextWith(api));

    await expect(read).rejects.toBeInstanceOf(SchemaReadError);
    await expect(read).rejects.toThrow(/policies: permission denied/);
  });
});
