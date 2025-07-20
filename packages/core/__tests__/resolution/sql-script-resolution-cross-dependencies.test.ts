import { resolve } from '../../src/resolution/resolve';
import {TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch', 'simple', 'packages', 'my-third');
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
