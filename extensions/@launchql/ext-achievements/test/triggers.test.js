import { getConnections } from './utils';
import { snap } from './utils/snaps';
let db, teardown;
const objs = {
  tables: {}
};
const user_id = 'b9d22af1-62c7-43a5-b8c4-50630bbd4962';
const status = {};

const repeat = (str, n) => Array.from({ length: n }).fill([str]).flat();

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  // await db.begin();
  // await db.savepoint();

  status.public = db.helper('status_public');
  status.private = db.helper('status_private');

  await db.any(`CREATE TABLE status_public.mytable (
    id serial,
    name text,
    toggle text,
    is_approved boolean,
    is_verified boolean default false
  );`);

  await db.any(`
    CREATE TRIGGER mytable_tg1 
    BEFORE INSERT ON status_public.mytable 
    FOR EACH ROW
    EXECUTE PROCEDURE status_private.tg_achievement('name', 'tg_achievement');
  `);
  await db.any(`
    CREATE TRIGGER mytable_tg2
    BEFORE UPDATE ON status_public.mytable 
    FOR EACH ROW
    WHEN (NEW.name IS DISTINCT FROM OLD.name)
    EXECUTE PROCEDURE status_private.tg_achievement('name', 'tg_achievement');
  `);

  await db.any(`
      CREATE TRIGGER mytable_tg3
      BEFORE INSERT ON status_public.mytable
      FOR EACH ROW
      EXECUTE PROCEDURE status_private.tg_achievement_toggle('toggle', 'tg_achievement_toggle');
    `);
  await db.any(`
      CREATE TRIGGER mytable_tg4
      BEFORE UPDATE ON status_public.mytable
      FOR EACH ROW
      WHEN (NEW.toggle IS DISTINCT FROM OLD.toggle)
      EXECUTE PROCEDURE status_private.tg_achievement_toggle('toggle', 'tg_achievement_toggle');
    `);

  await db.any(`
      CREATE TRIGGER mytable_tg5
      BEFORE INSERT ON status_public.mytable
      FOR EACH ROW
      EXECUTE PROCEDURE status_private.tg_achievement_boolean('is_approved', 'tg_achievement_boolean');
    `);
  await db.any(`
      CREATE TRIGGER mytable_tg6
      BEFORE UPDATE ON status_public.mytable
      FOR EACH ROW
      WHEN (NEW.is_approved IS DISTINCT FROM OLD.is_approved)
      EXECUTE PROCEDURE status_private.tg_achievement_boolean('is_approved', 'tg_achievement_boolean');
    `);

  await db.any(`
      CREATE TRIGGER mytable_tg7
      BEFORE INSERT ON status_public.mytable
      FOR EACH ROW
      EXECUTE PROCEDURE status_private.tg_achievement_toggle_boolean('is_verified', 'tg_achievement_toggle_boolean');
    `);
  await db.any(`
      CREATE TRIGGER mytable_tg8
      BEFORE UPDATE ON status_public.mytable
      FOR EACH ROW
      WHEN (NEW.is_verified IS DISTINCT FROM OLD.is_verified)
      EXECUTE PROCEDURE status_private.tg_achievement_toggle_boolean('is_verified', 'tg_achievement_toggle_boolean');
    `);

  db.setContext({
    'jwt.claims.user_id': user_id
  });
});

afterAll(async () => {
  try {
    // try catch here allows us to see the sql parsing issues!
    // await db.rollback();
    // await db.commit();
    await teardown();
  } catch (e) {
    // noop
  }
});

afterEach(async () => {
  await db.afterEach();
});

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

beforeEach(async () => {
  await db.beforeEach();
  //
  for (const name of levels) {
    await status.public.insertOne('levels', {
      name
    });
  }
  //
  for (const [name, required_count = 1] of newbie) {
    await status.public.insertOne('level_requirements', {
      name,
      level: 'newbie',
      required_count
    });
  }
  for (const [name, required_count = 1] of advanced) {
    await status.public.insertOne('level_requirements', {
      name,
      level: 'advanced',
      required_count
    });
  }
});

it('newbie', async () => {
  const beforeInsert = await status.public.select('user_achievements', ['*']);
  snap({ beforeInsert });

  await status.public.insertOne('mytable', {
    name
  });

  const afterFirstInsert = await status.public.select('user_achievements', [
    '*'
  ]);
  snap({ afterFirstInsert });

  await db.any(`
  UPDATE status_public.mytable
    SET toggle='yo';
    `);

  const afterUpdateToggleToValue = await status.public.select(
    'user_achievements',
    ['*']
  );
  snap({ afterUpdateToggleToValue });

  await db.any(`
  UPDATE status_public.mytable
    SET toggle=NULL;
    `);

  const afterUpdateToggleToNull = await status.public.select(
    'user_achievements',
    ['*']
  );
  snap({ afterUpdateToggleToNull });

  await db.any(`
  UPDATE status_public.mytable
    SET is_verified=TRUE;
    `);

  const afterIsVerifiedIsTrue = await status.public.select(
    'user_achievements',
    ['*']
  );
  snap({ afterIsVerifiedIsTrue });

  await db.any(`
  UPDATE status_public.mytable
    SET is_verified=FALSE;
    `);

  const afterIsVerifiedIsFalse = await status.public.select(
    'user_achievements',
    ['*']
  );
  snap({ afterIsVerifiedIsFalse });

  await db.any(`
  UPDATE status_public.mytable
    SET is_approved=TRUE;
    `);

  const afterIsApprovedTrue = await status.public.select('user_achievements', [
    '*'
  ]);
  snap({ afterIsApprovedTrue });
});
