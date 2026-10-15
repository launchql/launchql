/**
 * Wrappers that run another command (`env`, `sudo`, `timeout`, `xargs`, …).
 * They come off the front of a command before its rules apply, so `/bin/rm`,
 * `command rm` and `env rm` are all `rm`.
 */

import * as path from 'node:path';

import type { Analyzer, Arg } from './analyze';
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

/** `npx -c 'cmd'`, `pnpm exec -c 'cmd'`: the shell string after the first `-c` or `--call` from `from` on. */
function callString(args: Arg[], from: number): Arg | undefined {
  const c = args.findIndex((a, k) => k >= from && (a.text === '-c' || a.text === '--call'));
  return c < 0 ? undefined : args[c + 1];
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
    let k = i + 1;
    while (k < args.length) {
      const t = args[k].text;
      if (t === '-S' || t.startsWith('--split-string') || /^-[a-zA-Z]*S/.test(t)) {
        const inline = t.startsWith('--split-string=') ? t.slice('--split-string='.length) : null;
        const value = inline ?? args.slice(k + 1).map((a) => a.text).join(' ');
        analyzer.nested(value, 'it runs a string with env -S');
        return args.length;
      }
      if (t === '-u' || t === '--unset') k += 2;
      else if (t === '-C' || t === '--chdir') {
        analyzer.base = args[k + 1] ? analyzer.toAbs(args[k + 1].text) : null;
        scope.chdir = true;
        k += 2;
      } else if (t === '--') k++;
      else if (t.startsWith('-')) k++;
      else break;
    }
    return k;
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
    const call = callString(args, i + 1);
    if (call) {
      analyzer.nested(call.text, `it runs a string with ${name} -c`);
      return args.length;
    }
    return opts(/^(-p|--package)$/, /^-/);
  }
  case 'pnpm':
  case 'npm':
  case 'yarn':
  case 'bun': {
    const sub = args[i + 1]?.text;
    if (sub === 'exec' || sub === 'dlx' || sub === 'x') {
      const call = callString(args, i + 2);
      if (call) {
        analyzer.nested(call.text, `it runs a string with ${name} ${sub} -c`);
        return args.length;
      }
      let k = i + 2;
      while (k < args.length && args[k].text.startsWith('-')) k++;
      return k;
    }
    return i;
  }
  default:
    return i;
  }
}
