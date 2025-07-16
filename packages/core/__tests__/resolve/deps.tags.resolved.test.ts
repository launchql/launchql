import { TestFixture } from '../../test-utils';
import { getDepsWithTags } from '../../src/deps';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/1st]', async () => {
  const res = await getDepsWithTags(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-first'),
    'my-first'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/2nd]', async () => {
  const res = await getDepsWithTags(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
    'my-second'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/3rd]', async () => {
  const res = await getDepsWithTags(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-third'),
    'my-third'
  );
  expect(res).toMatchSnapshot();
});