DROP SCHEMA IF EXISTS my_test_schema CASCADE;

CREATE SCHEMA IF NOT EXISTS my_test_schema;

CREATE TABLE my_test_schema.my_table (
    id serial PRIMARY KEY,
    name text NOT NULL,
    val numeric DEFAULT 0
);

CREATE FUNCTION my_test_schema.tg_add_job_with_row_id ()
    RETURNS TRIGGER
    AS $$
BEGIN
    PERFORM
        app_jobs.add_job (TG_ARGV[0], json_build_object('id', NEW.id));
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER my_trigger
    AFTER INSERT ON my_test_schema.my_table
    FOR EACH ROW
    EXECUTE PROCEDURE my_test_schema.tg_add_job_with_row_id ('example-fn');

INSERT INTO my_test_schema.my_table (name, val)
    VALUES ('name1', 0), ('name2', 1), ('name3', 2);

