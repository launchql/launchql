import { TestFixture } from '../../test-utils';
import { resolveDependencies } from '../../src/resolution/deps';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/1st]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-first'),
    'my-first',
    { tagResolution: 'resolve' }
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/2nd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
    'my-second',
    { tagResolution: 'resolve' }
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with resolved tags [simple-w-tags/3rd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-third'),
    'my-third',
    { tagResolution: 'resolve' }
  );
  expect(res).toMatchSnapshot();
});
