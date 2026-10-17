import type { ConstructiveOptions, ReleaseOptions } from '@constructive-io/graphql-types';
import supertest from 'supertest';

import { Server } from '../../server';
import { createReleaseHandler } from '../release';

// Field list consumed by constructive-hub tests/acceptance/graphql.ts
// (RELEASE_FIELDS) and the .github/workflows/live.yml preflight.
const RELEASE_FIELDS = ['hub', 'constructive', 'constructiveDb', 'dashboard', 'functions'];
const RELEASE_ENV = {
  CONSTRUCTIVE_RELEASE_HUB: '880',
  CONSTRUCTIVE_RELEASE_CONSTRUCTIVE: '91e18cc',
  CONSTRUCTIVE_RELEASE_CONSTRUCTIVE_DB: 'f14937c',
  CONSTRUCTIVE_RELEASE_DASHBOARD: '1623557',
  CONSTRUCTIVE_RELEASE_FUNCTIONS: 'f14937c'
};

const appWith = (env: Record<string, string>) => {
  const previous = { ...process.env };
  Object.assign(process.env, env);
  try {
    const server = new Server({} as ConstructiveOptions);
    return (server as unknown as { app: Parameters<typeof supertest>[0] }).app;
  } finally {
    process.env = previous;
  }
};

describe('GET /.well-known/constructive-release', () => {
  it('serves the operator-injected release tuple as JSON on any host', async () => {
    const res = await supertest(appWith(RELEASE_ENV))
      .get('/.well-known/constructive-release')
      .set('Host', 'api.launchql.dev')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect('Cache-Control', 'no-store');

    expect(Object.keys(res.body).sort()).toEqual([...RELEASE_FIELDS].sort());
    expect(res.body).toEqual({
      hub: '880',
      constructive: '91e18cc',
      constructiveDb: 'f14937c',
      dashboard: '1623557',
      functions: 'f14937c'
    });
  });
});

describe('createReleaseHandler', () => {
  const RELEASE = {
    hub: '880',
    constructive: '91e18cc',
    constructiveDb: 'f14937c',
    dashboard: '1623557',
    functions: 'f14937c'
  };

  it.each(RELEASE_FIELDS)('rejects a runtime release option missing %s', (field) => {
    const release = { ...RELEASE } as Record<string, string>;
    delete release[field];
    expect(() => createReleaseHandler(release as unknown as ReleaseOptions)).toThrow(field);
  });

  it.each(RELEASE_FIELDS)('rejects a runtime release option with an empty %s', (field) => {
    expect(() => createReleaseHandler({ ...RELEASE, [field]: ' ' })).toThrow(field);
  });

  it('refuses to construct a Server from a partial runtime release option', () => {
    expect(
      () => new Server({ release: { hub: '880' } } as unknown as ConstructiveOptions)
    ).toThrow('constructiveDb');
  });
});
