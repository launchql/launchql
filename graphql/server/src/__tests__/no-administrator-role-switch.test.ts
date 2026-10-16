import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Nothing in the server stack may become `administrator`: it bypasses RLS, and
 * the only way past RLS is a SECURITY DEFINER function. Request work runs as
 * the request's own `anonymous`/`authenticated` role; server-owned reads run on
 * the connection's login and reach only what its grants allow.
 *
 * This scans every runtime source file the GraphQL server is built from for a
 * role switch (or a role setting) naming `administrator`.
 */
const repoRoot = join(__dirname, '../../../..');
const sourceRoots = ['graphile', 'graphql', 'packages', 'postgres', 'uploads'];

const ROLE_SWITCHES: RegExp[] = [
  /\bSET\s+(?:LOCAL\s+|SESSION\s+)?ROLE\s+(?:TO\s+)?["']?administrator\b/i,
  /set_config\(\s*'role'\s*,\s*'administrator'/i,
  /\b(?:role|roleName|anonRole|introspectionRole)\b['"]?\s*[:=]\s*['"]administrator['"]/,
  /\[\s*['"]role['"]\s*\]\s*=\s*['"]administrator['"]/,
  /\b(?:SYSTEM_LANE_ROLE|VERIFIER_ROLE)\b/
];

const isTestPath = (path: string): boolean =>
  /(^|\/)(__tests__|__fixtures__|test-utils)(\/|$)|\.test\.tsx?$|\.spec\.tsx?$/.test(path);

const runtimeSources = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      runtimeSources(full, out);
    } else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
      out.push(full);
    }
  }
  return out;
};

const packageSources = (): string[] =>
  sourceRoots.flatMap((root) =>
    readdirSync(join(repoRoot, root))
      .map((pkg) => join(repoRoot, root, pkg, 'src'))
      .filter((src) => {
        try {
          return statSync(src).isDirectory();
        } catch {
          return false;
        }
      })
      .flatMap((src) => runtimeSources(src))
  ).filter((file) => !isTestPath(relative(repoRoot, file)));

describe('no role switch to administrator', () => {
  it('scans the server stack', () => {
    const files = packageSources();
    expect(files.length).toBeGreaterThan(100);
    expect(files.map((f) => relative(repoRoot, f))).toContain('graphql/server/src/middleware/api.ts');
  });

  it('finds no source that switches to or configures the administrator role', () => {
    const offenders = packageSources().flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, at: `${relative(repoRoot, file)}:${i + 1}` }))
        .filter(({ line }) => ROLE_SWITCHES.some((re) => re.test(line)))
        .map(({ at, line }) => `${at}  ${line.trim()}`)
    );
    expect(offenders).toEqual([]);
  });
});
