/**
 * What known commands do with their arguments: which operands they read or
 * write, and which forms run hidden code, upload data or destroy things.
 * Everything not listed here gets the generic rule: every operand is a read.
 * The rules for files, git, the network and the machine live in their own
 * modules; this one holds the shells and interpreters and the dispatch.
 */

import * as path from 'node:path';

import type { Arg } from './analyze';
import { type CommandContext, files, generic, leadingOptions, parse } from './args';
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
  'let'
]);

/**
 * Readers whose every operand is a file, with the options that take a value.
 * An operand built from a variable is then a path, not a word: it asks in
 * every mode, as it may name any file.
 */
const READERS = new Map<string, ReadonlySet<string>>([
  ...['cat', 'less', 'more', 'bat', 'wc', 'nl', 'strings', 'file', 'stat', 'cmp', 'diff'].map((n) => [n, new Set<string>()] as const),
  ['head', new Set(['-n', '-c'])],
  ['tail', new Set(['-n', '-c', '-b'])],
  ['sort', new Set(['-k', '-t', '-o', '-S', '-T'])],
  ['uniq', new Set(['-f', '-s'])],
  ['base64', new Set(['-b', '-i', '-o', '-w'])],
  ['xxd', new Set(['-c', '-g', '-l', '-s', '-o'])],
  ['od', new Set(['-A', '-j', '-N', '-t'])],
  ['hexdump', new Set(['-e', '-f', '-n', '-s'])]
]);

/** The test commands: `[` and `[[` are names here, not globs. */
export const TESTS = new Set(['test', '[', '[[']);

/** `[[`'s arithmetic comparisons evaluate their operands as expressions. */
const ARITHMETIC_TESTS = new Set(['-eq', '-ne', '-lt', '-le', '-gt', '-ge']);

/**
 * A test reads the files it names. `-v NAME` (and, in `[[`, an arithmetic
 * comparison) evaluates array subscripts, which can run a substitution even
 * from a quoted word.
 */
function test(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const close = name === '[' ? ']' : name === '[[' ? ']]' : null;
  const operands = close && rest[rest.length - 1]?.text === close ? rest.slice(0, -1) : rest;
  const evaluates = operands.some((a) => a.text === '-v' || (name === '[[' && ARITHMETIC_TESTS.has(a.text)));
  if (evaluates) ctx.analyzer.dynamic(`it runs ${name} with an operator that evaluates expressions`);
  generic(ctx, operands);
}

/** Shell options that take a value; the `*file` ones name a script the shell loads. */
const SHELL_VALUE_OPTIONS = new Set(['-o', '-O', '--rcfile', '--init-file', '--command', '--init-command']);
const SHELL_LOADS = new Set(['--rcfile', '--init-file']);
/** `-c` takes its string from the first operand; fish's long forms carry it. */
const SHELL_INLINE = new Set(['--command', '--init-command']);

/** A word in a shell's option list that is not a plain letter cluster (`-ex`, `+o`). */
const isOddShellOption = (text: string): boolean => /^[-+][^-]/.test(text) && !/^[-+][a-zA-Z]+$/.test(text);

function shell(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  // `+x`, `+o name`: the same options, turned off.
  const words = rest.map((a) => (/^\+[a-zA-Z]/.test(a.text) ? { ...a, text: `-${a.text.slice(1)}` } : a));
  const { options, next } = leadingOptions(words, SHELL_VALUE_OPTIONS);
  const odd = rest.slice(0, next).find((a) => isOddShellOption(a.text));
  if (odd) analyzer.dynamic(`it passes ${name} an option it cannot read: ${odd.raw}`);
  for (const { key, value } of options) if (value && SHELL_LOADS.has(key)) analyzer.operand(value);

  const inline = options.find((o) => SHELL_INLINE.has(o.key));
  const script = inline ? inline.value : options.some((o) => o.key === '-c') ? (rest[next] ?? null) : undefined;
  if (script !== undefined) {
    if (!script || script.unknown) analyzer.dynamic(`it runs ${name} -c with a string from a variable`);
    else analyzer.nested(script.text, `it runs a shell string with ${name} -c`);
    return;
  }
  const file = rest[next];
  if (file && file.text !== '-') {
    analyzer.addPath(file, 'read', true);
    generic(ctx, rest.slice(next + 1));
  } else if (ctx.stdinFed) {
    analyzer.dynamic(`it pipes a script into ${name}`);
  }
}

/**
 * An interpreter's command line: `inline` marks the options whose value is
 * code (`node -e`), `withValue` every option that takes a value, `loads` the
 * ones whose value is a file it loads (`node -r`), and `module` the one that
 * runs a module by name (`python -m`).
 */
interface Interpreter {
  inline: ReadonlySet<string>;
  withValue: ReadonlySet<string>;
  loads?: ReadonlySet<string>;
  module?: string;
  /** Options that end its own options (`python -c`, `python -m`). */
  stopAfter?: ReadonlySet<string>;
  /** Its built-in file server (`php -S`), checked first. */
  server?: (ctx: CommandContext, rest: readonly Arg[]) => void;
  /** The server a module runs (`python -m http.server`), with the module's own arguments. */
  moduleServer?: (ctx: CommandContext, module: string, args: readonly Arg[]) => void;
}

const interpreter = (inline: string[], others: string[], extra: Omit<Interpreter, 'inline' | 'withValue'> = {}): Interpreter => ({
  inline: new Set(inline),
  withValue: new Set([...inline, ...others, ...(extra.loads ?? [])]),
  ...extra
});

const NODE = interpreter(['-e', '-p', '--eval', '--print'], ['--input-type', '--conditions', '-C'], {
  loads: new Set(['-r', '--require', '--import', '--loader', '--experimental-loader'])
});
const SCRIPT_RUNNER = interpreter(['-e'], ['-l']);

/** By program name; every `python*` version is `python`. */
const INTERPRETERS = new Map<string, Interpreter>([
  ['python', interpreter(['-c'], ['-m', '-W', '-X', '-Q'], { module: '-m', stopAfter: new Set(['-c', '-m']), moduleServer: pythonServer })],
  ['node', NODE],
  ['nodejs', NODE],
  ['perl', interpreter(['-e', '-E'], ['-I', '-M', '-m'])],
  ['ruby', interpreter(['-e'], ['-I', '-C'], { loads: new Set(['-r']), server: rubyServer })],
  ['php', interpreter(['-r', '-B', '-R', '-E'], ['-c', '-d', '-S', '-t'], { loads: new Set(['-f']), server: phpServer })],
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
  const { options, next } = leadingOptions(rest, spec.withValue, spec.stopAfter);
  for (const { key, value } of options) {
    if (spec.inline.has(key)) return analyzer.dynamic(`it runs inline code with ${name} ${key}`);
    if (value && spec.loads?.has(key)) analyzer.operand(value);
    if (key === spec.module) {
      if (value && !value.unknown) spec.moduleServer?.(ctx, value.text, rest.slice(next));
      return generic(ctx, rest.slice(next));
    }
  }
  const script = rest[next];
  if (script && script.text !== '-') {
    analyzer.addPath(script, 'read', true);
    generic(ctx, rest.slice(next + 1));
  } else if (ctx.stdinFed) {
    analyzer.dynamic(`it pipes code into ${name}`);
  }
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
  if (TESTS.has(name)) return test(name, ctx, rest);
  const readerValues = READERS.get(name);
  if (readerValues) {
    for (const v of parse(rest, readerValues).positionals) if (v.unknown) analyzer.addPath(v, 'read', true);
    return generic(ctx, rest);
  }
  if (NO_OPERANDS.has(name)) return;
  switch (name) {
  case 'cd':
  case 'pushd': {
    const target = parse(rest).positionals[0];
    if (!target) {
      analyzer.base = path.resolve(analyzer.ctx.homeDir);
    } else if (target.unknown || /^[-+]\d*$/.test(target.text) || analyzer.searchesCdPath(target.text)) {
      // `cd -`, `pushd +1` and a `CDPATH` lookup go to a dir the text does not name.
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
    if (leadingOptions(rest, NODE.inline).options.some((o) => NODE.inline.has(o.key))) {
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
