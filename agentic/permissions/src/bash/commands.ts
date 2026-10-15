/**
 * What known commands do with their arguments: which operands they read or
 * write, and which forms run hidden code, upload data or destroy things.
 * Everything not listed here gets the generic rule: every operand is a read.
 * The rules for files, git, the network and the machine live in their own
 * modules; this one holds the shells and interpreters and the dispatch.
 */

import * as path from 'node:path';

import type { Arg } from './analyze';
import { type CommandContext, files, generic, parse } from './args';
import { awk, chmodLike, copyLike, dd, find, grep, remove, sed, tee } from './file-commands';
import { git } from './git';
import { busyboxServer, curl, phpServer, publishes, pythonServer, remoteCopy, rubyServer, ssh, tunnel, TUNNELS, wget } from './network';
import { CLIPBOARD, clipboard, namesFromStdin, persistence, security } from './system';
import { isPathLike } from './words';

const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'mksh', 'fish', 'ash']);
const AWKS = new Set(['awk', 'gawk', 'mawk', 'nawk']);
const GREPS = new Set(['grep', 'egrep', 'fgrep', 'rg', 'ag', 'ack', 'ggrep']);
const NETWORK_SHELLS = new Set(['nc', 'ncat', 'netcat', 'socat', 'telnet', 'ftp', 'tftp', 'sftp']);
const DISK_TOOLS = /^(mkfs(\..*)?|fdisk|sfdisk|gdisk|parted|wipefs|cryptsetup|newfs(_.*)?)$/;
const PERSISTENCE = new Set(['crontab', 'at', 'batch', 'launchctl', 'defaults']);

/** Commands that take no file operands. */
export const NO_OPERANDS = new Set([
  'echo',
  'printf',
  'true',
  'false',
  ':',
  'exit',
  'return',
  'set',
  'unset',
  'shift',
  'wait',
  'jobs',
  'type',
  'which',
  'hash',
  'alias',
  'unalias',
  'sleep',
  'date',
  'pwd',
  'whoami',
  'clear',
  'kill',
  'trap',
  'read',
  'let',
  'test',
  '['
]);

function shell(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  let k = 0;
  let script: string | null = null;
  for (; k < rest.length; k++) {
    const t = rest[k].text;
    if (t === '--') {
      k++;
      break;
    }
    if (t === '-o' || t === '+o' || t === '-O' || t === '+O') {
      k++;
      continue;
    }
    if (/^[-+][a-zA-Z]+$/.test(t)) {
      if (t.startsWith('-') && t.includes('c')) {
        const value = rest[k + 1];
        if (!value || value.unknown) analyzer.dynamic(`it runs ${name} -c with a string from a variable`);
        else script = value.text;
        break;
      }
      continue;
    }
    if (t.startsWith('--')) continue;
    break;
  }
  if (script !== null) {
    analyzer.nested(script, `it runs a shell string with ${name} -c`);
    return;
  }
  const file = rest[k];
  if (file && file.text !== '-') {
    analyzer.addPath(file, 'read', true);
    generic(ctx, rest.slice(k + 1));
  } else if (ctx.stdinFed) {
    analyzer.dynamic(`it pipes a script into ${name}`);
  }
}

/**
 * An interpreter's command line: `inline` marks code given on it (`node -e`),
 * `withValue` lists the options that take the next word, `loads` the ones whose
 * word is code it loads, and `module` the one that runs a module by name.
 */
interface Interpreter {
  inline: RegExp;
  withValue: ReadonlySet<string>;
  loads?: ReadonlySet<string>;
  module?: string;
  /** Its built-in file server (`python -m http.server`), checked first. */
  server?: (ctx: CommandContext, rest: readonly Arg[]) => void;
}

const NODE_LOADS = ['-r', '--require', '--import', '--loader', '--experimental-loader'];
const NODE: Interpreter = {
  inline: /^(-[a-zA-Z]*[ep]|--eval|--print)$/,
  withValue: new Set([...NODE_LOADS, '--input-type', '--conditions', '-C']),
  loads: new Set(NODE_LOADS)
};
const SCRIPT_RUNNER: Interpreter = { inline: /^-e$/, withValue: new Set(['-l']) };

/** By program name; every `python*` version is `python`. */
const INTERPRETERS = new Map<string, Interpreter>([
  ['python', { inline: /^-[a-zA-Z]*c$/, withValue: new Set(['-m', '-W', '-X', '-Q']), module: '-m', server: pythonServer }],
  ['node', NODE],
  ['nodejs', NODE],
  ['perl', { inline: /^-[a-zA-Z]*[eE][a-zA-Z]*$/, withValue: new Set(['-I', '-M']) }],
  ['ruby', { inline: /^-[a-zA-Z]*e$/, withValue: new Set(['-I', '-r']), loads: new Set(['-r']), server: rubyServer }],
  ['php', { inline: /^-r$/, withValue: new Set(['-c', '-d']), server: phpServer }],
  ['lua', SCRIPT_RUNNER],
  ['luajit', SCRIPT_RUNNER],
  ['Rscript', SCRIPT_RUNNER],
  ['osascript', SCRIPT_RUNNER]
]);

function interpreterOf(name: string): Interpreter | undefined {
  return INTERPRETERS.get(/^python[0-9.]*$/.test(name) ? 'python' : name);
}

/** The script an interpreter runs is a read; inline code or piped code is dynamic. */
function interpret(name: string, spec: Interpreter, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  spec.server?.(ctx, rest);
  for (let k = 0; k < rest.length; k++) {
    const t = rest[k].text;
    if (spec.inline.test(t)) {
      analyzer.dynamic(`it runs inline code with ${name} ${t}`);
      return;
    }
    if (spec.withValue.has(t)) {
      const value = rest[k + 1];
      if (value && spec.loads?.has(t)) analyzer.operand(value);
      if (t === spec.module) return generic(ctx, rest.slice(k + 2));
      k++;
      continue;
    }
    if (t.startsWith('-') && t !== '-') continue;
    if (t === '-') break;
    analyzer.addPath(rest[k], 'read', true);
    generic(ctx, rest.slice(k + 1));
    return;
  }
  if (ctx.stdinFed) analyzer.dynamic(`it pipes code into ${name}`);
}

export function runCommand(name: string, rest: readonly Arg[], ctx: CommandContext): void {
  const { analyzer } = ctx;
  publishes(name, ctx, rest);
  if (ctx.stdinFed && namesFromStdin(name, rest)) {
    const words = analyzer.stdin.words;
    if (words === null) analyzer.flag('stdin-operands', `${name} takes file names from its input, which cannot be checked before it runs`);
    else for (const w of words) analyzer.addPath(w, 'read', true);
  }
  if (SHELLS.has(name)) return shell(name, ctx, rest);
  const spec = interpreterOf(name);
  if (spec) return interpret(name, spec, ctx, rest);
  if (AWKS.has(name)) return awk(name, ctx, rest);
  if (GREPS.has(name)) return grep(ctx, rest);
  if (NETWORK_SHELLS.has(name)) {
    analyzer.flag('upload', `it uploads data: ${name} opens a raw network connection`);
    return generic(ctx, rest.filter((a) => isPathLike(a.text)));
  }
  if (TUNNELS.has(name)) return tunnel(name, ctx, rest);
  if (PERSISTENCE.has(name)) return persistence(name, ctx, rest);
  if (CLIPBOARD.has(name)) return clipboard(name, ctx, rest);
  if (DISK_TOOLS.test(name)) {
    analyzer.flag('destructive', `it runs ${name}, which formats or partitions a disk`);
    return;
  }
  if (NO_OPERANDS.has(name)) {
    if (name === 'test' || name === '[') generic(ctx, rest);
    return;
  }
  switch (name) {
  case 'cd':
  case 'pushd': {
    const target = parse(rest).positionals[0];
    if (!target) {
      analyzer.base = path.resolve(analyzer.ctx.homeDir);
    } else if (target.unknown || target.text === '-') {
      analyzer.base = null;
    } else {
      const abs = analyzer.toAbs(target.text);
      analyzer.addPath(target, 'read', true);
      analyzer.base = abs === null ? null : path.resolve(abs);
    }
    return;
  }
  case 'popd':
    analyzer.base = null;
    return;
  case 'export':
  case 'declare':
  case 'local':
  case 'readonly':
  case 'typeset':
    for (const arg of rest) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/s.exec(arg.text);
      if (m) analyzer.assign(m[1], arg.unknown ? null : m[2]);
    }
    return;
  case 'eval':
    if (rest.some((a) => a.unknown)) analyzer.dynamic('it runs eval on a value from a variable');
    else analyzer.nested(rest.map((a) => a.text).join(' '), 'it runs a string with eval');
    return;
  case 'source':
  case '.':
    analyzer.dynamic(`it loads a script into the shell with ${name}`);
    if (rest[0]) analyzer.addPath(rest[0], 'read', true);
    return;
  case 'deno':
    if (rest[0]?.text === 'eval') return analyzer.dynamic('it runs inline code with deno eval');
    return generic(ctx, rest);
  case 'bun':
    if (rest.some((a) => a.text === '-e' || a.text === '--eval' || a.text === '-p' || a.text === '--print')) {
      return analyzer.dynamic('it runs inline code with bun -e');
    }
    return generic(ctx, rest);
  case 'curl':
    return curl(ctx, rest);
  case 'wget':
    return wget(ctx, rest);
  case 'scp':
  case 'rsync':
    return remoteCopy(name, ctx, rest);
  case 'ssh':
    return ssh(ctx, rest);
  case 'security':
    return security(ctx, rest);
  case 'busybox':
    if (rest[0]?.text === 'httpd') return busyboxServer(ctx, rest.slice(1));
    if (rest[0]) return runCommand(path.basename(rest[0].text), rest.slice(1), ctx);
    return;
  case 'find':
    return find(ctx, rest);
  case 'git':
    return git(ctx, rest);
  case 'sed':
  case 'gsed':
    return sed(ctx, rest);
  case 'rm':
  case 'rmdir':
  case 'unlink':
  case 'shred':
  case 'rimraf':
  case 'srm':
    return remove(name, ctx, rest);
  case 'touch':
  case 'mkdir':
  case 'mkfifo':
  case 'truncate':
    return files(ctx, parse(rest, new Set(['-m', '--mode', '-s', '--size', '-r', '--reference', '-t', '-d'])).positionals, 'write');
  case 'tee':
    return tee(ctx, rest);
  case 'cp':
  case 'mv':
  case 'ln':
  case 'install':
    return copyLike(name, ctx, rest);
  case 'chmod':
  case 'chown':
  case 'chgrp':
    return chmodLike(name, ctx, rest);
  case 'dd':
    return dd(ctx, rest);
  case 'diskutil':
    if (rest.some((a) => /^(erase|zero|partition|secureErase|reformat)/i.test(a.text))) {
      analyzer.flag('destructive', 'it runs diskutil to erase or partition a disk');
    }
    return;
  default:
    return generic(ctx, rest);
  }
}
