import { TestFixture, cleanText } from '../../test-utils';
import { resolve } from '../../src/resolution/resolve';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('migrate', 'simple');
});

afterAll(() => {
  fixture.cleanup();
});

describe('resolve works with cross deps', () => {
  it('resolves sql in proper order', async () => {
    const sql = await resolve(fixture.tempFixtureDir);
    expect(sql).toBeTruthy();
    expect(sql).toMatchSnapshot();
  });
});
