/**
 * The fixed places the engine knows about, and the zone a path falls in.
 *
 * Roots are canonicalized once per engine, so `/tmp/x` and `/private/tmp/x`
 * (macOS) compare equal. Each root keeps its lexical spelling too, so a list
 * entry still matches when the root itself is a symlink or does not exist yet.
 */

import * as os from 'node:os';
import * as path from 'node:path';

import { globReaches } from './glob';
import { canonicalize, CASE_INSENSITIVE_FS, contains } from './paths';
import type { Access, FsProbe, Zone } from './types';

/** One fixed place, relative to the home dir or a workspace, and what it is in words. */
export interface KnownPath {
  rel: string;
  label: string;
}

/** The macOS keychain dir. The bash analyzer counts a `security` read as a read of it. */
export const KEYCHAIN_DIR = 'Library/Keychains';

/** Credential stores under the home dir. Read, write and run there are DENY in every mode. */
export const HOME_HARD_DENY: readonly KnownPath[] = [
  { rel: '.ssh', label: 'SSH keys' },
  { rel: '.aws', label: 'AWS credentials' },
  { rel: '.gnupg', label: 'GPG keys' },
  { rel: '.config/gh', label: 'GitHub CLI credentials' },
  { rel: '.config/gcloud', label: 'Google Cloud credentials' },
  { rel: '.azure', label: 'Azure credentials' },
  { rel: '.kube', label: 'Kubernetes credentials' },
  { rel: '.docker/config.json', label: 'Docker credentials' },
  { rel: '.netrc', label: 'network credentials' },
  { rel: '.npmrc', label: 'npm credentials' },
  { rel: '.pypirc', label: 'PyPI credentials' },
  { rel: '.git-credentials', label: 'git credentials' },
  { rel: '.pgpass', label: 'Postgres passwords' },
  { rel: KEYCHAIN_DIR, label: 'macOS keychain' },
  { rel: 'Library/Application Support/Google/Chrome', label: 'browser profile' },
  { rel: 'Library/Application Support/Firefox', label: 'browser profile' },
  { rel: 'Library/Application Support/BraveSoftware', label: 'browser profile' },
  { rel: 'Library/Application Support/Arc', label: 'browser profile' }
];

export function defaultHardDeny(homeDir: string): string[] {
  return HOME_HARD_DENY.map(({ rel }) => path.join(path.resolve(homeDir), rel));
}

/** Scratch dirs the agent may read and write without a prompt. */
export function defaultTempDirs(): string[] {
  const dirs = [os.tmpdir(), '/tmp', '/private/tmp'];
  if (process.platform === 'darwin') dirs.push('/private/var/folders');
  return [...new Set(dirs.map((d) => path.resolve(d)))];
}

/** Inside each workspace: writes are DENY in every mode (pi loads extensions from here). */
export const WORKSPACE_PROTECTED_WRITE: readonly KnownPath[] = [{ rel: '.pi', label: 'agent extension dir' }];

/** Inside each workspace: writes run code later, so they ask outside Full mode. */
export const WORKSPACE_ASK_WRITE: readonly KnownPath[] = [
  { rel: '.git/hooks', label: 'git hook' },
  { rel: '.git/config', label: 'git config' },
  { rel: '.husky', label: 'git hook' },
  { rel: '.envrc', label: 'direnv script' },
  { rel: '.vscode/tasks.json', label: 'editor task config' }
];

/** One root: the canonical path plus the lexical spelling, and what it is for. */
export interface Root {
  path: string;
  lexical: string;
  label: string;
}

export interface Roots {
  workspace: Root[];
  trustedRead: Root[];
  trustedExec: Root[];
  temp: Root[];
  hardDeny: Root[];
  /** Writes are DENY: the trusted roots, `<ws>/.pi`, and host entries. */
  protectedWrite: Root[];
  /** Writes ask outside Full mode. */
  askWrite: Root[];
}

export interface RootsSpec {
  cwd: string;
  homeDir: string;
  workspace?: string[];
  trustedRead?: string[];
  trustedExec?: string[];
  temp?: string[];
  hardDeny?: string[];
  protectedWrite?: string[];
  askWrite?: string[];
}

async function makeRoot(p: string, label: string, fs: FsProbe): Promise<Root> {
  const lexical = path.resolve(p);
  const canonical = await canonicalize(lexical, fs);
  return { path: canonical ?? lexical, lexical, label };
}

const HOST_HARD_DENY_LABEL = 'app data the agent may not touch';

/** Host hard-deny paths listed at decision time (a folder made during the session). */
export function buildHostHardDeny(paths: readonly string[], fs: FsProbe): Promise<Root[]> {
  return Promise.all(paths.map((p) => makeRoot(p, HOST_HARD_DENY_LABEL, fs)));
}

/** Canonicalize every root once. */
export async function buildRoots(spec: RootsSpec, fs: FsProbe): Promise<Roots> {
  const labelled = (list: readonly string[] | undefined, label: string) => (list ?? []).map((p) => ({ p, label }));
  const known = (base: string, list: readonly KnownPath[]) => list.map(({ rel, label }) => ({ p: path.join(base, rel), label }));
  const build = (entries: { p: string; label: string }[]) => Promise.all(entries.map(({ p, label }) => makeRoot(p, label, fs)));

  const workspaceDirs = spec.workspace?.length ? spec.workspace : [spec.cwd];
  const trustedRead = labelled(spec.trustedRead, 'trusted harness files');
  const trustedExec = labelled(spec.trustedExec, 'trusted harness scripts');

  const [workspace, tRead, tExec, temp, hardDeny, protectedWrite, askWrite] = await Promise.all([
    build(labelled(workspaceDirs, 'project')),
    build(trustedRead),
    build(trustedExec),
    build(labelled(spec.temp ?? defaultTempDirs(), 'temp dir')),
    build([...known(path.resolve(spec.homeDir), HOME_HARD_DENY), ...labelled(spec.hardDeny, HOST_HARD_DENY_LABEL)]),
    build([
      ...trustedRead,
      ...trustedExec,
      ...workspaceDirs.flatMap((ws) => known(ws, WORKSPACE_PROTECTED_WRITE)),
      ...labelled(spec.protectedWrite, 'protected by the host')
    ]),
    build([...workspaceDirs.flatMap((ws) => known(ws, WORKSPACE_ASK_WRITE)), ...labelled(spec.askWrite, 'file that can run code')])
  ]);
  return { workspace, trustedRead: tRead, trustedExec: tExec, temp, hardDeny, protectedWrite, askWrite };
}

/** The first root that holds `p`, matching either spelling. */
export function findRoot(roots: readonly Root[], p: string, caseInsensitive = false): Root | undefined {
  return roots.find((r) => contains(r.path, p, caseInsensitive) || contains(r.lexical, p, caseInsensitive));
}

export interface ZoneHit {
  zone: Zone;
  root?: Root;
}

/**
 * Where a canonical path sits for one access, most specific first:
 * hard-deny > protected (writes) > ask-write (writes) > trusted > workspace > temp > outside.
 * The restrictive lists match case-insensitively on macOS and Windows.
 */
export function zoneOf(p: string, access: Access, roots: Roots): ZoneHit {
  const ci = CASE_INSENSITIVE_FS;
  let root = findRoot(roots.hardDeny, p, ci);
  if (root) return { zone: 'hard-deny', root };
  if (access === 'write') {
    root = findRoot(roots.protectedWrite, p, ci);
    if (root) return { zone: 'protected', root };
    root = findRoot(roots.askWrite, p, ci);
    if (root) return { zone: 'ask-write', root };
  }
  if (access !== 'exec') {
    root = findRoot(roots.trustedRead, p);
    if (root) return { zone: 'trusted', root };
  }
  root = findRoot(roots.trustedExec, p);
  if (root) return { zone: 'trusted', root };
  root = findRoot(roots.workspace, p);
  if (root) return { zone: 'workspace', root };
  root = findRoot(roots.temp, p);
  if (root) return { zone: 'temp', root };
  return { zone: 'outside' };
}

/**
 * The strictest restrictive zone a glob path could expand into: hard-deny,
 * then (writes) protected and ask-write. `undefined` when it reaches none.
 */
export function globZoneOf(pattern: string, access: Access, roots: Roots, dot: boolean): ZoneHit | undefined {
  const opts = { dot, caseInsensitive: CASE_INSENSITIVE_FS };
  const reached = (list: readonly Root[]) =>
    list.find((r) => globReaches(pattern, r.path, opts) || globReaches(pattern, r.lexical, opts));
  let root = reached(roots.hardDeny);
  if (root) return { zone: 'hard-deny', root };
  if (access !== 'write') return undefined;
  root = reached(roots.protectedWrite);
  if (root) return { zone: 'protected', root };
  root = reached(roots.askWrite);
  return root ? { zone: 'ask-write', root } : undefined;
}

/** `p` is exactly one of the roots (a workspace or temp root itself). */
export function isRootItself(roots: readonly Root[], p: string): boolean {
  return roots.some((r) => r.path === p || r.lexical === p);
}
