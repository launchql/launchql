/**
 * git: options that make it run programs, pushes that rewrite or leave for an
 * unknown remote, config writes, and force-adding a secret file.
 */

import * as path from 'node:path';

import { isSecretFile } from '../secret-files';
import type { Arg } from './analyze';
import { type CommandContext, generic, has, parse, type Parsed, valuesOf } from './args';
import { isRemoteSpec, isUrl } from './words';

/** `git -c` keys that make git run a program. */
const GIT_EXEC_CONFIG =
  /^(alias\.|core\.(sshcommand|pager|editor|fsmonitor|hookspath|askpass|gitproxy)|diff\.|credential\.|sequence\.editor|gpg\.|filter\.|uploadpack\.|protocol\.|include\.|includeif\.|remote\..*\.(uploadpack|receivepack))/i;

/** `git -c remote.<name>.url=…`: the remote points somewhere else for this run. */
const GIT_REMOTE_URL_CONFIG = /^remote\.(.+)\.(url|pushurl)=/i;

/**
 * `git push`: destructive when it rewrites or deletes refs, and an upload when
 * it goes to a URL or to a remote this command added or repointed.
 */
function push(ctx: CommandContext, p: Parsed): void {
  const { analyzer } = ctx;
  const force =
    has(p, '-f', '--force', '--force-if-includes', '--mirror', '-d', '--delete', '--prune') ||
    [...p.flags].some((f) => f.startsWith('--force-with-lease')) ||
    p.positionals.some((a) => a.text.startsWith('+') || a.text.startsWith(':'));
  if (force) analyzer.flag('destructive', 'it force-pushes or deletes refs on the remote');
  const remote = valuesOf(p, '--repo')[0] ?? p.positionals[0];
  if (!remote) {
    if (analyzer.gitRemotes.size > 0) analyzer.flag('upload', 'it uploads data: git push goes to a remote this command changed');
    return;
  }
  if (remote.unknown || isUrl(remote.text) || isRemoteSpec(remote.text)) {
    analyzer.flag('upload', `it uploads data: git push sends commits to ${remote.raw}`);
  } else if (analyzer.gitRemotes.has(remote.text)) {
    analyzer.flag('upload', `it uploads data: git push goes to ${remote.raw}, a remote this command set`);
  }
}

/** `git remote add|set-url NAME URL`: remember the name, so a later push is an upload. */
function remote(ctx: CommandContext, args: readonly Arg[]): void {
  const p = parse(args, new Set(['-t', '-m']));
  const [action, name] = p.positionals;
  if ((action?.text === 'add' || action?.text === 'set-url') && name) ctx.analyzer.gitRemotes.add(name.text);
}

/** `git add -f .env`: stages a file `.gitignore` keeps out, so its values would be committed. */
function add(ctx: CommandContext, args: readonly Arg[]): void {
  const p = parse(args, new Set(['--chmod', '--pathspec-from-file']));
  if (has(p, '-f', '--force')) {
    for (const op of p.positionals) {
      if (op.unknown || !isSecretFile(op.text)) continue;
      ctx.analyzer.flag('secret-file', `git add -f stages the secret file ${op.raw}, which .gitignore keeps out of the repo`);
      ctx.analyzer.flag('secret-into-plain-file', `git add -f puts ${op.raw} into the repo, where its values are committed in the clear`);
    }
  }
  generic(ctx, p.positionals.filter((a) => !isUrl(a.text)));
}

export function git(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  let k = 0;
  let base = analyzer.base;
  for (; k < rest.length; k++) {
    const t = rest[k].text;
    if (t === '-C') {
      const dir = rest[++k];
      base = dir && !dir.unknown && base !== null ? path.resolve(base, dir.text) : null;
      if (dir) analyzer.addPath(dir, 'read', true);
    } else if (t === '-c') {
      const kv = rest[++k];
      if (kv && GIT_EXEC_CONFIG.test(kv.text)) analyzer.dynamic(`git -c ${kv.text} makes git run a program`);
      const repointed = kv ? GIT_REMOTE_URL_CONFIG.exec(kv.text) : null;
      if (repointed) analyzer.gitRemotes.add(repointed[1]);
    } else if (/^--(git-dir|work-tree)=/.test(t)) {
      analyzer.addPath({ ...rest[k], text: t.slice(t.indexOf('=') + 1) }, 'read', true);
    } else if (t.startsWith('--exec-path')) {
      analyzer.dynamic('git --exec-path changes which programs git runs');
    } else if (!t.startsWith('-')) {
      break;
    }
  }
  const sub = rest[k]?.text;
  const args = rest.slice(k + 1);
  const saved = analyzer.base;
  analyzer.base = base;
  try {
    if (sub === 'remote') return remote(ctx, args);
    if (sub === 'add') return add(ctx, args);
    if (sub === 'push') return push(ctx, parse(args, new Set(['--repo', '-o', '--push-option', '--receive-pack', '--exec'])));
    const p = parse(args, new Set(['-m', '-F', '-C', '-c', '--file', '-f', '-o', '--message', '--format']));
    const here: Arg = { text: '.', raw: rest[k]?.raw ?? '.', unknown: base === null, glob: false };
    if (sub === 'reset' && has(p, '--hard')) analyzer.destroy(here, 'git reset --hard');
    if (sub === 'clean' && has(p, '-f', '--force')) analyzer.destroy(here, 'git clean -f');
    if (sub === 'config') {
      const reads = has(p, '--get', '--get-all', '--get-regexp', '--get-urlmatch', '--list', '-l', '--show-origin');
      const edits = has(p, '--add', '--unset', '--unset-all', '--replace-all', '--rename-section', '--remove-section', '-e', '--edit');
      if (!reads && (edits || p.positionals.length >= 2)) {
        const file = valuesOf(p, '--file', '-f')[0];
        if (file) analyzer.addPath(file, 'write', true);
        else if (has(p, '--global')) analyzer.addPath({ ...here, text: `${analyzer.ctx.homeDir}/.gitconfig` }, 'write', true);
        else if (has(p, '--system')) analyzer.addPath({ ...here, text: '/etc/gitconfig' }, 'write', true);
        else analyzer.addPath({ ...here, text: '.git/config', raw: '.git/config' }, 'write', true);
      }
      return;
    }
    for (const f of valuesOf(p, '-F', '--file')) analyzer.addPath(f, 'read', true);
    generic(ctx, p.positionals.filter((a) => !isUrl(a.text)));
  } finally {
    analyzer.base = saved;
  }
}
