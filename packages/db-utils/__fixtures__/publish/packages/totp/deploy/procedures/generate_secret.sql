-- Deploy procedures/generate_secret to pg


BEGIN;

CREATE FUNCTION generate_secret(
  len int default 32,
  symbols boolean default false
) RETURNS text
AS $$
DECLARE
  v_set text;

  v_bytea bytea;
  v_output text;

  x int;
  y int;
  b_index int;
BEGIN
  v_set = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  v_output = '';
  v_bytea = gen_random_bytes(len);

  IF (symbols IS NOT NULL) THEN
    v_set = v_set || '!@#$%^&*()<>?/[]{},.:;';
  END IF;

  FOR x IN 0 .. len-1 LOOP
    y := get_byte(v_bytea, x);
    b_index := floor(y/255.0 * (length(v_set)-1));
	  v_output := v_output || substring(v_set from b_index for 1);
  END LOOP;

  RETURN v_output;
END;
$$
LANGUAGE 'plpgsql' STABLE;
COMMIT;
