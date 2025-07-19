import { TestFixture, cleanText } from '../../test-utils';
import { packageModule } from '../../src/packaging/package';

let fixtures: TestFixture[];

beforeAll(() => {
    fixtures = [
        new TestFixture('migrate', 'simple'),
        new TestFixture('migrate', 'simple'),
        new TestFixture('migrate', 'simple'),
    ];
});

afterAll(() => {
    fixtures.forEach(fixture => fixture.cleanup());
});

it('my-first extension', async () => {
    const { sql } = await packageModule(fixtures[0].tempFixtureDir);
    expect(sql).toMatchSnapshot();
});

it('my-first extension via plan', async () => {
    const { sql } = await packageModule(fixtures[0].tempFixtureDir, { usePlan: true });
    expect(sql).toMatchSnapshot();
});

it('my-second extension', async () => {
    const { sql } = await packageModule(fixtures[1].tempFixtureDir);
    expect(sql).toMatchSnapshot();
});

it('my-second extension via plan', async () => {
    const { sql } = await packageModule(fixtures[1].tempFixtureDir, { usePlan: true });
    expect(sql).toMatchSnapshot();
});

it('my-third extension', async () => {
    const { sql } = await packageModule(fixtures[2].tempFixtureDir);
    expect(sql).toMatchSnapshot();
});

it('my-third extension via plan', async () => {
    const { sql } = await packageModule(fixtures[2].tempFixtureDir, { usePlan: true });
    expect(sql).toMatchSnapshot();
});
