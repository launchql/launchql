import { getGraphQLEnvVars } from '../src/env';
import { getEnvOptions } from '../src/merge';

const RELEASE_ENV = {
  CONSTRUCTIVE_RELEASE_HUB: '880',
  CONSTRUCTIVE_RELEASE_CONSTRUCTIVE: '91e18cc',
  CONSTRUCTIVE_RELEASE_CONSTRUCTIVE_DB: 'f14937c',
  CONSTRUCTIVE_RELEASE_DASHBOARD: '1623557',
  CONSTRUCTIVE_RELEASE_FUNCTIONS: 'f14937c'
};
const RELEASE = {
  hub: '880',
  constructive: '91e18cc',
  constructiveDb: 'f14937c',
  dashboard: '1623557',
  functions: 'f14937c'
};

describe('release tuple environment variables', () => {
  it('leaves the release absent when no CONSTRUCTIVE_RELEASE_* variable is set', () => {
    expect(getGraphQLEnvVars({}).release).toBeUndefined();
  });

  it('maps the operator-injected CONSTRUCTIVE_RELEASE_* variables to the release tuple', () => {
    expect(getGraphQLEnvVars(RELEASE_ENV).release).toEqual(RELEASE);
    expect(getEnvOptions({}, process.cwd(), RELEASE_ENV).release).toEqual(RELEASE);
  });

  it.each(Object.keys(RELEASE_ENV))('rejects a tuple missing %s', (name) => {
    const env: NodeJS.ProcessEnv = { ...RELEASE_ENV };
    delete env[name];
    expect(() => getGraphQLEnvVars(env)).toThrow(name);
  });

  it.each(Object.keys(RELEASE_ENV))('rejects an empty %s', (name) => {
    expect(() => getGraphQLEnvVars({ ...RELEASE_ENV, [name]: ' ' })).toThrow(name);
  });
});
