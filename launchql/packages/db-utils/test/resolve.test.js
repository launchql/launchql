import { resolve, resolveWithPlan } from '../src/lib/resolve';

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

describe('resolve', () => {
  it('throws an error if file not found', async () => {
    let failed = false;
    try {
      await resolve(__dirname + '/../__fixtures__/resolve/error-case');
    } catch (e) {
      expect(e.message).toEqual(
        'no module schemas/myschema/somethingdoesntexist'
      );
      failed = true;
    }
    expect(failed).toBe(true);
  });
  it('throws an error if circular reference found', async () => {
    let failed = false;
    try {
      await resolve(__dirname + '/../__fixtures__/resolve/circular');
    } catch (e) {
      expect(e.message).toEqual(
        'Circular reference detected schemas/myschema/tables/sometable/table, schemas/myschema/schema'
      );
      failed = true;
    }
    expect(failed).toBe(true);
  });
  it('throws an error if invalid sql found', async () => {
    let failed = false;
    try {
      await resolve(__dirname + '/../__fixtures__/resolve/invalid');
    } catch (e) {
      expect(e.message).toEqual(
        `deployment script in wrong place or is named wrong internally
-- Deploy schemas/notmyschema/schema to pg`
      );
      failed = true;
    }
    expect(failed).toBe(true);
  });
  it('resolves sql in proper order', async () => {
    const sql = await resolve(__dirname + '/../__fixtures__/resolve/basic');
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
  });
  it('resolves sql in proper order using cwd()', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/../__fixtures__/resolve/basic');
    const sql = await resolve();
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
    process.chdir(dir);
  });
  it('resolves sql in plan order', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/../__fixtures__/resolve/basic');
    const sql = await resolveWithPlan();
    expect(sql).toBeTruthy();
    expect(sql.trim()).toEqual(expectResult);
    process.chdir(dir);
  });
});
