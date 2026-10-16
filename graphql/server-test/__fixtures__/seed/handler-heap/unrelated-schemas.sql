-- Catalog bulk that no routed API exposes. A handler that introspects the whole
-- database retains all of it; a schema-scoped handler retains none of it.
-- COMMIT per schema: one transaction for all 100 overflows CI's lock table
-- (max_locks_per_transaction = 64).
DO $$
BEGIN
  FOR s IN 1..100 LOOP
    EXECUTE format('CREATE SCHEMA unrelated_%s', s);
    EXECUTE format(
      'CREATE TABLE unrelated_%1$s.root (id serial PRIMARY KEY, c0 text, c1 text, c2 text, c3 text)',
      s
    );
    FOR t IN 1..19 LOOP
      EXECUTE format(
        'CREATE TABLE unrelated_%1$s.t%2$s (id serial PRIMARY KEY, c0 text, c1 text, c2 text, c3 text, root_id int REFERENCES unrelated_%1$s.root (id))',
        s, t
      );
      EXECUTE format(
        'COMMENT ON TABLE unrelated_%1$s.t%2$s IS %3$L',
        s, t, format('table %s of unrelated schema %s', t, s)
      );
    END LOOP;
    FOR f IN 1..20 LOOP
      EXECUTE format(
        'CREATE FUNCTION unrelated_%1$s.fn%2$s(a int, b text) RETURNS int LANGUAGE sql STABLE AS %3$L',
        s, f, format('SELECT a + length(b) + %s', f)
      );
    END LOOP;
    COMMIT;
  END LOOP;
END
$$;
