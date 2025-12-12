import { getConnections, PgTestClient } from 'pgsql-test';
import { snapshot } from 'graphile-test';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

const user_id = 'b9d22af1-62c7-43a5-b8c4-50630bbd4962';

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

  await pg.any(`CREATE TABLE status_public.mytable (
    id serial,
    name text,
    toggle text,
    is_approved boolean,
    is_verified boolean default false
  );`);

  await pg.any(`CREATE TRIGGER mytable_tg1 
    BEFORE INSERT ON status_public.mytable 
    FOR EACH ROW
    EXECUTE FUNCTION status_private.tg_achievement('name', 'tg_achievement');`);

  await pg.any(`CREATE TRIGGER mytable_tg2
    BEFORE UPDATE ON status_public.mytable 
    FOR EACH ROW
    WHEN (NEW.name IS DISTINCT FROM OLD.name)
    EXECUTE FUNCTION status_private.tg_achievement('name', 'tg_achievement');`);

  await pg.any(`CREATE TRIGGER mytable_tg3
    BEFORE INSERT ON status_public.mytable
    FOR EACH ROW
    EXECUTE FUNCTION status_private.tg_achievement_toggle('toggle', 'tg_achievement_toggle');`);

  await pg.any(`CREATE TRIGGER mytable_tg4
    BEFORE UPDATE ON status_public.mytable
    FOR EACH ROW
    WHEN (NEW.toggle IS DISTINCT FROM OLD.toggle)
    EXECUTE FUNCTION status_private.tg_achievement_toggle('toggle', 'tg_achievement_toggle');`);

  await pg.any(`CREATE TRIGGER mytable_tg5
    BEFORE INSERT ON status_public.mytable
    FOR EACH ROW
    EXECUTE FUNCTION status_private.tg_achievement_boolean('is_approved', 'tg_achievement_boolean');`);

  await pg.any(`CREATE TRIGGER mytable_tg6
    BEFORE UPDATE ON status_public.mytable
    FOR EACH ROW
    WHEN (NEW.is_approved IS DISTINCT FROM OLD.is_approved)
    EXECUTE FUNCTION status_private.tg_achievement_boolean('is_approved', 'tg_achievement_boolean');`);

  await pg.any(`CREATE TRIGGER mytable_tg7
    BEFORE INSERT ON status_public.mytable
    FOR EACH ROW
    EXECUTE FUNCTION status_private.tg_achievement_toggle_boolean('is_verified', 'tg_achievement_toggle_boolean');`);

  await pg.any(`CREATE TRIGGER mytable_tg8
    BEFORE UPDATE ON status_public.mytable
    FOR EACH ROW
    WHEN (NEW.is_verified IS DISTINCT FROM OLD.is_verified)
    EXECUTE FUNCTION status_private.tg_achievement_toggle_boolean('is_verified', 'tg_achievement_toggle_boolean');`);

  await pg.setContext({
    'jwt.claims.user_id': user_id
  });
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await pg.beforeEach();

  for (const name of levels) {
    await pg.any(
      `INSERT INTO status_public.levels (name) VALUES ($1) ON CONFLICT DO NOTHING`,
      [name]
    );
  }

  for (const [name, required_count = 1] of newbie) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [name, 'newbie', required_count]
    );
  }
  for (const [name, required_count = 1] of advanced) {
    await pg.any(
      `INSERT INTO status_public.level_requirements (name, level, required_count)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [name, 'advanced', required_count]
    );
  }
});

afterEach(async () => {
  await pg.afterEach();
});

it('newbie', async () => {
  const beforeInsert = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ beforeInsert })).toMatchSnapshot();

  await pg.any(
    `INSERT INTO status_public.mytable (name) VALUES ($1)`,
    ['upload_profile_image']
  );

  const afterFirstInsert = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterFirstInsert })).toMatchSnapshot();

  await pg.any(`UPDATE status_public.mytable SET toggle = 'yo'`);

  const afterUpdateToggleToValue = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterUpdateToggleToValue })).toMatchSnapshot();

  await pg.any(`UPDATE status_public.mytable SET toggle = NULL`);

  const afterUpdateToggleToNull = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterUpdateToggleToNull })).toMatchSnapshot();

  await pg.any(`UPDATE status_public.mytable SET is_verified = TRUE`);

  const afterIsVerifiedIsTrue = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterIsVerifiedIsTrue })).toMatchSnapshot();

  await pg.any(`UPDATE status_public.mytable SET is_verified = FALSE`);

  const afterIsVerifiedIsFalse = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterIsVerifiedIsFalse })).toMatchSnapshot();

  await pg.any(`UPDATE status_public.mytable SET is_approved = TRUE`);

  const afterIsApprovedTrue = await pg.any(
    `SELECT * FROM status_public.user_achievements ORDER BY name`
  );
  expect(snapshot({ afterIsApprovedTrue })).toMatchSnapshot();
});
