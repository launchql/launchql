import { TestFixture, cleanText } from '../../test-utils';
import { packageModule } from '../../src/package';

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
    expect(cleanText(sql)).toMatchSnapshot();
  });

  it('creates an extension via plan', async () => {
    const { sql } = await packageModule(fixture.tempFixtureDir, { usePlan: true });
    expect(cleanText(sql)).toMatchSnapshot();
  });
});
