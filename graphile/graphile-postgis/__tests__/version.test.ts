import PostgisVersionPlugin from '../src/PostgisVersionPlugin';

type HookFn = (build: any) => any;

const getBuildHook = (): HookFn => {
  let hook: HookFn | null = null;
  const builder = {
    hook: (_name: string, fn: HookFn) => {
      hook = fn;
    }
  };

  PostgisVersionPlugin(builder as any, {} as any);

  if (!hook) {
    throw new Error('Version plugin hook was not registered');
  }
  return hook;
};

describe('PostgisVersionPlugin', () => {
  it('throws when graphile-build is too old to provide versions', () => {
    const hook = getBuildHook();
    expect(() => hook({ graphileBuildVersion: '0.0.0' })).toThrow(
      /graphile-build@\^4\.1\.0/i
    );
  });

  it('throws when graphile-build-pg requirement is unmet', () => {
    const hook = getBuildHook();
    expect(() =>
      hook({
        versions: { 'graphile-build': '4.1.0' },
        hasVersion: (_name: string) => false,
        extend: Object.assign,
        graphileBuildVersion: '4.1.0'
      })
    ).toThrow(/graphile-build-pg@\^4\.4\.0/i);
  });

  it('registers its own version when requirements are satisfied', () => {
    const hook = getBuildHook();
    const build = {
      versions: { 'graphile-build': '4.14.1', 'graphile-build-pg': '4.14.1' },
      hasVersion: (_name: string, _range: string) => true,
      extend: Object.assign,
      graphileBuildVersion: '4.14.1'
    };
    const result = hook(build);
    expect(result.versions['graphile-postgis']).toBeDefined();
  });
});
