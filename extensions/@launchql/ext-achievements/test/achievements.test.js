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
  //

  const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    ...repeat('complete_action', 3)
  ];
  for (const name of steps) {
    await status.public.insertOne('user_steps', {
      user_id,
      name
    });
  }

  const advancedRequirements = await status.public.callAny('steps_required', {
    level: 'advanced',
    user_id
  });
  snap({ advancedRequirements });
  const newbieRequirements = await status.public.callAny('steps_required', {
    level: 'newbie',
    user_id
  });
  snap({ newbieRequirements });

  const [userAchievedNewbie] = await status.public.callAny('user_achieved', {
    level: 'newbie',
    user_id
  });
  snap({ newbie: userAchievedNewbie });
  const [userAchievedAdvanced] = await status.public.callAny('user_achieved', {
    level: 'advanced',
    user_id
  });
  snap({ advanced: userAchievedAdvanced });
});

it('advanced', async () => {
  //

  const steps = [
    'agree_to_terms',
    'accept_cookies',
    'accept_privacy',
    'upload_profile_image',
    ...repeat('invite_users', 3),
    ...repeat('complete_action', 21)
  ];
  for (const name of steps) {
    await status.public.insertOne('user_steps', {
      user_id,
      name
    });
  }

  const advancedRequirements = await status.public.callAny('steps_required', {
    level: 'advanced',
    user_id
  });
  snap({ advancedRequirements });
  const newbieRequirements = await status.public.callAny('steps_required', {
    level: 'newbie',
    user_id
  });
  snap({ newbieRequirements });

  const [userAchievedNewbie] = await status.public.callAny('user_achieved', {
    level: 'newbie',
    user_id
  });
  snap({ newbie: userAchievedNewbie });
  const [userAchievedAdvanced] = await status.public.callAny('user_achieved', {
    level: 'advanced',
    user_id
  });
  snap({ advanced: userAchievedAdvanced });
});

it('advanced part II', async () => {
  //

  const advanced = [['apply_for_verifier'], ['create_action', 2]];

  for (const [name, required_count = 1] of advanced) {
    await status.public.insertOne('level_requirements', {
      name,
      level: 'advanced',
      required_count
    });
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
    await status.public.insertOne('user_steps', {
      user_id,
      name
    });
  }

  const advancedRequirements = await status.public.callAny('steps_required', {
    level: 'advanced',
    user_id
  });
  snap({ advancedRequirements });
  const newbieRequirements = await status.public.callAny('steps_required', {
    level: 'newbie',
    user_id
  });
  snap({ newbieRequirements });

  const [userAchievedNewbie] = await status.public.callAny('user_achieved', {
    level: 'newbie',
    user_id
  });
  snap({ newbie: userAchievedNewbie });
  const [userAchievedAdvanced] = await status.public.callAny('user_achieved', {
    level: 'advanced',
    user_id
  });
  snap({ advanced: userAchievedAdvanced });
});

it('advanced part III', async () => {
  //

  const advanced = [
    ['apply_for_verifier'],
    ['approved_for_verifier'],
    ['create_action', 2]
  ];

  for (const [name, required_count = 1] of advanced) {
    await status.public.insertOne('level_requirements', {
      name,
      level: 'advanced',
      required_count
    });
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
    await status.public.insertOne('user_steps', {
      user_id,
      name
    });
  }

  const advancedRequirements = await status.public.callAny('steps_required', {
    level: 'advanced',
    user_id
  });
  snap({ advancedRequirements });
  const newbieRequirements = await status.public.callAny('steps_required', {
    level: 'newbie',
    user_id
  });
  snap({ newbieRequirements });

  const [userAchievedNewbie] = await status.public.callAny('user_achieved', {
    level: 'newbie',
    user_id
  });
  snap({ newbie: userAchievedNewbie });
  const [userAchievedAdvanced] = await status.public.callAny('user_achieved', {
    level: 'advanced',
    user_id
  });
  snap({ advanced: userAchievedAdvanced });
});
