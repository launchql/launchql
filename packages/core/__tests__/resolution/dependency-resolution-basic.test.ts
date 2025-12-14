import { resolveExtensionDependencies, resolveDependencies } from '../../src/resolution/deps';
import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('sqitch package dependencies [utils]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('launchql', 'packages', 'utils'),
    'utils'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/1st]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple', 'packages', 'my-first'),
    'my-first'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/2nd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple', 'packages', 'my-second'),
    'my-second'
  );
  expect(res).toMatchSnapshot();
});

it('sqitch package dependencies [simple/3rd]', async () => {
  const res = await resolveDependencies(
    fixture.getFixturePath('simple', 'packages', 'my-third'),
    'my-third'
  );
  expect(res).toMatchSnapshot();
});

it('launchql project extensions dependencies', async () => {
  const pkg = new PgpmPackage(fixture.getFixturePath('launchql'));
  const modules = pkg.listModules();

  const utils = await resolveExtensionDependencies('utils', modules);
  expect(utils).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp',
      'utils'
    ]
  });

  const secrets = await resolveExtensionDependencies('secrets', modules);
  expect(secrets).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp',
      'secrets'
    ]
  });

  const totp = await resolveExtensionDependencies('totp', modules);
  expect(totp).toEqual({
    external: ['plpgsql', 'uuid-ossp', 'pgcrypto'],
    resolved: [
      'plpgsql',
      'uuid-ossp',
      'pgcrypto',
      'pg-utilities',
      'pg-verify',
      'totp'
    ]
  });
});
