/** Option parsing and the generic operand rule, shared by the command rules. */

import type { Access } from '../types';
import type { Analyzer, Arg } from './analyze';
import { isPathLike, isUrl } from './words';

export interface CommandContext {
  analyzer: Analyzer;
  /** stdin comes from a pipe, a heredoc, a here-string or a `<` redirect. */
  stdinFed: boolean;
  /** Run by `xargs`, so more operands arrive from stdin. */
  xargs: boolean;
}

/** An argument the analyzer made up itself (`.` for a default root): fully known, no glob. */
export function literalArg(text: string, raw: string = text): Arg {
  return { text, raw, unknown: false, glob: false };
}

export interface Parsed {
  flags: Set<string>;
  values: Map<string, Arg[]>;
  positionals: Arg[];
}

/**
 * Split options from operands. `withValue` lists the options that take a value
 * (`-o`, `--output`); a short one may be glued (`-ofile`) or part of a cluster
 * (`-sSo file`), a long one may use `=`.
 */
export function parse(rest: readonly Arg[], withValue: ReadonlySet<string> = new Set()): Parsed {
  const flags = new Set<string>();
  const values = new Map<string, Arg[]>();
  const positionals: Arg[] = [];
  const put = (key: string, value: Arg | undefined) => {
    if (!value) return;
    values.set(key, [...(values.get(key) ?? []), value]);
  };
  for (let k = 0; k < rest.length; k++) {
    const arg = rest[k];
    const t = arg.text;
    if (t === '--') {
      positionals.push(...rest.slice(k + 1));
      break;
    }
    if (t.startsWith('--')) {
      const eq = t.indexOf('=');
      const key = eq < 0 ? t : t.slice(0, eq);
      flags.add(key);
      if (eq >= 0) put(key, { ...arg, text: t.slice(eq + 1) });
      else if (withValue.has(key)) put(key, rest[++k]);
      continue;
    }
    if (t.startsWith('-') && t.length > 1 && !arg.unknown) {
      for (let c = 1; c < t.length; c++) {
        const key = `-${t[c]}`;
        flags.add(key);
        if (withValue.has(key)) {
          const glued = t.slice(c + 1);
          put(key, glued ? { ...arg, text: glued } : rest[++k]);
          break;
        }
      }
      continue;
    }
    positionals.push(arg);
  }
  return { flags, values, positionals };
}

export interface LeadingOption {
  /** One option: `-c` out of a `-xc` cluster, `--eval` out of `--eval=X`. */
  key: string;
  /** Its value, glued (`-cX`, `--eval=X`) or the next word: only for `withValue` keys. */
  value?: Arg;
}

/**
 * A program's own options, up to its first operand (`node -r x main.js -e y`
 * stops at `main.js`: the rest belongs to the script). Reads every spelling
 * that `parse` reads. `next` is the index of the first operand; a word built
 * from a variable stops the scan, because it may be either. An option in
 * `stopAfter` ends the program's options (`python -c X`, `python -m X`).
 */
export function leadingOptions(
  rest: readonly Arg[],
  withValue: ReadonlySet<string>,
  stopAfter: ReadonlySet<string> = new Set()
): { options: LeadingOption[]; next: number } {
  const options: LeadingOption[] = [];
  let k = 0;
  for (; k < rest.length; k++) {
    const arg = rest[k];
    const t = arg.text;
    if (t === '--') return { options, next: k + 1 };
    if (arg.unknown || !t.startsWith('-') || t === '-') break;
    if (t.startsWith('--')) {
      const eq = t.indexOf('=');
      const key = eq < 0 ? t : t.slice(0, eq);
      if (eq >= 0) options.push({ key, value: { ...arg, text: t.slice(eq + 1) } });
      else options.push(withValue.has(key) ? { key, value: rest[++k] } : { key });
    } else {
      for (let c = 1; c < t.length; c++) {
        const key = `-${t[c]}`;
        if (!withValue.has(key)) {
          options.push({ key });
          continue;
        }
        const glued = t.slice(c + 1);
        options.push({ key, value: glued ? { ...arg, text: glued } : rest[++k] });
        break;
      }
    }
    if (stopAfter.has(options[options.length - 1]?.key ?? '')) return { options, next: k + 1 };
  }
  return { options, next: k };
}

export const has = (p: Parsed, ...keys: string[]) => keys.some((key) => p.flags.has(key));
export const valuesOf = (p: Parsed, ...keys: string[]) => keys.flatMap((key) => p.values.get(key) ?? []);

/** Options that load an env file into the program without printing it. */
const ENV_FILE_OPTIONS = new Set(['--env-file', '--env-file-if-exists']);

/** The generic rule: operands are reads; `--opt=path` and `KEY=path` values too. */
export function generic(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  let afterDashes = false;
  for (let k = 0; k < rest.length; k++) {
    const arg = rest[k];
    const t = arg.text;
    if (t === '--') {
      afterDashes = true;
      continue;
    }
    if (!afterDashes && t.startsWith('-')) {
      const eq = t.indexOf('=');
      const key = eq < 0 ? t : t.slice(0, eq);
      const quiet = ENV_FILE_OPTIONS.has(key);
      if (eq > 0 && (quiet || isPathLike(t.slice(eq + 1)))) {
        analyzer.addPath({ ...arg, text: t.slice(eq + 1) }, 'read', true, quiet);
      } else if (eq < 0 && quiet && rest[k + 1]) {
        analyzer.addPath(rest[++k], 'read', true, true);
      }
      continue;
    }
    const kv = /^[A-Za-z_][\w.-]*=(.+)$/.exec(t);
    if (kv && isPathLike(kv[1]) && !isUrl(kv[1])) {
      analyzer.addPath({ ...arg, text: kv[1] }, 'read', true);
      continue;
    }
    analyzer.operand(arg);
  }
}

export function files(ctx: CommandContext, list: readonly Arg[], access: Access): void {
  for (const arg of list) if (!isUrl(arg.text)) ctx.analyzer.addPath(arg, access, true);
}
