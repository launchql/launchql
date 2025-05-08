-- Deploy schemas/faker/procedures/utils to pg

-- requires: schemas/faker/schema
-- requires: schemas/faker/tables/dictionary/table

BEGIN;


CREATE FUNCTION faker.word_type() returns text as $$
SELECT (CASE (RANDOM() * 2)::INT
      WHEN 0 THEN 'adjectives'
      WHEN 1 THEN 'colors'
      WHEN 2 THEN 'animals'
    END);
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.word(wordtype text default null) returns text as $$
DECLARE
  vword text;
  vtype text;
BEGIN
  IF (wordtype IS NOT NULL) THEN 
    vtype = wordtype;
  ELSE
    vtype = faker.word_type();
  END IF;

SELECT word FROM faker.dictionary 
WHERE type = vtype
OFFSET floor( random() * (select count(*) from faker.dictionary WHERE type = vtype ) ) LIMIT 1
INTO vword;

RETURN vword;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.word(wordtypes text[]) returns text as $$
BEGIN
  RETURN faker.word(wordtypes[faker.integer(1, cardinality(wordtypes))]::text);
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.gender(gender text default null) returns text as $$
DECLARE
BEGIN
  IF (gender IS NOT NULL) THEN 
    RETURN gender;
  END IF;
  RETURN (CASE (RANDOM() * 1)::INT
      WHEN 0 THEN 'M'
      WHEN 1 THEN 'F'
    END);
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.username() returns text as $$
DECLARE
BEGIN
   RETURN (CASE (RANDOM() * 2)::INT
      WHEN 0 THEN faker.word() || (RANDOM() * 100)::INT
      WHEN 1 THEN faker.word() || '.' || faker.word() || (RANDOM() * 100)::INT
      WHEN 2 THEN faker.word()
    END);
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.name(gender text default null) returns text as $$
DECLARE

BEGIN
  IF (gender IS NULL) THEN
    gender = faker.gender();
  END IF;

  IF (gender = 'M') THEN 
    RETURN initcap(faker.word('boys'));
  ELSE
    RETURN initcap(faker.word('girls'));
  END IF;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.surname() returns text as $$
BEGIN
    RETURN initcap(faker.word('surname'));
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.fullname(gender text default null) returns text as $$
BEGIN
    RETURN initcap(faker.name(gender)) || ' ' ||  initcap(faker.word('surname'));
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.business() returns text as $$
BEGIN
    RETURN (CASE (RANDOM() * 4)::INT
      WHEN 0 THEN array_to_string( ARRAY[faker.word('bizname'), faker.word('bizsurname') || ',', faker.word('bizsuffix')]::text[], ' ')
      WHEN 1 THEN array_to_string( ARRAY[faker.word('bizname'), faker.word('bizsurname')]::text[], ' ')
      WHEN 2 THEN array_to_string( ARRAY[faker.word('bizname'), faker.word('bizsurname')]::text[], ' ')
      WHEN 3 THEN array_to_string( ARRAY[faker.word('bizname') || faker.word('bizpostfix'), faker.word('bizsurname') ]::text[], ' ')
      WHEN 4 THEN array_to_string( ARRAY[faker.word('bizname') || faker.word('bizpostfix'), faker.word('bizsurname') || ',', faker.word('bizsuffix')]::text[], ' ')
    END);
END;
$$
LANGUAGE 'plpgsql' VOLATILE;


CREATE FUNCTION faker.city(state text default null) returns text as $$
DECLARE
  vcity text;
BEGIN

IF (state IS NOT NULL) THEN 

  SELECT city FROM faker.cities 
  WHERE cities.state = city.state
  OFFSET floor( random() * (select count(*) from faker.cities WHERE cities.state = city.state ) ) LIMIT 1
  INTO vcity;

ELSE

  SELECT city FROM faker.cities 
  OFFSET floor( random() * (select count(*) from faker.cities ) ) LIMIT 1
  INTO vcity;

END IF;


RETURN vcity;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.zip(city text default null) returns int as $$
DECLARE
  vzips int[];
BEGIN

IF (city IS NOT NULL) THEN 

  SELECT zips FROM faker.cities 
  WHERE cities.city = zip.city
  OFFSET floor( random() * (select count(*) from faker.cities WHERE cities.city = zip.city ) ) LIMIT 1
  INTO vzips;

ELSE

  SELECT zips FROM faker.cities
  OFFSET floor( random() * (select count(*) from faker.cities ) ) LIMIT 1
  INTO vzips;

END IF;


RETURN vzips[ faker.integer(1, cardinality(vzips)) ];

END;
$$
LANGUAGE 'plpgsql' VOLATILE;


CREATE FUNCTION faker.lnglat(x1 float, y1 float, x2 float, y2 float) returns point as $$
DECLARE
  vlat float;
  vlng float;
BEGIN

RETURN Point(
  faker.float(least(x1, x2), greatest(x1, x2)),
  faker.float(least(y1, y2), greatest(y1, y2))
);

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.lnglat(city text default null) returns point as $$
DECLARE
  vlat float;
  vlng float;
BEGIN

IF (city IS NOT NULL) THEN 
  SELECT lat, lng FROM faker.cities 
  WHERE cities.city = lnglat.city
  OFFSET floor( random() * (select count(*) from faker.cities WHERE cities.city = lnglat.city ) ) LIMIT 1
  INTO vlat, vlng;
ELSE
  SELECT lat, lng FROM faker.cities 
  OFFSET floor( random() * (select count(*) from faker.cities ) ) LIMIT 1
  INTO vlat, vlng;
END IF;

RETURN Point(vlng, vlat);

END;
$$
LANGUAGE 'plpgsql' VOLATILE;



CREATE FUNCTION faker.phone() returns text as $$
BEGIN

  RETURN concat('+1 ', 

    '(',

    array_to_string(ARRAY[
      faker.integer(0,9),
      faker.integer(0,9),
      faker.integer(0,9)
    ]::text[], ''),
    
    ') ',

    array_to_string(ARRAY[
      faker.integer(0,9),
      faker.integer(0,9),
      faker.integer(0,9)
    ]::text[], ''),
    
    '-',

    array_to_string(ARRAY[
      faker.integer(0,9),
      faker.integer(0,9),
      faker.integer(0,9),
      faker.integer(0,9)
    ]::text[], '')

  );

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.street() returns text as $$
BEGIN
  RETURN faker.word('street');
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.state(state text default null) returns text as $$
DECLARE
  vstate text;
BEGIN

IF (state IS NULL) THEN 
  SELECT distinct(c.state) FROM faker.cities c
  OFFSET floor( random() * (select count(distinct(c2.state)) from faker.cities c2 ) ) LIMIT 1
  INTO vstate;
ELSE
  vstate = state;
END IF;

RETURN vstate;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.address(state text default null, city text default null) returns text as $$
DECLARE
  vcity text;
  vstate text;
  vstreet text;
  vstreetnum int;
  vzips int[];
  vzip int;
BEGIN

IF (state IS NULL) THEN 
  vstate = faker.state();
ELSE
  vstate = state;
END IF;

SELECT c.city, c.zips FROM faker.cities c
WHERE c.state = vstate
OFFSET floor( random() * (select count(*) from faker.cities WHERE cities.state = vstate ) ) LIMIT 1
INTO vcity, vzips;

vstreetnum = faker.integer(1, 3000);
vstreet = faker.street();
vzip = vzips[ faker.integer(1, cardinality(vzips)) ];

RETURN concat(vstreetnum::text,  ' ',  vstreet,  E'\n',  vcity,  ', ',   vstate,  ' ',   vzip::text);

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.tags(min int default 1, max int default 5, dict text default 'tag') returns citext[] as $$
DECLARE
  words text[];
  lim int = faker.integer(min,max);
BEGIN

SELECT ARRAY (
  SELECT word FROM faker.dictionary
  WHERE type = dict
  OFFSET floor( random() * (select count(*) from faker.dictionary WHERE type = dict ) ) LIMIT lim
) INTO words;

RETURN words::citext[];
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.sentence(unit text default 'word', min int default 7, max int default 20, cat text[] default ARRAY['lorem']::text[], period text default '.') returns text as $$
DECLARE
  num int = faker.integer(min, max);
  txt text;
  vtype text;
  n int;
  c int;
BEGIN

  IF (unit = 'word') THEN
    txt = initcap(faker.word(cat));
    FOR n IN 
    SELECT * FROM generate_series(1, num) g(n)
    LOOP 
      txt = txt || ' ' || faker.word(cat);
    END LOOP;
    RETURN txt || period;
  ELSEIF (unit = 'char' OR unit = 'chars') THEN 
    txt = initcap(faker.word(cat));
    c = char_length(txt);
    IF (c = num) THEN 
      RETURN concat(txt, period);
    END IF;
    IF (c > num) THEN 
      RETURN substring(txt from 1 for num) || period;
    END IF;
    WHILE (c < num)
    LOOP 
      txt = txt || ' ' || faker.word(cat);
      c = char_length(txt);
    END LOOP;
    IF (c = num) THEN 
      RETURN txt || period;
    END IF;
    IF (c > num) THEN 
      RETURN substring(txt from 1 for num) || period;
    END IF;
    RETURN txt || period;
  END IF;
  RAISE EXCEPTION 'faker.sentence() bad input';
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.paragraph(unit text default 'word', min int default 7, max int default 20, cat text[] default ARRAY['lorem']::text[]) returns text as $$
DECLARE
  num int = faker.integer(min, max);
  txt text;
  words text[];
  n int;
  needscaps boolean = false;
BEGIN
  txt = faker.sentence(unit, min, max, cat, '');
  words = string_to_array(txt, ' ');
  txt = '';

  FOR n IN
  SELECT * FROM generate_series(1, cardinality(words)) g(n)
  LOOP 
      IF (needscaps IS TRUE) THEN
        txt = concat(txt, ' ', initcap(words[n]));
      ELSE
        txt = concat(txt, ' ', words[n]);
      END IF;

      IF (faker.integer(1,100) > 70) THEN 
        txt = txt || '.';
        needscaps = true;
      ELSE
        needscaps = false;
      END IF;

  END LOOP;

  IF (trim(txt) ~ '\.$') THEN 
    RETURN trim(txt);
  ELSE
    RETURN trim(txt || '.');
  END IF;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.email() returns text as $$
SELECT
  faker.word() || (RANDOM() * 100)::INT || '@' || (
    CASE (RANDOM() * 3)::INT
      WHEN 0 THEN 'gmail'
      WHEN 1 THEN 'hotmail'
      WHEN 2 THEN 'yahoo'
      WHEN 3 THEN faker.word()
    END
  ) || '.com' AS email
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.uuid() returns uuid as $$
SELECT
  uuid_generate_v4();
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.token(bytes int default 16) returns text as $$
SELECT
  encode( gen_random_bytes( bytes ), 'hex' )
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.password() returns text as $$
DECLARE
  chars text[] =  regexp_split_to_array('!@#$%^&*():";''<>?,./~`'::text, '');
  num_special int = faker.integer(0, 4);
  n int = 0;
  pass text;
BEGIN

  IF (num_special = 0) THEN
    pass = encode( gen_random_bytes( 16 ), 'hex' );
  ELSE
    pass = encode( gen_random_bytes( 4 ), 'hex' );
    FOR n IN
    SELECT * FROM generate_series(1, num_special) g(n)
    LOOP
      pass = pass ||
      encode( gen_random_bytes( faker.integer(1,4) ), 'hex' ) ||
      chars[ faker.integer(1, cardinality(chars)) ] ||
      encode( gen_random_bytes( faker.integer(1,4) ), 'hex' );

    END LOOP;
  END IF;


  RETURN pass;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.hostname() returns text as $$
SELECT
  faker.word() || '.' || (
    CASE (RANDOM() * 4)::INT
      WHEN 0 THEN 'com'
      WHEN 1 THEN 'net'
      WHEN 2 THEN 'io'
      WHEN 3 THEN 'org'
      WHEN 4 THEN 'co'
    END
  )
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.time_unit() returns text as $$
SELECT
  (
    CASE (RANDOM() * 5)::INT
      WHEN 0 THEN 'millisecond'
      WHEN 1 THEN 'second'
      WHEN 2 THEN 'minute'
      WHEN 3 THEN 'hour'
      WHEN 4 THEN 'day'
      WHEN 5 THEN 'week'
    END
  )
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.float(min float default 0, max float default 100) returns float as $$
DECLARE
  num float;
  high float;
  low float;
BEGIN
  high = greatest(min, max);
  low = least(min, max);
  num = (RANDOM() * ( high - low )) + low;
  RETURN num;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.integer(min int default 0, max int default 100) returns int as $$
DECLARE
  num int;
BEGIN
  min = ceil(min);
  max = floor(max);
  num = floor(RANDOM() * ( max - min + 1 )) + min;
  RETURN num;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.date(min int default 1, max int default 100, future boolean default false) returns date as $$
DECLARE
  d date;
  num int = faker.integer(min, max);
BEGIN
IF (future) THEN 
  d = now()::date + num;
ELSE
  d = now()::date - num;
END IF;
RETURN d;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.birthdate(min int default 1, max int default 100) returns date as $$
DECLARE
  d date;
  years int = faker.integer(min, max);
  days int = faker.integer(1, 365);
  itv interval;
BEGIN
  itv = concat(years, ' years')::interval + concat(days, ' days')::interval;
  d = now()::date - itv;
  RETURN d;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.interval() returns interval as $$
DECLARE
  ival text;
BEGIN
  SELECT faker.time_unit() INTO ival;
  ival = (RANDOM() * 100)::text || ' ' || ival;
  RETURN ival::interval;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;


CREATE FUNCTION faker.interval(min int, max int) returns interval as $$
SELECT (faker.integer(min, max)::text || ' ' || 'seconds')::interval;
$$
LANGUAGE 'sql' VOLATILE;

CREATE FUNCTION faker.boolean() returns boolean as $$
BEGIN
  RETURN (
    CASE (RANDOM() * 1)::INT
      WHEN 0 THEN TRUE
      WHEN 1 THEN FALSE
    END
  );
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.timestamptz(future boolean default false) returns timestamptz as $$
DECLARE
  ival interval;
  t timestamptz;
BEGIN
  ival = faker.interval();
  IF (future) THEN
    SELECT now() + ival INTO t;
  ELSE
    SELECT now() - ival INTO t;
  END IF;
  RETURN t;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.mime() returns text as $$
  SELECT faker.word('mime');
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.ext(mime text default faker.mime()) returns text as $$
DECLARE 
  ext text;
BEGIN
  IF (mime IS NULL) THEN 
    ext = faker.word(faker.mime());
  ELSE
    ext = faker.word(mime);
  END IF;
  RETURN ext;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;


CREATE FUNCTION faker.image_mime() returns text as $$
SELECT
  (
    CASE (RANDOM() * 3)::INT
      WHEN 0 THEN 'image/svg+xml'
      WHEN 1 THEN 'image/png'
      WHEN 2 THEN 'image/gif'
      WHEN 3 THEN 'image/jpeg'
    END
  )
$$
LANGUAGE 'sql';

CREATE FUNCTION faker.image(width int default null, height int default null) returns image as $$
DECLARE
  w int;
  h int;
  obj jsonb = '{}'::jsonb;
  url text;
BEGIN
  IF (width IS NULL) THEN 
    w = faker.integer(800,1200);
  ELSE
    w = width;
  END IF;
  IF (height IS NULL) THEN 
    h = faker.integer(800,1200);
  ELSE
    h = height;
  END IF;

  url = concat('https://picsum.photos/', w::text, '/', h::text);

  obj = jsonb_set(obj, '{url}', to_jsonb(url));
  obj = jsonb_set(obj, '{mime}', to_jsonb(faker.image_mime()));

  RETURN obj;

END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.profilepic() returns image as $$
DECLARE
  obj jsonb = '{}'::jsonb;
  vurl text = '';
  gndr text = 'women';
BEGIN
  IF ((RANDOM() * 2)::INT = 0) THEN 
    gndr = 'men';
  END IF;
  vurl = concat('https://randomuser.me/api/portraits/', gndr, '/', faker.integer(1, 99) , '.jpg');
  obj = jsonb_set(obj, '{url}', to_jsonb(vurl::text));
  obj = jsonb_set(obj, '{mime}', to_jsonb('image/jpeg'::text));
  RETURN obj;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.profilepic(gender text) returns image as $$
DECLARE
  obj jsonb = '{}'::jsonb;
  vurl text = '';
  gndr text = 'women';
BEGIN
  IF (gender = 'M') THEN 
    gndr = 'men';
  END IF;
  vurl = concat('https://randomuser.me/api/portraits/', gndr, '/', faker.integer(1, 99) , '.jpg');
  obj = jsonb_set(obj, '{url}', to_jsonb(vurl::text));
  obj = jsonb_set(obj, '{mime}', to_jsonb('image/jpeg'::text));
  RETURN obj;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.file(mime text default null) returns text as $$
BEGIN
  RETURN concat(faker.word(), '.', faker.ext(mime));
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.url(mime text default null) returns url as $$
DECLARE
  obj jsonb = '{}'::jsonb;
  url text;
BEGIN
  url = concat('https://', faker.hostname(), '/', faker.file(mime));
  RETURN url;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.upload(mime text default null) returns upload as $$
BEGIN
  RETURN faker.url(mime);
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.ip(mime text default null) returns text as $$
BEGIN
  RETURN 
    array_to_string(ARRAY[
      faker.integer(0,255),
      faker.integer(0,255),
      faker.integer(0,255),
      faker.integer(0,255)
    ]::text[], '.');
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

CREATE FUNCTION faker.attachment(mime text default null) returns attachment as $$
DECLARE
  obj jsonb = '{}'::jsonb;
BEGIN
  IF (mime IS NULL) THEN
    mime = faker.mime();
  END IF;
  obj = jsonb_set(obj, '{url}', to_jsonb(faker.url(mime)::text));
  obj = jsonb_set(obj, '{mime}', to_jsonb(mime));
  RETURN obj;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

COMMIT;
