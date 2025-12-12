import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

const user_id = 'b9d22af1-62c7-43a5-b8c4-50630bbd4962';

const repeat = (str: string, n: number): string[] =>
  Array.from({ length: n }).map(() => str);

const levels = ['newbie', 'advanced'];

const newbie = [
  ['upload_profile_image'],
  ['complete_action', 5],
  ['accept_cookies'],
  ['accept_privacy'],
  ['agree_to_terms']
];
const advanced = [
  ['invite_users', 15],
  ['complete_action', 15]
];

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();

  for (const name of levels) {
    await pg.any(`INSERT INTO status_public.levels (name) VALUES ($1)`, [name]);
  }

  for (const [name, required_count = 1] of newbie) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3)`,
      [name, 'newbie', required_count]
    );
  }

  for (const [name, required_count = 1] of advanced) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3)`,
      [name, 'advanced', required_count]
    );
  }
});

afterEach(async () => {
  await pg.afterEach();
});

it('newbie', async () => {
    const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    ...repeat('complete_action', 3)
  ];
  for (const name of steps) {
    await pg.any(
      `INSERT INTO status_public.user_steps (user_id, name) VALUES ($1, $2)`,
      [user_id, name]
    );
  }

  const advancedRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advancedRequirements })).toMatchSnapshot();

  const newbieRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbieRequirements })).toMatchSnapshot();

  const [userAchievedNewbie] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbie: userAchievedNewbie })).toMatchSnapshot();

  const [userAchievedAdvanced] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advanced: userAchievedAdvanced })).toMatchSnapshot();
});

it('advanced', async () => {
    const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    'upload_profile_image',
    ...repeat('invite_users', 3),
    ...repeat('complete_action', 21)
  ];
  for (const name of steps) {
    await pg.any(
      `INSERT INTO status_public.user_steps (user_id, name) VALUES ($1, $2)`,
      [user_id, name]
    );
  }

  const advancedRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advancedRequirements })).toMatchSnapshot();

  const newbieRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbieRequirements })).toMatchSnapshot();

  const [userAchievedNewbie] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbie: userAchievedNewbie })).toMatchSnapshot();

  const [userAchievedAdvanced] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advanced: userAchievedAdvanced })).toMatchSnapshot();
});

it('advanced part II', async () => {
    const partII = [['apply_for_verifier'], ['create_action', 2]];

  for (const [name, required_count = 1] of partII) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3)`,
      [name, 'advanced', required_count]
    );
  }

  const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    'upload_profile_image',
    ...repeat('invite_users', 3),
    ...repeat('complete_action', 10)
  ];
  for (const name of steps) {
    await pg.any(
      `INSERT INTO status_public.user_steps (user_id, name) VALUES ($1, $2)`,
      [user_id, name]
    );
  }

  const advancedRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advancedRequirements })).toMatchSnapshot();

  const newbieRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbieRequirements })).toMatchSnapshot();

  const [userAchievedNewbie] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbie: userAchievedNewbie })).toMatchSnapshot();

  const [userAchievedAdvanced] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advanced: userAchievedAdvanced })).toMatchSnapshot();
});

it('advanced part III', async () => {
    const partIII = [
    ['apply_for_verifier'],
    ['approved_for_verifier'],
    ['create_action', 2]
  ];

  for (const [name, required_count = 1] of partIII) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3)`,
      [name, 'advanced', required_count]
    );
  }

  const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    'upload_profile_image',
    ...repeat('invite_users', 20),
    ...repeat('complete_action', 20),
    ...repeat('create_action', 10),
    ...repeat('apply_for_verifier', 1),
    ...repeat('approved_for_verifier', 1)
  ];

  for (const name of steps) {
    await pg.any(
      `INSERT INTO status_public.user_steps (user_id, name) VALUES ($1, $2)`,
      [user_id, name]
    );
  }

  const advancedRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advancedRequirements })).toMatchSnapshot();

  const newbieRequirements = await pg.any(
    `SELECT * FROM status_public.steps_required($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbieRequirements })).toMatchSnapshot();

  const [userAchievedNewbie] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['newbie', user_id]
  );
  expect(snapshot({ newbie: userAchievedNewbie })).toMatchSnapshot();

  const [userAchievedAdvanced] = await pg.any(
    `SELECT * FROM status_public.user_achieved($1, $2)`,
    ['advanced', user_id]
  );
  expect(snapshot({ advanced: userAchievedAdvanced })).toMatchSnapshot();
});
