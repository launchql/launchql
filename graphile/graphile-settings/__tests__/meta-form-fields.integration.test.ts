import { getConnectionsObjectUnwrapped, seed } from 'graphile-test';
import { join } from 'path';

import { ConstructivePreset } from '../src/presets/constructive-preset';

jest.setTimeout(60000);

const baseSeed = join(__dirname, '../../../__fixtures__/seed/base/setup.sql');

// The form metadata graphile-meta adds to _meta, read from a real schema: the
// CHECK values come from the gather hook, writability from the create and
// patch inputs PostGraphile builds, and junctions from real v5 relations.
const formSchema = `
  CREATE SCHEMA form_meta;

  CREATE TABLE form_meta.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL
  );

  CREATE TABLE form_meta.shifts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    status text NOT NULL DEFAULT 'open'
      CONSTRAINT shifts_status_chk CHECK (status IN ('open', 'full', 'cancelled')),
    priority text CHECK (priority = 'low' OR priority = 'high'),
    code varchar(10) CHECK (code IN ('a', 'b')) CHECK (length(code) > 0),
    internal_level text CHECK (internal_level IN ('x', 'y')),
    filled_in text NOT NULL,
    location_id uuid NOT NULL REFERENCES form_meta.locations (id)
  );
  COMMENT ON COLUMN form_meta.shifts.internal_level IS E'@behavior -select';
  COMMENT ON COLUMN form_meta.shifts.filled_in IS E'@behavior -insert\\nFilled in for you';

  CREATE TABLE form_meta.volunteers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL
  );

  -- A link table the many-to-many plugin doesn't opt into: id, a timestamp
  -- with a default and a hidden note around the two foreign keys.
  CREATE TABLE form_meta.shift_signups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id uuid NOT NULL REFERENCES form_meta.shifts (id),
    volunteer_id uuid NOT NULL REFERENCES form_meta.volunteers (id),
    created_at timestamptz NOT NULL DEFAULT now(),
    internal_note text
  );
  COMMENT ON COLUMN form_meta.shift_signups.internal_note IS E'@behavior -select';

  -- A link table the plugin does opt into: one entry per side, not two.
  CREATE TABLE form_meta.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label text NOT NULL
  );
  CREATE TABLE form_meta.volunteer_skills (
    volunteer_id uuid NOT NULL REFERENCES form_meta.volunteers (id),
    skill_id uuid NOT NULL REFERENCES form_meta.skills (id),
    PRIMARY KEY (volunteer_id, skill_id)
  );
  COMMENT ON TABLE form_meta.volunteer_skills IS E'@behavior +manyToMany';

  -- A link table whose other side is hidden from the API.
  CREATE TABLE form_meta.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid()
  );
  COMMENT ON TABLE form_meta.badges IS E'@behavior -*';
  CREATE TABLE form_meta.shift_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id uuid NOT NULL REFERENCES form_meta.shifts (id),
    badge_id uuid NOT NULL REFERENCES form_meta.badges (id)
  );
`;

const metaQuery = `
  query FormMeta {
    _meta {
      tables {
        name
        tableName
        schemaName
        isJunction
        fields {
          name
          columnName
          description
          isNotNull
          hasDefault
          allowedValues
          isRequiredOnCreate
          isWritableOnCreate
          isWritableOnUpdate
          type { pgType gqlType }
          enumValues { name values }
        }
        indexes { name columns fields { name allowedValues } }
        constraints {
          primaryKey { name }
          unique { name }
          foreignKey { name referencedTable fields { name allowedValues } }
        }
        foreignKeyConstraints { name }
        relations {
          belongsTo { fieldName type references { name } }
          hasMany { fieldName type referencedBy { name } }
          manyToMany {
            fieldName
            type
            junctionTable { name }
            rightTable { name }
            junctionLeftConstraint { name }
            junctionRightConstraint { name }
            junctionLeftKeyAttributes { name }
            junctionRightKeyAttributes { name }
          }
        }
        inflection { tableType createInputType patchType }
        query { all one create update delete }
        scope { scope tier keyColumn entityTable }
      }
    }
  }
`;

type Field = {
  name: string;
  description: string | null;
  isNotNull: boolean;
  allowedValues: string[] | null;
  isRequiredOnCreate: boolean | null;
  isWritableOnCreate: boolean | null;
  isWritableOnUpdate: boolean | null;
};
type ManyToMany = {
  fieldName: string | null;
  type: string | null;
  junctionTable: { name: string };
  rightTable: { name: string };
  junctionLeftConstraint: { name: string };
  junctionRightConstraint: { name: string };
  junctionLeftKeyAttributes: { name: string }[];
  junctionRightKeyAttributes: { name: string }[];
};
type Table = {
  name: string;
  tableName: string;
  isJunction: boolean;
  fields: Field[];
  foreignKeyConstraints: { name: string }[];
  relations: { manyToMany: ManyToMany[] };
};

function stringsIn(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => stringsIn(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => stringsIn(item, found));
  return found;
}

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

describe('_meta form metadata on a real schema', () => {
  let teardown: () => Promise<void>;
  let meta: { _meta: { tables: Table[] } };
  const table = (tableName: string) => meta._meta.tables.find((t) => t.tableName === tableName);
  const field = (tableName: string, name: string) =>
    table(tableName)?.fields.find((f) => f.name === name);

  beforeAll(async () => {
    const connections = await getConnectionsObjectUnwrapped(
      {
        schemas: ['form_meta'],
        preset: { extends: [ConstructivePreset] },
        useRoot: true
      },
      [
        seed.sqlfile([baseSeed]),
        seed.fn(async ({ pg }) => {
          await pg.query(formSchema);
        })
      ]
    );
    teardown = connections.teardown;
    meta = await connections.query<{ _meta: { tables: Table[] } }>({ query: metaQuery });
  });

  afterAll(async () => {
    if (teardown) await teardown();
  });

  it('reports CHECK values read at gather time, and nothing for a column with another kind of check', () => {
    expect(field('shifts', 'status')?.allowedValues).toEqual(['open', 'full', 'cancelled']);
    expect(field('shifts', 'priority')?.allowedValues).toEqual(['low', 'high']);
    expect(field('shifts', 'code')?.allowedValues).toBeNull();
  });

  it('says nothing about a column hidden with -select, anywhere in the response', () => {
    expect(field('shifts', 'internalLevel')).toBeUndefined();
    const reported = allowedValuesIn(meta).filter((values) => values !== null);
    expect(reported).toEqual([
      ['open', 'full', 'cancelled'],
      ['low', 'high']
    ]);
  });

  it('reads requiredness from the create input, so a -insert column is neither required nor writable', () => {
    expect(field('shifts', 'title')).toMatchObject({
      isNotNull: true,
      isRequiredOnCreate: true,
      isWritableOnCreate: true,
      isWritableOnUpdate: true
    });
    expect(field('shifts', 'status')).toMatchObject({ isRequiredOnCreate: false, isWritableOnCreate: true });
    expect(field('shifts', 'filledIn')).toMatchObject({
      isNotNull: true,
      isRequiredOnCreate: false,
      isWritableOnCreate: false,
      isWritableOnUpdate: true,
      description: 'Filled in for you'
    });
  });

  it('detects a link table with real relation names, and links both sides', () => {
    const signups = table('shift_signups');
    const shiftLinks = table('shifts')?.relations.manyToMany.filter((m) => m.junctionTable.name === signups?.name);
    const volunteerLinks = table('volunteers')?.relations.manyToMany.filter(
      (m) => m.junctionTable.name === signups?.name
    );

    expect(signups?.isJunction).toBe(true);
    expect(shiftLinks).toHaveLength(1);
    expect(shiftLinks?.[0]).toMatchObject({
      fieldName: null,
      type: null,
      rightTable: { name: table('volunteers')?.name },
      junctionLeftKeyAttributes: [{ name: 'shiftId' }],
      junctionRightKeyAttributes: [{ name: 'volunteerId' }]
    });
    // Both keys are the junction's own foreign keys, named as the junction
    // reports them, never the left tables' backward relations, which this
    // preset hides from the API.
    const junctionKeys = signups?.foreignKeyConstraints.map((c) => c.name).sort();
    for (const link of [shiftLinks?.[0], volunteerLinks?.[0]]) {
      expect([link?.junctionLeftConstraint.name, link?.junctionRightConstraint.name].sort()).toEqual(junctionKeys);
    }
    expect(volunteerLinks?.[0]).toMatchObject({ fieldName: null, rightTable: { name: table('shifts')?.name } });
  });

  it('keeps one entry per side for a link table the many-to-many plugin opts into', () => {
    const skills = table('volunteer_skills');
    const links = table('volunteers')?.relations.manyToMany.filter((m) => m.junctionTable.name === skills?.name);

    expect(skills?.isJunction).toBe(true);
    expect(links).toHaveLength(1);
    expect(links?.[0].fieldName).toEqual(expect.any(String));
  });

  it('reports no link, and no junction, when the other side is hidden from the API', () => {
    const badges = table('shift_badges');

    expect(table('badges')).toBeUndefined();
    expect(badges?.isJunction).toBe(false);
    expect(
      table('shifts')?.relations.manyToMany.filter((m) => m.junctionTable.name === badges?.name)
    ).toEqual([]);
  });

  it('serves no backend internals in any value', () => {
    const forbidden =
      /@\w|smart ?tag|plugin|registry|presigned|derived|inflect|introspect|trigger|behavio|provenance|check constraint/i;
    expect(stringsIn(meta).filter((value) => forbidden.test(value))).toEqual([]);
  });
});
