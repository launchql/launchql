import { getConnections, PgTestClient } from 'pgsql-test';

let pg: PgTestClient;
let teardown: () => Promise<void>;

const jwt = {
  user_id: 'b9d22af1-62c7-43a5-b8c4-50630bbd4962',
  database_id: '44744c94-93cf-425a-b524-ce6f1466e327',
  group_ids: [
    'f12c75c2-47d5-43fd-9223-d42d08f51942',
    'd96d32b4-e819-4cb1-8a27-e27e763e0d7f',
    'c8a27b31-1d40-4f40-9cb0-e96a44e68072'
  ]
};

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown?.();
});

it('get values', async () => {
  await pg.any(`BEGIN`);
  await pg.any(
    `SELECT 
      set_config('jwt.claims.user_agent', $1, true),
      set_config('jwt.claims.ip_address', $2, true),
      set_config('jwt.claims.database_id', $3, true),
      set_config('jwt.claims.user_id', $4, true),
      set_config('jwt.claims.group_ids', $5, true)
    `,
    [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
      '127.0.0.1',
      jwt.database_id,
      jwt.user_id,
      `{${jwt.group_ids.join(',')}}`
    ]
  );

  const { user_agent } = await pg.one(
    `select jwt_public.current_user_agent() as user_agent`
  );
  const { ip_address } = await pg.one(
    `select jwt_public.current_ip_address() as ip_address`
  );
  const { database_id } = await pg.one(
    `select jwt_private.current_database_id() as database_id`
  );
  const { group_ids } = await pg.one(
    `select jwt_public.current_group_ids() as group_ids`
  );
  const { user_id } = await pg.one(
    `select jwt_public.current_user_id() as user_id`
  );
  await pg.any(`ROLLBACK`);

  expect({ user_agent }).toMatchSnapshot();
  expect({ ip_address }).toMatchSnapshot();
  expect({ database_id }).toMatchSnapshot();
  expect({ group_ids }).toMatchSnapshot();
  expect({ user_id }).toMatchSnapshot();
});
