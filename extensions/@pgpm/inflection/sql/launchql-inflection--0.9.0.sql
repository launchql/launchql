\echo Use "CREATE EXTENSION launchql-inflection" to load this file. \quit
CREATE SCHEMA inflection;

GRANT USAGE ON SCHEMA inflection TO PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA inflection
  GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

CREATE FUNCTION inflection.no_consecutive_caps_till_end(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'([A-Z])([A-Z]+$)', 'g')
      LOOP
        temp = result[1] || lower(result[2]);
        str = replace(str, result[1] || result[2], temp);
      END LOOP;
  return str;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.no_consecutive_caps_till_lower(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'([A-Z])([A-Z]+)[A-Z][a-z]', 'g')
      LOOP
        temp = result[1] || lower(result[2]);
        str = replace(str, result[1] || result[2], temp);
      END LOOP;

  return str;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.no_consecutive_caps(str text) RETURNS text AS $EOFCODE$
  select inflection.no_consecutive_caps_till_lower(inflection.no_consecutive_caps_till_end(str));
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION inflection.pg_slugify(value text, allow_unicode boolean) RETURNS text AS $EOFCODE$
  WITH normalized AS (
    SELECT
      CASE WHEN allow_unicode THEN
        value
      ELSE
        unaccent (value)
      END AS value
),
no_consecutive_caps AS (
  SELECT
    inflection.no_consecutive_caps (value) AS value
FROM
  normalized
),
remove_chars AS (
  SELECT
    regexp_replace(value, E'[^\\w\\s-]', '', 'gi') AS value
FROM
  no_consecutive_caps
),
trimmed AS (
  SELECT
    trim(value) AS value
FROM
  remove_chars
),
hyphenated AS (
  SELECT
    regexp_replace(value, E'[-\\s]+', '-', 'gi') AS value
FROM
  trimmed
),
underscored AS (
  SELECT
    regexp_replace(value, E'[-]+', '_', 'gi') AS value
FROM
  hyphenated
),
removedups AS (
  SELECT
    regexp_replace(value, E'[_]+', '_', 'gi') AS value
FROM
  underscored
)
SELECT
  value
FROM
  removedups;
$EOFCODE$ LANGUAGE sql STRICT IMMUTABLE;

CREATE FUNCTION inflection.pg_slugify(text) RETURNS text AS $EOFCODE$SELECT inflection.pg_slugify($1, false)$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION inflection.no_single_underscores_in_beginning(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(^[a-z])(_)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[1]);
      END LOOP;
  return str;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.no_single_underscores_at_end(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(_)([a-z]$)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[2]);
      END LOOP;

  return str;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.no_single_underscores_in_middle(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
  temp text;
BEGIN
    FOR result IN
    SELECT regexp_matches(str, E'(_)([a-z]_)', 'g')
      LOOP
        str = replace(str, result[1] || result[2], result[2]);
      END LOOP;

  return str;
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.no_single_underscores(str text) RETURNS text AS $EOFCODE$
  select 
    inflection.no_single_underscores_in_middle(inflection.no_single_underscores_at_end(inflection.no_single_underscores_in_beginning(str)));
$EOFCODE$ LANGUAGE sql STABLE;

CREATE FUNCTION inflection.underscore(str text) RETURNS text AS $EOFCODE$
  WITH slugged AS (
    SELECT
      inflection.pg_slugify(str) AS value
),
convertedupper AS (
  SELECT
    lower(regexp_replace(value, E'([A-Z])', E'\_\\1', 'g')) AS value
  FROM
    slugged
),
noprefix AS (
  SELECT
    regexp_replace(value, E'^_', '', 'g') AS value
  FROM
    convertedupper
),
removedups AS (
  SELECT
    regexp_replace(value, E'[_]+', '_', 'gi') AS value
FROM
  noprefix
),
stripedges AS (
  SELECT
    regexp_replace(regexp_replace(value, E'([A-Z])_$', E'\\1', 'gi'), E'^_([A-Z])', E'\\1', 'gi') AS value
FROM
  removedups
),
nosingles AS (
  SELECT
    inflection.no_single_underscores(value) AS value
FROM
  stripedges
)
SELECT
  value
FROM
  nosingles;
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION inflection.camel(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
BEGIN
    str = inflection.underscore(str);
    FOR result IN
    SELECT regexp_matches(str,  E'(_[a-zA-Z0-9])', 'g')
      LOOP
        str = replace(str, result[1], upper(result[1]));
      END LOOP;
  return regexp_replace(substring(str FROM 1 FOR 1) || substring(str FROM 2 FOR length(str)), E'[_]+', '', 'gi');
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE FUNCTION inflection.dashed(str text) RETURNS text AS $EOFCODE$
  WITH underscored AS (
    SELECT
      inflection.underscore(str) AS value
),
dashes AS (
  SELECT
    regexp_replace(value, '_', '-', 'gi') AS value
  FROM
    underscored
)
SELECT
  value
FROM
  dashes;
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION inflection.pascal(str text) RETURNS text AS $EOFCODE$
DECLARE
  result text[];
BEGIN
    str = inflection.camel(str);
  return upper(substring(str FROM 1 FOR 1)) || substring(str FROM 2 FOR length(str));
END;
$EOFCODE$ LANGUAGE plpgsql STABLE;

CREATE TABLE inflection.inflection_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text,
  test text,
  replacement text
);

GRANT SELECT ON inflection.inflection_rules TO PUBLIC;

CREATE FUNCTION inflection.plural(str text) RETURNS text AS $EOFCODE$
DECLARE
  result record;
  matches text[];
BEGIN
    FOR result IN
    SELECT * FROM inflection.inflection_rules where type='plural'
      LOOP
        matches = regexp_matches(str, result.test, 'gi');
        IF (array_length(matches, 1) > 0) THEN
           IF (result.replacement IS NULL) THEN
				return str;        
           END IF;
           str = regexp_replace(str, result.test, result.replacement, 'gi');
           return str;
        END IF;
      END LOOP;
  return str;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION inflection.uncountable_words() RETURNS text[] AS $EOFCODE$
select ARRAY[ 'accommodation', 'adulthood', 'advertising', 'advice', 'aggression', 'aid', 'air', 'aircraft', 'alcohol', 'anger', 'applause', 'arithmetic', 'assistance', 'athletics', 'bacon', 'baggage', 'beef', 'biology', 'blood', 'botany', 'bread', 'butter', 'carbon', 'cardboard', 'cash', 'chalk', 'chaos', 'chess', 'crossroads', 'countryside', 'dancing', 'deer', 'dignity', 'dirt', 'dust', 'economics', 'education', 'electricity', 'engineering', 'enjoyment', 'envy', 'equipment', 'ethics', 'evidence', 'evolution', 'fame', 'fiction', 'flour', 'flu', 'food', 'fuel', 'fun', 'furniture', 'gallows', 'garbage', 'garlic', 'genetics', 'gold', 'golf', 'gossip', 'grammar', 'gratitude', 'grief', 'guilt', 'gymnastics', 'happiness', 'hardware', 'harm', 'hate', 'hatred', 'health', 'heat', 'help', 'homework', 'honesty', 'honey', 'hospitality', 'housework', 'humour', 'hunger', 'hydrogen', 'ice', 'importance', 'inflation', 'information', 'innocence', 'iron', 'irony', 'jam', 'jewelry', 'judo', 'karate', 'knowledge', 'lack', 'laughter', 'lava', 'leather', 'leisure', 'lightning', 'linguine', 'linguini', 'linguistics', 'literature', 'litter', 'livestock', 'logic', 'loneliness', 'luck', 'luggage', 'macaroni', 'machinery', 'magic', 'management', 'mankind', 'marble', 'mathematics', 'mayonnaise', 'measles', 'methane', 'milk', 'minus', 'money', 'mud', 'music', 'mumps', 'nature', 'news', 'nitrogen', 'nonsense', 'nurture', 'nutrition', 'obedience', 'obesity', 'oxygen', 'pasta', 'patience', 'physics', 'poetry', 'pollution', 'poverty', 'pride', 'psychology', 'publicity', 'punctuation', 'quartz', 'racism', 'relaxation', 'reliability', 'research', 'respect', 'revenge', 'rice', 'rubbish', 'rum', 'safety', 'scenery', 'seafood', 'seaside', 'series', 'shame', 'sheep', 'shopping', 'sleep', 'smoke', 'smoking', 'snow', 'soap', 'software', 'soil', 'spaghetti', 'species', 'steam', 'stuff', 'stupidity', 'sunshine', 'symmetry', 'tennis', 'thirst', 'thunder', 'timber', 'traffic', 'transportation', 'trust', 'underwear', 'unemployment', 'unity', 'validity', 'veal', 'vegetation', 'vegetarianism', 'vengeance', 'violence', 'vitality', 'warmth', 'wealth', 'weather', 'welfare', 'wheat', 'wildlife', 'wisdom', 'yoga', 'zinc', 'zoology' ];
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION inflection.should_skip_uncountable(str text) RETURNS boolean AS $EOFCODE$
  SELECT
    str = ANY (inflection.uncountable_words ());
$EOFCODE$ LANGUAGE sql IMMUTABLE;

CREATE FUNCTION inflection.singular(str text) RETURNS text AS $EOFCODE$
DECLARE
  result record;
  matches text[];
BEGIN
    FOR result IN
    SELECT * FROM inflection.inflection_rules where type='singular'
      LOOP
        matches = regexp_matches(str, result.test, 'gi');
        IF (array_length(matches, 1) > 0) THEN
           IF (result.replacement IS NULL) THEN
				return str;        
           END IF;
           str = regexp_replace(str, result.test, result.replacement, 'gi');
           return str;
        END IF;
      END LOOP;
  return str;
END;
$EOFCODE$ LANGUAGE plpgsql IMMUTABLE;

CREATE FUNCTION inflection.slugify(value text, allow_unicode boolean) RETURNS text AS $EOFCODE$
  WITH normalized AS (
    SELECT
      CASE WHEN allow_unicode THEN
        value
      ELSE
        unaccent (value)
      END AS value
),
remove_chars AS (
  SELECT
    regexp_replace(value, E'[^\\w\\s-]', '', 'gi') AS value
FROM
  normalized
),
lowercase AS (
  SELECT
    lower(value) AS value
FROM
  remove_chars
),
trimmed AS (
  SELECT
    trim(value) AS value
FROM
  lowercase
),
hyphenated AS (
  SELECT
    regexp_replace(value, E'[-\\s]+', '-', 'gi') AS value
FROM
  trimmed
)
SELECT
  value
FROM
  hyphenated;
$EOFCODE$ LANGUAGE sql STRICT IMMUTABLE;

CREATE FUNCTION inflection.slugify(text) RETURNS text AS $EOFCODE$SELECT inflection.slugify($1, false)$EOFCODE$ LANGUAGE sql IMMUTABLE;

INSERT INTO inflection.inflection_rules (
  type,
  test,
  replacement
) VALUES
  ('plural', '^(m|wom)en$', NULL),
  ('plural', '(pe)ople$', NULL),
  ('plural', '(child)ren$', NULL),
  ('plural', '([ti])a$', NULL),
  ('plural', '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', NULL),
  ('plural', '(hi|ti)ves$', NULL),
  ('plural', '(curve)s$', NULL),
  ('plural', '([lr])ves$', NULL),
  ('plural', '([^fo])ves$', NULL),
  ('plural', '([^aeiouy]|qu)ies$', NULL),
  ('plural', '(s)eries$', NULL),
  ('plural', '(m)ovies$', NULL),
  ('plural', '(x|ch|ss|sh)es$', NULL),
  ('plural', '([m|l])ice$', NULL),
  ('plural', '(bus)es$', NULL),
  ('plural', '(o)es$', NULL),
  ('plural', '(shoe)s$', NULL),
  ('plural', '(cris|ax|test)es$', NULL),
  ('plural', '(octop|vir)i$', NULL),
  ('plural', '(alias|canvas|status|campus)es$', NULL),
  ('plural', '^(summons)es$', NULL),
  ('plural', '^(ox)en', NULL),
  ('plural', '(matr)ices$', NULL),
  ('plural', '^feet$', NULL),
  ('plural', '^teeth$', NULL),
  ('plural', '^geese$', NULL),
  ('plural', '(quiz)zes$', NULL),
  ('plural', '^(whereas)es$', NULL),
  ('plural', '^(criteri)a$', NULL),
  ('plural', '^genera$', NULL),
  ('plural', '^(m|wom)an$', E'\\1en'),
  ('plural', '(pe)rson$', E'\\1ople'),
  ('plural', '(child)$', E'\\1ren'),
  ('plural', '^(ox)$', E'\\1en'),
  ('plural', '(ax|test)is$', E'\\1es'),
  ('plural', '(octop|vir)us$', E'\\1i'),
  ('plural', '(alias|status|canvas|campus)$', E'\\1es'),
  ('plural', '^(summons)$', E'\\1es'),
  ('plural', '(bu)s$', E'\\1ses'),
  ('plural', '(buffal|tomat|potat)o$', E'\\1oes'),
  ('plural', '([ti])um$', E'\\1a'),
  ('plural', 'sis$', 'ses'),
  ('plural', '(?:([^f])fe|([lr])f)$', E'\\1\\2ves'),
  ('plural', '(hi|ti)ve$', E'\\1ves'),
  ('plural', '([^aeiouy]|qu)y$', E'\\1ies'),
  ('plural', '(matr)ix$', E'\\1ices'),
  ('plural', '(vert|ind)ex$', E'\\1ices'),
  ('plural', '(x|ch|ss|sh)$', E'\\1es'),
  ('plural', '([m|l])ouse$', E'\\1ice'),
  ('plural', '^foot$', 'feet'),
  ('plural', '^tooth$', 'teeth'),
  ('plural', '^goose$', 'geese'),
  ('plural', '(quiz)$', E'\\1zes'),
  ('plural', '^(whereas)$', E'\\1es'),
  ('plural', '^(criteri)on$', E'\\1a'),
  ('plural', '^genus$', 'genera'),
  ('plural', 's$', 's'),
  ('plural', '$', 's'),
  ('singular', '^(m|wom)an$', NULL),
  ('singular', '(pe)rson$', NULL),
  ('singular', '(child)$', NULL),
  ('singular', '^(ox)$', NULL),
  ('singular', '(ax|test)is$', NULL),
  ('singular', '(octop|vir)us$', NULL),
  ('singular', '(alias|status|canvas|campus)$', NULL),
  ('singular', '^(summons)$', NULL),
  ('singular', '(bu)s$', NULL),
  ('singular', '(buffal|tomat|potat)o$', NULL),
  ('singular', '([ti])um$', NULL),
  ('singular', 'sis$', NULL),
  ('singular', '(?:([^f])fe|([lr])f)$', NULL),
  ('singular', '(hi|ti)ve$', NULL),
  ('singular', '([^aeiouy]|qu)y$', NULL),
  ('singular', '(x|ch|ss|sh)$', NULL),
  ('singular', '(matr)ix$', NULL),
  ('singular', '([m|l])ouse$', NULL),
  ('singular', '^foot$', NULL),
  ('singular', '^tooth$', NULL),
  ('singular', '^goose$', NULL),
  ('singular', '(quiz)$', NULL),
  ('singular', '^(whereas)$', NULL),
  ('singular', '^(criteri)on$', NULL),
  ('singular', '^genus$', NULL),
  ('singular', '^(m|wom)en$', E'\\1an'),
  ('singular', '(pe)ople$', E'\\1rson'),
  ('singular', '(child)ren$', E'\\1'),
  ('singular', '^genera$', 'genus'),
  ('singular', '^(criteri)a$', E'\\1on'),
  ('singular', '([ti])a$', E'\\1um'),
  ('singular', '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$', E'\\1\\2sis'),
  ('singular', '(hi|ti)ves$', E'\\1ve'),
  ('singular', '(curve)s$', E'\\1'),
  ('singular', '([lr])ves$', E'\\1f'),
  ('singular', '([a])ves$', E'\\1ve'),
  ('singular', '([^fo])ves$', E'\\1fe'),
  ('singular', '(m)ovies$', E'\\1ovie'),
  ('singular', '([^aeiouy]|qu)ies$', E'\\1y'),
  ('singular', '(s)eries$', E'\\1eries'),
  ('singular', '(x|ch|ss|sh)es$', E'\\1'),
  ('singular', '([m|l])ice$', E'\\1ouse'),
  ('singular', '(bus)es$', E'\\1'),
  ('singular', '(o)es$', E'\\1'),
  ('singular', '(shoe)s$', E'\\1'),
  ('singular', '(cris|ax|test)es$', E'\\1is'),
  ('singular', '(octop|vir)i$', E'\\1us'),
  ('singular', '(alias|canvas|status|campus)es$', E'\\1'),
  ('singular', '^(summons)es$', E'\\1'),
  ('singular', '^(ox)en', E'\\1'),
  ('singular', '(matr)ices$', E'\\1ix'),
  ('singular', '(vert|ind)ices$', E'\\1ex'),
  ('singular', '^feet$', 'foot'),
  ('singular', '^teeth$', 'tooth'),
  ('singular', '^geese$', 'goose'),
  ('singular', '(quiz)zes$', E'\\1'),
  ('singular', '^(whereas)es$', E'\\1'),
  ('singular', 'ss$', 'ss'),
  ('singular', 's$', '');

CREATE INDEX inflection_rules_type_idx ON inflection.inflection_rules (type);