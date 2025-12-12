import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

it('more', async () => {
  const { mask_pad } = await pg.one(
    `SELECT utils.mask_pad($1, $2) AS mask_pad`,
    ['101', 20]
  );
  expect(mask_pad).toMatchSnapshot();
});

it('less', async () => {
  const { mask_pad } = await pg.one(
    `SELECT utils.mask_pad($1, $2) AS mask_pad`,
    ['101', 2]
  );
  expect(mask_pad).toMatchSnapshot();
});

describe('bitmask', () => {
  it('more', async () => {
    const { bitmask_pad } = await pg.one(
      `SELECT utils.bitmask_pad($1::varbit, $2) AS bitmask_pad`,
      ['101', 20]
    );
    expect(bitmask_pad).toMatchSnapshot();
  });

  it('less', async () => {
    const { bitmask_pad } = await pg.one(
      `SELECT utils.bitmask_pad($1::varbit, $2) AS bitmask_pad`,
      ['101', 2]
    );
    expect(bitmask_pad).toMatchSnapshot();
  });
});
