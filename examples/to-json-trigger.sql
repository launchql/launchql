DROP SCHEMA IF EXISTS my_test_schema CASCADE;

CREATE SCHEMA IF NOT EXISTS my_test_schema;

CREATE TABLE my_test_schema.my_table (
    id serial PRIMARY KEY,
    name text NOT NULL,
    val numeric DEFAULT 0
);

CREATE FUNCTION my_test_schema.tg_add_job_with_row ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM
            app_jobs.add_job (TG_ARGV[0], to_json(NEW));
        RETURN NEW;
    END IF;
    IF (TG_OP = 'DELETE') THEN
        PERFORM
            app_jobs.add_job (TG_ARGV[0], to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$
LANGUAGE plpgsql
VOLATILE;

CREATE TRIGGER my_trigger
    AFTER INSERT ON my_test_schema.my_table
    FOR EACH ROW
    EXECUTE PROCEDURE my_test_schema.tg_add_job_with_row ('example-fn');

INSERT INTO my_test_schema.my_table (name, val)
    VALUES ('name1', 0), ('name2', 1), ('name3', 2);

