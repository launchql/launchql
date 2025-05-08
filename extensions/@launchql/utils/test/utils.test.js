import { getConnections } from './utils';

let db, utils, teardown;
const objs = {
  tables: {}
};

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  utils = db.helper('utils');
});

afterAll(async () => {
  try {
    //try catch here allows us to see the sql parsing issues!
    await teardown();
  } catch (e) {
    // noop
    console.log(e);
  }
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('more', async () => {
  const [result] = await utils.callAny('mask_pad', { mask: '101', num: 20 });
  expect(result).toMatchSnapshot();
});

it('less', async () => {
  const [result] = await utils.callAny('mask_pad', { mask: '101', num: 2 });
  expect(result).toMatchSnapshot();
});

describe('bitmask', () => {
  it('more', async () => {
    const [result] = await utils.callAny('bitmask_pad', {
      mask: '101',
      num: 20
    });
    expect(result).toMatchSnapshot();
  });

  it('less', async () => {
    const [result] = await utils.callAny('bitmask_pad', {
      mask: '101',
      num: 2
    });
    expect(result).toMatchSnapshot();
  });
});
