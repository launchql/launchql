
import { resolveDependencies } from '../../src/resolution/deps';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('sqitch package dependencies with internal tag resolution [simple-w-tags/1st]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-first'),
    'my-first',
    { tagResolution: 'internal' }
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with internal tag resolution [simple-w-tags/2nd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-second'),
    'my-second',
    { tagResolution: 'internal' }
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies with internal tag resolution [simple-w-tags/3rd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple-w-tags', 'packages', 'my-third'),
    'my-third',
    { tagResolution: 'internal' }
  );
  expect(res).toMatchSnapshot();
});
describe('stage fixture dependency resolution - internal tags', () => {
  let stageFixture: TestFixture;

  beforeAll(() => {
    stageFixture = new TestFixture('stage');
  });

  afterAll(() => {
    stageFixture.cleanup();
  });

  it('resolves internal tags from plan only for unique-names', async () => {
    const pkgDir = stageFixture.getFixturePath('packages', 'unique-names');
    const res = await resolveDependencies(pkgDir, 'unique-names', {
      tagResolution: 'internal',
      source: 'plan'
    });
    expect(res).toMatchSnapshot();
  });

  it('resolves internal tags from sql headers for unique-names', async () => {
    const pkgDir = stageFixture.getFixturePath('packages', 'unique-names');
    const res = await resolveDependencies(pkgDir, 'unique-names', {
      tagResolution: 'internal',
      source: 'sql'
    });
    expect(res).toMatchSnapshot();
  });
});
