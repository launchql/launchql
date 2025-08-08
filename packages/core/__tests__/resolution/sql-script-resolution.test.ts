import { resolve, resolveWithPlan } from '../../src/resolution/resolve';
import { TestFixture } from '../../test-utils';

let baseFixture: TestFixture;

beforeAll(() => {
  baseFixture = new TestFixture('sqitch', 'resolve');
});

afterAll(() => {
  baseFixture.cleanup();
});

const expectResult = `-- Deploy schemas/myschema/schema to pg

begin;

create schema myschema;

commit;

-- Deploy schemas/myschema/tables/sometable/table to pg
-- requires: schemas/myschema/schema

begin;

create table myschema.sometable (
  id serial,
  name text
);

commit;`;

describe('resolve tests', () => {
  it('throws an error if file not found', async () => {
    let failed = false;

    try {
      await resolve(baseFixture.getFixturePath('error-case'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        expect(e.message).toBe('Module "schemas/myschema/somethingdoesntexist" not found in modules list.');
        failed = true;
      } else {
        throw new Error('Caught an unexpected non-error exception');
      }
    }

    expect(failed).toBe(true);
  });

  it('throws an error if circular reference found', async () => {
    let failed = false;

    try {
      await resolve(baseFixture.getFixturePath('circular'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        expect(e.message).toBe(
          'Circular reference detected: schemas/myschema/tables/sometable/table → schemas/myschema/schema'
        );
        failed = true;
      } else {
        throw new Error('Caught an unexpected non-error exception');
      }
    }

    expect(failed).toBe(true);
  });

  it('throws an error if invalid SQL found', async () => {
    let failed = false;

    try {
      await resolve(baseFixture.getFixturePath('invalid'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        expect(e.message).toBe(
          `deployment script in wrong place or is named wrong internally
-- Deploy schemas/notmyschema/schema to pg`
        );
        failed = true;
      } else {
        throw new Error('Caught an unexpected non-error exception');
      }
    }

    expect(failed).toBe(true);
  });

  it('resolves SQL in proper order', async () => {
    const sql = await resolve(baseFixture.getFixturePath('basic'));
    expect(sql).toBeTruthy();
    expect(sql.trim()).toBe(expectResult);
  });

  it('resolves SQL in proper order using cwd()', async () => {
    const originalDir = process.cwd();
    try {
      process.chdir(baseFixture.getFixturePath('basic'));
      const sql = await resolve();
      expect(sql).toBeTruthy();
      expect(sql.trim()).toBe(expectResult);
    } finally {
      process.chdir(originalDir);
    }
  });

  it('resolves SQL in plan order', async () => {
    const originalDir = process.cwd();
    try {
      process.chdir(baseFixture.getFixturePath('basic'));
      const sql = await resolveWithPlan();
      expect(sql).toBeTruthy();
      expect(sql.trim()).toBe(expectResult);
    } finally {
      process.chdir(originalDir);
    }
  });
});
