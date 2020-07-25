DROP SCHEMA IF EXISTS my_test_schema CASCADE;

CREATE SCHEMA IF NOT EXISTS my_test_schema;

CREATE FUNCTION my_test_schema.json_build_object_apply (arguments text[])
    RETURNS json
    AS $$
DECLARE
    arg text;
    _sql text;
    _res json;
    args text[];
BEGIN
    _sql = 'SELECT json_build_object(';
    FOR arg IN
    SELECT
        unnest(arguments)
        LOOP
            args = array_append(args, format('''%s''', arg));
        END LOOP;
    _sql = _sql || format('%s);', array_to_string(args, ','));
    EXECUTE _sql INTO _res;
    RETURN _res;
END;
$$
LANGUAGE 'plpgsql';

CREATE TABLE my_test_schema.my_table (
    id serial PRIMARY KEY,
    name text NOT NULL,
    val numeric DEFAULT 0
);

CREATE FUNCTION my_test_schema.tg_add_job_with_fields ()
    RETURNS TRIGGER
    AS $$
DECLARE
    arg text;
    fn text;
    i int;
    args text[];
BEGIN
    FOR i IN
    SELECT
        *
    FROM
        generate_series(1, TG_NARGS) g (i)
        LOOP
            IF (i = 1) THEN
                fn = TG_ARGV[i - 1];
            ELSE
                args = array_append(args, TG_ARGV[i - 1]);
                EXECUTE format('SELECT ($1).%s::text', TG_ARGV[i - 1])
                USING NEW INTO arg;
                args = array_append(args, arg);
            END IF;
        END LOOP;
    PERFORM
        app_jobs.add_job (fn, my_test_schema.json_build_object_apply (args));
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER my_trigger
    AFTER INSERT ON my_test_schema.my_table
    FOR EACH ROW
    EXECUTE PROCEDURE my_test_schema.tg_add_job_with_fields ('example-fn', 'id', 'name', 'val');

INSERT INTO my_test_schema.my_table (name, val)
    VALUES ('name1', 0), ('name2', 1), ('name3', 2);

