import {
  FUNCTION_SOURCE_PARSE_ERROR,
  FUNCTION_SOURCE_UNSUPPORTED,
  parseFunctionSource
} from '../src';

const rejection = async (source: string) => {
  const err = await parseFunctionSource(source).then(
    () => {
      throw new Error('expected the source to be rejected');
    },
    (e) => e
  );
  return { message: err.message, extensions: err.extensions };
};

describe('parseFunctionSource', () => {
  it('maps a PL/pgSQL function onto the function columns, datums intact', async () => {
    const definition = await parseFunctionSource(`
      CREATE FUNCTION visible_total(min_amount numeric, VARIADIC tags text[])
        RETURNS SETOF numeric
        LANGUAGE plpgsql STABLE STRICT
        AS $$
      BEGIN
        RETURN QUERY SELECT sum(o.amount) FROM app_public.orders o WHERE o.amount >= min_amount;
      END;
      $$;
    `);
    expect(definition).toMatchObject({
      name: 'visible_total',
      kind: 'plpgsql',
      arguments: [
        { name: 'min_amount', type: { name: 'numeric' } },
        { name: 'tags', type: { name: 'text', array_dimensions: 1 }, mode: 'variadic' }
      ],
      returns: { type: { name: 'numeric' }, setof: true },
      volatility: 'STABLE',
      is_strict: true,
      security_invoker: true
    });
    const datums = definition.body_ast.PLpgSQL_function.datums.map(
      (d: any) => d.PLpgSQL_var.refname
    );
    expect(datums).toEqual(['min_amount', 'tags', 'found']);
  });

  it('maps a SQL function, its body parsed into statements', async () => {
    const definition = await parseFunctionSource(`
      CREATE FUNCTION order_ids()
        RETURNS TABLE (id uuid, amount numeric(10, 2))
        LANGUAGE sql
        AS $$ SELECT o.id, o.amount FROM app_public.orders o $$
    `);
    expect(definition).toMatchObject({
      name: 'order_ids',
      kind: 'sql',
      arguments: [],
      returns: {
        table: [
          { name: 'id', type: { name: 'uuid' } },
          { name: 'amount', type: { name: 'numeric', args: [10, 2] } }
        ]
      },
      volatility: 'VOLATILE',
      is_strict: false
    });
    expect(definition.body_ast.stmts).toHaveLength(1);
    expect(definition.body_ast.stmts[0].stmt.SelectStmt).toBeDefined();
  });

  it('maps RETURNS trigger to the trigger kind', async () => {
    const definition = await parseFunctionSource(`
      CREATE FUNCTION touch() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        NEW.updated_at := now();
        RETURN NEW;
      END;
      $$
    `);
    expect(definition.kind).toBe('trigger');
    expect(definition.returns).toEqual({ type: { name: 'trigger' } });
  });

  it('passes SECURITY DEFINER through for the database to refuse', async () => {
    const definition = await parseFunctionSource(
      'CREATE FUNCTION f() RETURNS int LANGUAGE sql SECURITY DEFINER AS $$ SELECT 1 $$'
    );
    expect(definition.security_invoker).toBe(false);
  });

  it('reports a statement syntax error with the parser position', async () => {
    const source = 'CREATE FUNCTION f( RETURNS int LANGUAGE sql AS $$ SELECT 1 $$';
    expect(await rejection(source)).toEqual({
      message: 'syntax error at or near "LANGUAGE"',
      extensions: { code: FUNCTION_SOURCE_PARSE_ERROR, position: source.indexOf('LANGUAGE') }
    });
  });

  it('reports a SQL body syntax error at its position in the source', async () => {
    const source = 'CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELEC 1 $$';
    expect(await rejection(source)).toEqual({
      message: 'syntax error at or near "SELEC"',
      extensions: { code: FUNCTION_SOURCE_PARSE_ERROR, position: source.indexOf('SELEC') }
    });
  });

  it('reports a PL/pgSQL body syntax error', async () => {
    expect(
      await rejection(`CREATE FUNCTION f() RETURNS int LANGUAGE plpgsql AS $$
        BEGIN
          RETRN 1;
        END
      $$`)
    ).toEqual({
      message: 'syntax error at or near "RETRN"',
      extensions: { code: FUNCTION_SOURCE_PARSE_ERROR }
    });
  });

  it.each([
    ['two statements', 'CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELECT 1 $$; SELECT 1'],
    ['a non-function statement', 'SELECT 1'],
    ['a qualified name', 'CREATE FUNCTION app_public.f() RETURNS int LANGUAGE sql AS $$ SELECT 1 $$'],
    ['OR REPLACE', 'CREATE OR REPLACE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELECT 1 $$'],
    ['an argument default', 'CREATE FUNCTION f(a int DEFAULT 1) RETURNS int LANGUAGE sql AS $$ SELECT a $$'],
    ['an option the columns cannot carry', 'CREATE FUNCTION f() RETURNS int LANGUAGE sql COST 5 AS $$ SELECT 1 $$'],
    ['another language', "CREATE FUNCTION f() RETURNS int LANGUAGE c AS 'lib', 'sym'"]
  ])('refuses %s instead of dropping it', async (_label, source) => {
    const { extensions } = await rejection(source);
    expect(extensions.code).toBe(FUNCTION_SOURCE_UNSUPPORTED);
  });
});
