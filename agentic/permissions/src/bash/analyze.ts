/**
 * Static risk analysis of a bash command. It finds the paths a command touches
 * and the signals that make it risky, and it fails toward asking: anything it
 * cannot see through (substitution, `eval`, `sh -c`, a variable it cannot
 * resolve, a lexer error) raises `shell-dynamic`.
 *
 * This is best effort and is not a security boundary. A program the agent
 * wrote can still do anything the user can; only an OS sandbox stops that.
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Findings } from '../findings';
import type { Access, Signal } from '../types';
import { expandBraces } from './braces';
import { runCommand } from './commands';
import { type ContentFlow, FlowTracker, type Source, type Stdin } from './flows';
import { type SimpleCommand, tokenize, type Word } from './tokenize';
import { isPathLike, isUrl } from './words';
import { stripWrapper, type WrapperScope, xargsOperands } from './wrappers';

/** One argument after the expansions the analyzer can do. */
export interface Arg {
  text: string;
  raw: string;
  /** Part of the value is not known statically (`$VAR`, `$(…)`). */
  unknown: boolean;
  /** Has an unquoted `*`, `?` or `[`. */
  glob: boolean;
}

export interface BashPath {
  raw: string;
  /** Absolute, not normalized: `..` is resolved physically when canonicalized. */
  abs: string;
  access: Access;
  /**
   * A real path operand (has `/`, starts with `.` or `~`, a redirection, or a
   * file operand of a known command). A soft one is a bare word that may or may
   * not be a file; it only becomes a target when it leaves the workspace.
   */
  hard: boolean;
  /** Has an unexpanded glob (`*`, `?`, `[…]`): matched as a pattern against the restrictive roots. */
  glob: boolean;
  /** The program loads the file without printing it (`--env-file`). */
  quiet: boolean;
}

export interface DestructiveCheck {
  raw: string;
  /** `null` when the target is not known until the command runs. */
  abs: string | null;
  what: string;
  /** Also destructive on a workspace or temp root itself (`rm -rf .`), not only outside. */
  rootCounts: boolean;
}

/** What the analysis found besides its signals, which go straight into the caller's findings. */
export interface BashAnalysis {
  paths: BashPath[];
  /** Targets that make the command destructive when they sit outside the workspace or are a root. */
  destructiveChecks: DestructiveCheck[];
  /** Where file contents go: copies, the clipboard, transforms. */
  flows: ContentFlow[];
  /** Variables the command expands that it did not set itself. */
  envRefs: string[];
  /** The command may turn on globs that match dotfiles (`shopt -s dotglob`). */
  dotglob: boolean;
}

export interface AnalyzeContext {
  cwd: string;
  homeDir: string;
}

/** The program a simple command runs, and its operands after the wrappers came off. */
export interface Run {
  name: string;
  rest: Arg[];
}

export function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, ' ');
}

const MAX_NESTING = 4;
const MAX_COMMAND_LENGTH = 64 * 1024;

/** Device paths that are not files. */
const HARMLESS_DEVICES = new Set([
  '/dev/null',
  '/dev/stdin',
  '/dev/stdout',
  '/dev/stderr',
  '/dev/tty',
  '/dev/zero',
  '/dev/random',
  '/dev/urandom'
]);

/** Running `/usr/bin/x` is the same as running `x`. */
const SYSTEM_BIN_DIRS = new Set(['/bin', '/sbin', '/usr/bin', '/usr/sbin', '/usr/local/bin', '/opt/homebrew/bin']);

/** Assignments that change which program runs or what it loads. */
const DANGEROUS_VARS =
  /^(PATH|IFS|ENV|BASH_ENV|PROMPT_COMMAND|SHELLOPTS|BASHOPTS|PS4|GIT_SSH|GIT_SSH_COMMAND|GIT_EXEC_PATH|GIT_EDITOR|GIT_PAGER|EDITOR|VISUAL|PAGER|LD_PRELOAD|LD_LIBRARY_PATH|LD_AUDIT|DYLD_\w*)$/;

const RESERVED = new Set(['!', '{', '}', 'if', 'then', 'else', 'elif', 'fi', 'do', 'done', 'while', 'until', 'esac', 'coproc']);

/** The oh-my-pi critical list (`tools/bash.ts`), matched on the raw command. */
const CRITICAL_PATTERNS: readonly RegExp[] = [
  /\brm\s+(?:-\S+\s+)*(?:-[a-z]*[rRfF][a-z]*|--recursive|--force)\s+(?:-\S+\s+)*\//i,
  /\brm\s+(?:-\S+\s+)*--no-preserve-root\b/i,
  /\bsudo\s+rm\b/i,
  /\bchmod\s+-R\s+[0-7]+\s+\//i,
  /\bchmod\s+-R\s+[ugoa+\-=rwxXst,]+\s+\//,
  /\bchown\s+-R\s+\S+\s+\//i,
  /:\(\)\s*\{\s*:\s*\|\s*:/i,
  />\s*\/dev\/sd[a-z]/i,
  />\s*\/dev\/disk\d/i,
  /\bmkfs(\.|\b)/i,
  /\bdd\s+if=.+of=\/dev\//i,
  /\bshred\s+\/dev\//i,
  /\bcryptsetup\b/i,
  />\s*\/etc\/(?:passwd|shadow|sudoers)\b/i,
  /\btee\s+(?:-a\s+)?\/etc\/(?:passwd|shadow|sudoers)\b/i,
  /\b(?:curl|wget|fetch)\b[^|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh|fish)\b/i,
  /(?:^|[\s;&|(])(?:bash|sh|zsh|source|\.)\s+<\(\s*(?:curl|wget|fetch)\b/i,
  /\beval\s+["'`]?\$\(\s*(?:curl|wget|fetch)\b|\beval\s+`\s*(?:curl|wget|fetch)\b/i,
  /\bkill\s+-9\s+1\b/,
  /(?:^|[\s;&|(])(?:shutdown|poweroff|reboot|halt)(?:\s|$|[;|&])/i,
  /(?:^|[\s;&|(])init\s+0\b/i,
  /\bnc\b[^|;]*\s-[a-zA-Z]*[ec][a-zA-Z]*\s/i
];

const PLACEHOLDER_RE = /«secret:[^»]*»/;

/** Shell options that make `*` match dotfiles. */
const DOTGLOB_RE = /dotglob|glob_?dots|GLOBIGNORE/i;

/** `$NAME` and `${NAME…}` in a heredoc body. */
const BODY_VAR_RE = /\$\{?[#!]?([A-Za-z_][A-Za-z0-9_]*)/g;

function isHarmlessDevice(abs: string): boolean {
  return HARMLESS_DEVICES.has(abs) || abs.startsWith('/dev/fd/');
}

class Analyzer {
  readonly paths: BashPath[] = [];
  readonly checks: DestructiveCheck[] = [];
  readonly tracker = new FlowTracker(this);
  /** Variables expanded but never set in the command: they come from the environment. */
  readonly envRefs = new Set<string>();
  /** git remotes the command adds or points elsewhere (`git remote add`, `set-url`, `-c remote.x.url=`). */
  readonly gitRemotes = new Set<string>();
  /** What the command being analyzed reads on stdin. */
  stdin: Stdin = { sources: [], words: [], listedUnder: null };
  /** Shell variables set earlier in the command. `null` = set to something unknown. */
  vars = new Map<string, string | null>();
  /** The shell's working dir at this point. `null` after a `cd` we cannot follow. */
  base: string | null;
  /** How many shell strings (`sh -c`, `eval`, …) deep the analysis is. */
  private depth = 0;

  constructor(
    readonly ctx: AnalyzeContext,
    private readonly findings: Findings
  ) {
    this.base = path.resolve(ctx.cwd);
  }

  flag(signal: Signal, reason: string): void {
    this.findings.flag(signal, reason);
  }

  dynamic(reason: string): void {
    this.flag('shell-dynamic', reason);
  }

  analyzeString(command: string): void {
    if (this.depth > MAX_NESTING) {
      this.dynamic('the command nests shell strings too deeply to check');
      return;
    }
    if (command.length > MAX_COMMAND_LENGTH) {
      this.dynamic('the command is too long to check');
      return;
    }
    const lexed = tokenize(command);
    if (lexed.error) this.dynamic(`the command could not be parsed (${lexed.error})`);
    for (const note of lexed.dynamic) this.dynamic(`it uses ${note}`);
    for (const cmd of lexed.commands) this.analyzeCommand(cmd);
  }

  /** A shell string run by `sh -c`, `eval`, `watch`, …: analyze it in its own scope. */
  nested(text: string, why: string): void {
    this.dynamic(why);
    const savedBase = this.base;
    const savedVars = new Map(this.vars);
    const savedStdin = this.stdin;
    this.depth++;
    this.analyzeString(text);
    this.depth--;
    this.base = savedBase;
    this.vars = savedVars;
    this.stdin = savedStdin;
  }

  /**
   * `NAME=value`, inline or through `export`, `declare` or `readonly`.
   * `value` is `null` when it is not known statically.
   */
  assign(name: string, value: string | null): void {
    if (DANGEROUS_VARS.test(name)) this.dynamic(`it sets ${name}, which changes what runs`);
    this.vars.set(name, value);
  }

  /** A variable the command expands: an env ref unless the command set it. */
  noteRef(name: string): void {
    if (!this.vars.has(name)) this.envRefs.add(name);
  }

  lookup(name: string): string | null {
    if (this.vars.has(name)) return this.vars.get(name);
    if (name === 'HOME') return path.resolve(this.ctx.homeDir);
    if (name === 'PWD') return this.base;
    return null;
  }

  resolveWord(word: Word): Arg[] {
    let text = '';
    const mask: boolean[] = [];
    let unknown = false;
    const append = (value: string, expandable: boolean) => {
      text += value;
      for (let k = 0; k < value.length; k++) mask.push(expandable);
    };
    for (const part of word.parts) {
      if (part.kind === 'lit') append(part.text, !part.quoted);
      else if (part.kind === 'tilde') append(path.resolve(this.ctx.homeDir), false);
      else if (part.kind === 'unknown') {
        unknown = true;
        if (part.ref) this.noteRef(part.ref);
      } else {
        this.noteRef(part.name);
        const value = this.lookup(part.name) ?? part.fallback ?? null;
        if (value === null) unknown = true;
        else append(value, false);
      }
    }
    const expanded: { text: string; mask: boolean[] }[] = [];
    expandBraces(text, mask, expanded);
    return expanded.map((e) => ({
      text: e.text,
      raw: word.raw,
      unknown,
      glob: [...e.text].some((ch, k) => e.mask[k] && (ch === '*' || ch === '?' || ch === '['))
    }));
  }

  /** The absolute location of an argument, or `null` when it is unknown. */
  toAbs(text: string, base: string | null = this.base): string | null {
    if (/^file:\/\//i.test(text)) {
      try {
        return fileURLToPath(text);
      } catch {
        return null;
      }
    }
    if (text.startsWith('/')) return text;
    if (base === null) return null;
    return `${base}/${text}`;
  }

  /** Record a path the command touches. `quiet`: the program loads it without printing it. */
  addPath(arg: Arg, access: Access, hard: boolean, quiet = false): void {
    if (arg.unknown) {
      if (hard) this.dynamic(`the path ${arg.raw} is built from a variable or substitution`);
      return;
    }
    if (arg.text === '') return;
    const abs = this.toAbs(arg.text);
    if (abs === null) {
      if (hard) this.dynamic(`the path ${arg.raw} is used after a cd to an unknown dir`);
      return;
    }
    if (isHarmlessDevice(abs)) return;
    if (arg.glob) {
      const components = arg.text.split('/');
      const firstGlob = components.findIndex((c) => /[*?[]/.test(c));
      if (components.slice(firstGlob).includes('..')) {
        this.dynamic(`the glob ${arg.raw} climbs out with ..`);
        return;
      }
    }
    this.paths.push({ raw: arg.raw, abs, access, hard, glob: arg.glob, quiet });
  }

  destroy(arg: Arg | null, what: string, rootCounts = false): void {
    if (arg === null || arg.unknown) {
      this.flag('destructive', `it runs ${what} on paths that are not known until it runs`);
      return;
    }
    const abs = this.toAbs(arg.text);
    if (abs === null) this.flag('destructive', `it runs ${what} after a cd to an unknown dir`);
    else this.checks.push({ raw: arg.raw, abs, what, rootCounts });
  }

  analyzeCommand(cmd: SimpleCommand): void {
    const args = cmd.words.flatMap((w) => this.resolveWord(w));
    const stdinFed = cmd.pipedIn || cmd.stdinDoc || cmd.redirects.some((r) => r.op === '<' && r.target);
    const stdin = this.tracker.stdinOf(cmd);
    this.stdin = stdin;
    for (const doc of cmd.heredocs) {
      if (!doc.quoted) for (const m of doc.body.matchAll(BODY_VAR_RE)) this.noteRef(m[1]);
    }

    const from = this.paths.length;
    const stdout: Source[] = [];
    for (const r of cmd.redirects) {
      if (!r.target) continue;
      const access: Access = r.op === '<' ? 'read' : 'write';
      for (const target of this.resolveWord(r.target)) {
        if (target.unknown) {
          this.dynamic(`it redirects to ${target.raw}, a path from a variable or substitution`);
          continue;
        }
        this.addPath(target, access, true);
        const abs = this.toAbs(target.text);
        if (access === 'write' && r.fd !== 2 && abs !== null && !isHarmlessDevice(abs)) stdout.push({ raw: target.raw, abs });
      }
    }
    const run = this.runArgs(args, stdinFed);
    const reads = this.paths.slice(from).filter((p) => p.access === 'read' && !p.quiet);
    const sources = [...reads.map(({ raw, abs }) => ({ raw, abs })), ...stdin.sources];
    this.tracker.record(cmd, run, sources, stdout);
  }

  /**
   * Take assignments, keywords and wrappers off, then apply the command's
   * rules. Returns the program and its operands, or `null` when there is none.
   * A wrapper's working dir (`env -C`) holds for this command only.
   */
  runArgs(args: Arg[], stdinFed: boolean): Run | null {
    const scope: WrapperScope = { sudo: false, xargs: null, chdir: false };
    const outer = this.base;
    try {
      return this.run(args, stdinFed, scope);
    } finally {
      if (scope.chdir) this.base = outer;
    }
  }

  private run(args: Arg[], stdinFed: boolean, scope: WrapperScope): Run | null {
    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      const assignment = /^([A-Za-z_][A-Za-z0-9_]*)\+?=(.*)$/s.exec(arg.text);
      if (assignment && /^[A-Za-z_][A-Za-z0-9_]*\+?=/.test(arg.raw)) {
        this.assign(assignment[1], arg.unknown ? null : assignment[2]);
        i++;
        continue;
      }
      if (arg.raw === arg.text && RESERVED.has(arg.text)) {
        i++;
        continue;
      }
      if (arg.raw === 'function') {
        this.dynamic('it defines a shell function');
        return null;
      }
      if (arg.raw === 'for' || arg.raw === 'select') {
        const inAt = args.findIndex((a, k) => k > i && a.raw === 'in');
        if (inAt > 0) for (const item of args.slice(inAt + 1)) this.operand(item);
        return null;
      }
      if (arg.raw === 'case') return null;
      const next = stripWrapper(this, args, i, scope);
      if (next === i) break;
      i = next;
    }
    if (i >= args.length) return null;

    const argv0 = args[i];
    if (argv0.unknown) {
      this.dynamic(`the command name ${argv0.raw} comes from a variable or substitution`);
      return null;
    }
    if (argv0.glob) {
      this.dynamic(`the command name ${argv0.raw} is a glob`);
      return null;
    }
    if (argv0.text.includes('/')) {
      const abs = this.toAbs(argv0.text);
      if (abs === null || !SYSTEM_BIN_DIRS.has(path.dirname(path.resolve(abs)))) this.addPath(argv0, 'exec', true);
    }
    const name = path.basename(argv0.text);
    if (scope.sudo && name === 'rm') this.flag('destructive', 'it runs rm as root');
    const rest = scope.xargs ? xargsOperands(this, name, args.slice(i + 1), scope.xargs) : args.slice(i + 1);
    runCommand(name, rest, { analyzer: this, stdinFed, xargs: scope.xargs !== null });
    return { name, rest };
  }

  /** A bare operand: a hard path when it looks like one, a soft one otherwise. URLs are skipped. */
  operand(arg: Arg, access: Access = 'read'): void {
    if (isUrl(arg.text)) return;
    const hard = isPathLike(arg.text) || isPathLike(arg.raw) || /^file:\/\//i.test(arg.text);
    this.addPath(arg, access, hard);
  }
}

/**
 * Analyze a bash command, flagging its signals into `findings`. Pure: no fs
 * access; paths are canonicalized by the caller.
 */
export function analyzeBash(command: string, ctx: AnalyzeContext, findings: Findings): BashAnalysis {
  const analyzer = new Analyzer(ctx, findings);
  analyzer.analyzeString(command);
  for (const pattern of CRITICAL_PATTERNS) {
    if (pattern.test(command)) {
      analyzer.flag('destructive', 'it matches a known destructive pattern');
      break;
    }
  }
  if (PLACEHOLDER_RE.test(command)) {
    analyzer.flag('placeholder-in-command', 'it contains a «secret:…» placeholder');
  }
  return {
    paths: analyzer.paths,
    destructiveChecks: analyzer.checks,
    flows: analyzer.tracker.flows,
    envRefs: [...analyzer.envRefs],
    dotglob: DOTGLOB_RE.test(command)
  };
}

export type { Analyzer };
