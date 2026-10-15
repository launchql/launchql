/**
 * Where file contents go inside one command line: down pipes, into
 * redirections and copies, onto the clipboard, and through programs that
 * change them. The analyzer only records the flows; the classifier decides
 * which sources are secret files, since that needs the real paths.
 */

import type { Analyzer, Arg, Run } from './analyze';
import { literalArg } from './args';
import { findRoots } from './file-commands';
import type { SimpleCommand } from './tokenize';

export interface Source {
  raw: string;
  abs: string;
}

export type FlowSink =
  /** A copy into a file, or into a dir when `dir` (the file keeps its name). */
  | { kind: 'file'; raw: string; abs: string; dir: boolean }
  | { kind: 'clipboard' }
  /** A program whose output is not the text it read (`base64`, `sed`, `node`). */
  | { kind: 'transform' };

export interface ContentFlow {
  sources: Source[];
  to: FlowSink;
  /** The program, for the reason: `cp`, `base64`, `>`. */
  what: string;
}

/** What one command reads on stdin. */
export interface Stdin {
  /** Files whose contents arrive on stdin. */
  sources: Source[];
  /** The words on stdin when they are known (`echo a b |`, `<<< a`); `null` when they are not. */
  words: Arg[] | null;
  /**
   * When stdin is a file listing (`find src |`, `git ls-files |`): the roots
   * every listed name lies under. `null` when it is anything else.
   */
  listedUnder: Arg[] | null;
}

/** Readers whose output is the file's text unchanged, so redaction still matches it. */
const VERBATIM = new Set([
  'cat',
  'head',
  'tail',
  'less',
  'more',
  'bat',
  'grep',
  'egrep',
  'fgrep',
  'ggrep',
  'rg',
  'ag',
  'ack',
  'wc',
  'diff',
  'tee',
  'sort',
  'uniq',
  'nl'
]);

/**
 * Commands that do not print what they read (`ls`, `test`, `rm`), or whose
 * output another signal already covers (copies, the clipboard, `source`).
 */
const NO_CONTENT = new Set([
  'ls',
  'stat',
  'du',
  'file',
  'test',
  '[',
  'touch',
  'cd',
  'pushd',
  'realpath',
  'readlink',
  'basename',
  'dirname',
  'rm',
  'rmdir',
  'unlink',
  'shred',
  'srm',
  'rimraf',
  'chmod',
  'chown',
  'chgrp',
  'mkdir',
  'find',
  'git',
  'source',
  '.',
  'cp',
  'mv',
  'install',
  'ln',
  'dd',
  'pbcopy',
  'xclip',
  'xsel',
  'wl-copy'
]);

/** `head -c`, `grep -o`, `rg -r`: a verbatim reader that cuts values apart. */
function trims(name: string, rest: readonly Arg[]): boolean {
  const flags = rest.map((a) => a.text).filter((t) => t.startsWith('-'));
  if (name === 'head' || name === 'tail') return flags.some((t) => /^(-c|--bytes)/.test(t));
  if (name === 'rg' && flags.some((t) => /^(-r|--replace)/.test(t))) return true;
  return flags.some((t) => t === '--only-matching' || /^-[a-zA-Z]*o[a-zA-Z]*$/.test(t));
}

/** The program prints what it read as is, or prints nothing of it. */
export function keepsContent(name: string, rest: readonly Arg[]): boolean {
  if (NO_CONTENT.has(name)) return true;
  return VERBATIM.has(name) && !trims(name, rest);
}

/** Split words the way `xargs` does (on whitespace). `null` when one is not known. */
function splitWords(args: readonly Arg[]): Arg[] | null {
  if (args.some((a) => a.unknown)) return null;
  return args.flatMap((a) =>
    a.text
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => literalArg(text, a.raw))
  );
}

/** The words `echo` or `printf` prints; `null` when one is not known. */
function printedWords(name: string, rest: readonly Arg[]): Arg[] | null {
  if (name === 'printf') return rest[0]?.text === '-v' ? [] : splitWords(rest);
  let k = 0;
  while (k < rest.length && /^-[neE]+$/.test(rest[k].text)) k++;
  return splitWords(rest.slice(k));
}

/**
 * The roots a file-listing command prints names under: `find`, `ls`, and
 * `git ls-files`. `null` for any other command, an unknown root, or a `find`
 * that follows symlinks (`-L`), whose names can leave its roots.
 */
function listedRoots(name: string, rest: readonly Arg[]): Arg[] | null {
  if (rest.some((a) => a.unknown)) return null;
  if (name === 'find') {
    if (rest.some((a) => a.text === '-L' || a.text === '-follow')) return null;
    return findRoots(rest).roots;
  }
  if (name === 'ls') {
    const roots = rest.filter((a) => !a.text.startsWith('-'));
    return roots.length > 0 ? roots : [literalArg('.')];
  }
  if (name === 'git' && rest[0]?.text === 'ls-files') return [literalArg('.')];
  return null;
}

const GROUP_END = new Set(['}', 'done', 'fi', 'esac']);

/** Follows contents from command to command within one analyzed string. */
export class FlowTracker {
  readonly flows: ContentFlow[] = [];
  /** The files whose contents each command's stdout carries. */
  private readonly outputs = new Map<SimpleCommand, Source[]>();
  /** The words each `echo` or `printf` printed. */
  private readonly printed = new Map<SimpleCommand, Arg[] | null>();
  /** The roots each file-listing command printed names under. */
  private readonly listed = new Map<SimpleCommand, Arg[]>();
  /** Every source seen so far: what a `( … ) |` group may print. */
  private readonly all: Source[] = [];

  constructor(private readonly analyzer: Analyzer) {}

  /** What arrives on the command's stdin: from `<`, a here-string, a heredoc, or a pipe. */
  stdinOf(cmd: SimpleCommand): Stdin {
    const { analyzer } = this;
    const sources: Source[] = [];
    let words: Arg[] | null = [];
    let listedUnder: Arg[] | null = null;
    for (const r of cmd.redirects) {
      if (r.op !== '<' || !r.target) continue;
      words = null;
      for (const t of analyzer.resolveWord(r.target)) {
        const abs = t.unknown ? null : analyzer.toAbs(t.text);
        if (abs) sources.push({ raw: t.raw, abs });
      }
    }
    if (cmd.heredocs.length > 0) words = null;
    for (const w of cmd.hereStrings) {
      const said = splitWords(analyzer.resolveWord(w));
      words = words && said ? [...words, ...said] : null;
    }
    if (cmd.pipedIn) {
      const up = cmd.upstream;
      if (!up || up === 'group' || up.words.every((w) => GROUP_END.has(w.raw))) {
        sources.push(...this.all);
        words = null;
      } else {
        sources.push(...(this.outputs.get(up) ?? []));
        const said = this.printed.get(up);
        words = words && said ? [...words, ...said] : null;
        const onlyPipe = cmd.redirects.every((r) => r.op !== '<') && cmd.hereStrings.length === 0 && cmd.heredocs.length === 0;
        listedUnder = onlyPipe ? (this.listed.get(up) ?? null) : null;
      }
    }
    return { sources, words, listedUnder };
  }

  /**
   * After a command ran: remember what its stdout carries, and record a
   * transform and its stdout redirections as flows.
   */
  record(cmd: SimpleCommand, run: Run | null, sources: Source[], redirects: Source[]): void {
    this.outputs.set(cmd, sources);
    this.all.push(...sources);
    if (!run) return;
    if (run.name === 'echo' || run.name === 'printf') this.printed.set(cmd, printedWords(run.name, run.rest));
    const roots = listedRoots(run.name, run.rest);
    if (roots) this.listed.set(cmd, roots);
    if (sources.length === 0) return;
    if (!keepsContent(run.name, run.rest)) this.flows.push({ sources, to: { kind: 'transform' }, what: run.name });
    for (const r of redirects) this.flows.push({ sources, to: { kind: 'file', ...r, dir: false }, what: '>' });
  }
}
