import { packageModule } from '../../src/packaging/package';
import {TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch', 'launchql', 'packages', 'secrets');
});

afterAll(() => {
  fixture.cleanup();
});

describe('packageModule tests', () => {
  it('creates an extension', async () => {
    const { sql } = await packageModule(fixture.tempFixtureDir);
    expect(sql).toMatchSnapshot();
  });

  it('creates an extension via plan', async () => {
    const { sql } = await packageModule(fixture.tempFixtureDir, { usePlan: true });
    expect(sql).toMatchSnapshot();
  });
});
