import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());

  await pg.any(`
    CREATE TABLE public.items (
      id UUID DEFAULT uuids.pseudo_order_uuid(),
      name TEXT,
      seed TEXT,
      custom_id UUID
    );

    CREATE TABLE public.items_seeded (
      id UUID,
      tenant TEXT
    );

    CREATE TRIGGER set_custom_id
    BEFORE INSERT ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION uuids.trigger_set_uuid_seed('custom_id', 'seed');

    CREATE TRIGGER set_id_from_tenant
    BEFORE INSERT ON public.items_seeded
    FOR EACH ROW
    EXECUTE FUNCTION uuids.trigger_set_uuid_related_field('id', 'tenant');
  `);
});

afterAll(async () => {
  try {
    await teardown();
  } catch (e) {
    console.error('Teardown failed:', e);
  }
});

beforeEach(() => pg.beforeEach());
afterEach(() => pg.afterEach());

describe('uuids.pseudo_order_uuid()', () => {
  it('generates a valid UUID', async () => {
    const { pseudo_order_uuid } = await pg.one(`
      SELECT uuids.pseudo_order_uuid() AS pseudo_order_uuid
    `);
    expect(pseudo_order_uuid).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/
    );
  });
});

describe('uuids.pseudo_order_seed_uuid(seed)', () => {
  it('generates a valid UUID from a seed', async () => {
    const { pseudo_order_seed_uuid } = await pg.one(
      `SELECT uuids.pseudo_order_seed_uuid($1) AS pseudo_order_seed_uuid`,
      ['tenant123']
    );
    expect(pseudo_order_seed_uuid).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/
    );
  });
});

describe('uuids.trigger_set_uuid_seed', () => {
  it('sets custom_id based on static seed', async () => {
    const { custom_id } = await pg.one(
      `INSERT INTO public.items (name, seed) VALUES ($1, $2) RETURNING custom_id`,
      ['Item A', 'my-seed']
    );
    expect(custom_id).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/
    );
  });
});

describe('uuids.trigger_set_uuid_related_field', () => {
  it('sets id based on tenant column', async () => {
    const { id } = await pg.one(
      `INSERT INTO public.items_seeded (tenant) VALUES ($1) RETURNING id`,
      ['tenant-42']
    );
    expect(id).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$/
    );
  });
});