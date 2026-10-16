/**
 * Wrappers that run another command (`env`, `sudo`, `timeout`, `xargs`, …).
 * They come off the front of a command before its rules apply, so `/bin/rm`,
 * `command rm` and `env rm` are all `rm`.
 */

import * as path from 'node:path';

import type { Analyzer, Arg } from './analyze';
import { leadingOptions } from './args';
import { NO_OPERANDS } from './commands';

/** How `xargs` feeds the command it runs. */
export interface XargsInput {
  /** `xargs -I {}`: the string each input line replaces. */
  replace?: string;
  /** `xargs -a file`: the input comes from a file, not stdin. */
  fromFile: boolean;
}

/** What the wrappers taken off so far change about the command they run. */
export interface WrapperScope {
  sudo: boolean;
  /** Set once `xargs` came off: more operands arrive from its input. */
  xargs: XargsInput | null;
  /** `env -C dir` moved the working dir for this one command. */
  chdir: boolean;
}

/** `xargs` options whose value is the next word (`-i`, `-e`, `-l` and `--replace` take only a glued one). */
const XARGS_WITH_VALUE = /^-[InPLdEsa]$|^--(max-args|max-procs|max-lines|delimiter|eof|max-chars|arg-file)$/;

function xargs(analyzer: Analyzer, args: Arg[], i: number, scope: WrapperScope): number {
  const input = (scope.xargs ??= { fromFile: false });
  let k = i + 1;
  while (k < args.length) {
    const t = args[k].text;
    if (t === '--') return k + 1;
    if (t === '-I') input.replace = args[k + 1]?.text ?? '{}';
    else if (t === '-i' || t === '--replace') input.replace = '{}';
    else if (/^-[Ii]./.test(t)) input.replace = t.slice(2);
    else if (t.startsWith('--replace=')) input.replace = t.slice('--replace='.length);
    if (t === '-a' || t === '--arg-file' || t.startsWith('--arg-file=')) {
      input.fromFile = true;
      const file = t.startsWith('--arg-file=') ? { ...args[k], text: t.slice('--arg-file='.length) } : args[k + 1];
      if (file) analyzer.addPath(file, 'read', true);
    }
    if (XARGS_WITH_VALUE.test(t)) k += 2;
    else if (t.startsWith('-') && t !== '-') k++;
    else break;
  }
  return k;
}

/**
 * The operands of the command `xargs` runs. The words on stdin join them when
 * they are known, and the roots of a file listing stand in for the names it
 * prints. Otherwise the names cannot be seen, which is a signal.
 */
export function xargsOperands(analyzer: Analyzer, name: string, rest: Arg[], input: XargsInput): Arg[] {
  const { replace } = input;
  const { words, listedUnder } = input.fromFile ? { words: null, listedUnder: null } : analyzer.stdin;
  if (words !== null) {
    if (!replace) return [...rest, ...words];
    return rest.flatMap((a) => (a.text.includes(replace) ? words.map((w) => ({ ...a, text: a.text.split(replace).join(w.text) })) : [a]));
  }
  if (listedUnder !== null) {
    if (!replace) return [...rest, ...listedUnder];
    return rest.flatMap((a) => (a.text.includes(replace) ? listedUnder : [a]));
  }
  if (!NO_OPERANDS.has(name)) {
    analyzer.flag('stdin-operands', `xargs gives ${name} file names from its input, which cannot be checked before it runs`);
  }
  return rest;
}

const ENV_VALUE_OPTIONS = new Set(['-u', '--unset', '-C', '--chdir', '-S', '--split-string']);
const RUNNER_VALUE_OPTIONS = new Set(['-c', '--call', '-p', '--package']);

/**
 * `npx -c 'cmd'`, `pnpm exec --call=cmd`: the runner's options from `from` up
 * to the package name, its `-c` shell string, and where the package name is.
 */
function runnerOptions(args: Arg[], from: number): { call: Arg | null | undefined; next: number } {
  const { options, next } = leadingOptions(args.slice(from), RUNNER_VALUE_OPTIONS);
  const call = options.find((o) => o.key === '-c' || o.key === '--call');
  return { call: call ? (call.value ?? null) : undefined, next: from + next };
}

/** A runner's `-c` string: analyzed as a nested command, or dynamic when it is not known. */
function runCall(analyzer: Analyzer, call: Arg | null, what: string): void {
  if (!call || call.unknown) analyzer.dynamic(`it runs ${what} with a string from a variable`);
  else analyzer.nested(call.text, `it runs a string with ${what}`);
}

/**
 * Take one wrapper off the front of the command. Returns the index of the
 * next word, or `i` when `args[i]` is not a wrapper.
 */
export function stripWrapper(analyzer: Analyzer, args: Arg[], i: number, scope: WrapperScope): number {
  const name = path.basename(args[i].text);
  const opts = (withValue: RegExp, flags: RegExp = /^-/): number => {
    let k = i + 1;
    while (k < args.length) {
      const t = args[k].text;
      if (t === '--') return k + 1;
      if (withValue.test(t)) k += 2;
      else if (flags.test(t) && t !== '-') k++;
      else break;
    }
    return k;
  };
  switch (name) {
  case 'command':
  case 'builtin':
  case 'nohup':
  case 'chronic':
  case 'unbuffer':
    return opts(/^$/);
  case 'time':
    return opts(/^$/, /^-[pv]+$/);
  case 'exec':
    return opts(/^-a$/, /^-[cl]+$/);
  case 'nice':
    return opts(/^(-n|--adjustment)$/, /^-/);
  case 'ionice':
    return opts(/^-[cnp]$/, /^-/);
  case 'stdbuf':
    return opts(/^-[ioe]$/, /^-/);
  case 'caffeinate':
    return opts(/^-[tw]$/, /^-/);
  case 'timeout': {
    const k = opts(/^-[sk]$/, /^-/);
    return k + 1;
  }
  case 'env': {
    // `env -` is `env -i`.
    const from = args[i + 1]?.text === '-' ? i + 2 : i + 1;
    const rest = args.slice(from);
    const { options, next } = leadingOptions(rest, ENV_VALUE_OPTIONS);
    for (const { key, value } of options) {
      if (key === '-S' || key === '--split-string') {
        const words = [value, ...rest.slice(next)].filter((a): a is Arg => a !== undefined);
        if (words.some((a) => a.unknown)) analyzer.dynamic('it runs env -S with a string from a variable');
        else analyzer.nested(words.map((a) => a.text).join(' '), 'it runs a string with env -S');
        return args.length;
      }
      if (key === '-C' || key === '--chdir') {
        analyzer.base = value && !value.unknown ? analyzer.toAbs(value.text) : null;
        scope.chdir = true;
      }
    }
    return from + next;
  }
  case 'sudo':
  case 'doas':
  case 'pkexec': {
    scope.sudo = true;
    analyzer.flag('sudo', `it runs ${name} to get root`);
    const k = opts(/^(-[ugCDhprtTU]|--user|--group)$/, /^-/);
    const shellFlag = args.slice(i + 1, k).some((a) => /^-[a-zA-Z]*[si]/.test(a.text));
    if (shellFlag && k < args.length) {
      analyzer.nested(args.slice(k).map((a) => a.text).join(' '), `it runs a shell with ${name} -s`);
      return args.length;
    }
    return k;
  }
  case 'su': {
    scope.sudo = true;
    analyzer.flag('sudo', 'it runs su to switch user');
    const c = args.findIndex((a, k) => k > i && (a.text === '-c' || a.text === '--command'));
    if (c > 0 && args[c + 1]) analyzer.nested(args[c + 1].text, 'it runs a string with su -c');
    return args.length;
  }
  case 'xargs':
    return xargs(analyzer, args, i, scope);
  case 'watch': {
    const k = opts(/^-[nqd]$|^--(interval|differences)$/, /^-/);
    analyzer.nested(args.slice(k).map((a) => a.text).join(' '), 'it runs a string with watch');
    return args.length;
  }
  case 'npx':
  case 'pnpx':
  case 'bunx': {
    const { call, next } = runnerOptions(args, i + 1);
    if (call === undefined) return next;
    runCall(analyzer, call, `${name} -c`);
    return args.length;
  }
  case 'pnpm':
  case 'npm':
  case 'yarn':
  case 'bun': {
    const sub = args[i + 1]?.text;
    if (sub !== 'exec' && sub !== 'dlx' && sub !== 'x') return i;
    const { call, next } = runnerOptions(args, i + 2);
    if (call === undefined) return next;
    runCall(analyzer, call, `${name} ${sub} -c`);
    return args.length;
  }
  default:
    return i;
  }
}
