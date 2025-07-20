import { resolveDependencies } from '../../src/resolution/deps';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('sqitch package dependencies [simple-w-tags/1st]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-first'),
    'my-first'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple-w-tags/2nd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
    'my-second'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple-w-tags/3rd]', async () => {
  expect(() => resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-third'),
    'my-third'
  )).toThrow();
});


