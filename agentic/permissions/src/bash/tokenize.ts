/**
 * A POSIX-shell lexer that is good enough to find what a command touches.
 *
 * It splits a command into simple commands (on `;`, `&&`, `||`, `|`, `&`,
 * newline and subshell parens), keeps quoting so expansion can be judged, and
 * records redirections and heredocs. Command substitution (`$(…)`, backticks,
 * `<(…)`) is lexed recursively, so the commands inside it are analyzed too.
 *
 * It never executes or expands anything that needs the environment. What it
 * cannot know it marks: a word part is `unknown`, and constructs that hide code
 * add a `dynamic` note. Any lexer error (an unterminated quote) is reported as
 * `error`, and the analyzer turns both into `shell-dynamic`.
 */

import {
  decodeAnsiC,
  findAnsiClose,
  LexError,
  matchBacktick,
  matchBrace,
  matchParen,
  stripQuotes,
  unescapeBackticks
} from './quoting';

/** One piece of a word. `quoted` pieces take no globbing, brace or tilde expansion. */
export type Part =
  | { kind: 'lit'; text: string; quoted: boolean }
  | { kind: 'var'; name: string; quoted: boolean; fallback?: string }
  | { kind: 'tilde' }
  /** `ref` names the variable a complex `${…}` reads (`${TOKEN:0:4}`). */
  | { kind: 'unknown'; ref?: string };

export interface Word {
  parts: Part[];
  /** The source text of the word. */
  raw: string;
}

export interface Redirect {
  op: string;
  fd: number | null;
  /** `null` for an fd duplication (`2>&1`) or a heredoc. */
  target: Word | null;
}

export interface Heredoc {
  quoted: boolean;
  body: string;
}

export interface SimpleCommand {
  words: Word[];
  redirects: Redirect[];
  heredocs: Heredoc[];
  /** stdin is the previous command's stdout. */
  pipedIn: boolean;
  /** stdin is a heredoc or a here-string. */
  stdinDoc: boolean;
  /** The words after `<<<`. */
  hereStrings: Word[];
  /** The command whose stdout this one reads, or `group` after `( … ) |`. */
  upstream?: SimpleCommand | 'group';
}

export interface Lexed {
  commands: SimpleCommand[];
  /** Notes on constructs that run code the analyzer cannot see. */
  dynamic: string[];
  error?: string;
}

const MAX_DEPTH = 6;
const OPERATOR_CHARS = new Set([';', '&', '|', '(', ')', '<', '>']);
const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SPECIAL_PARAMS = new Set(['?', '$', '!', '#', '@', '*', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

interface PendingHeredoc {
  delim: string;
  quoted: boolean;
  stripTabs: boolean;
  command: SimpleCommand;
}

function newCommand(): SimpleCommand {
  return { words: [], redirects: [], heredocs: [], pipedIn: false, stdinDoc: false, hereStrings: [] };
}

class Lexer {
  readonly commands: SimpleCommand[] = [];
  readonly dynamic: string[] = [];
  private current = newCommand();
  private pending: PendingHeredoc[] = [];
  private pipeNext = false;
  private upstream: SimpleCommand | 'group' | null = null;
  private i = 0;

  constructor(
    private readonly s: string,
    private readonly depth: number
  ) {}

  run(): void {
    const { s } = this;
    while (this.i < s.length) {
      const ch = s[this.i];
      if (ch === ' ' || ch === '\t' || ch === '\r') {
        this.i++;
      } else if (ch === '\\' && s[this.i + 1] === '\n') {
        this.i += 2;
      } else if (ch === '\n') {
        this.i++;
        // A pipe may continue on the next line.
        if (!this.pipeNext || this.current.words.length > 0 || this.current.redirects.length > 0) this.endCommand(false);
        this.readHeredocs();
      } else if (ch === '#') {
        const nl = s.indexOf('\n', this.i);
        this.i = nl < 0 ? s.length : nl;
      } else if (OPERATOR_CHARS.has(ch)) {
        this.operator();
      } else {
        const start = this.i;
        const parts = this.readWord();
        if (parts) this.current.words.push({ parts, raw: s.slice(start, this.i) });
      }
    }
    if (this.pending.length > 0) throw new LexError('unterminated heredoc');
    this.endCommand(false);
  }

  private endCommand(pipe: boolean): void {
    const cmd = this.current;
    if (cmd.words.length > 0 || cmd.redirects.length > 0) {
      cmd.pipedIn = cmd.pipedIn || this.pipeNext;
      if (cmd.pipedIn && this.upstream) cmd.upstream = this.upstream;
      this.commands.push(cmd);
      this.pipeNext = pipe;
      this.upstream = pipe ? cmd : null;
    } else if (pipe) {
      // `( … ) | x`: the group's output is piped on.
      this.pipeNext = true;
      this.upstream = 'group';
    } else {
      this.pipeNext = false;
      this.upstream = null;
    }
    this.current = newCommand();
  }

  private operator(): void {
    const { s } = this;
    const ch = s[this.i];
    const two = s.slice(this.i, this.i + 2);
    if (ch === '<' || ch === '>' || two === '&>') {
      this.redirect(null);
      return;
    }
    if (two === '&&' || two === '||' || two === ';;' || two === ';&') {
      this.i += 2;
      this.endCommand(false);
    } else if (two === '|&') {
      this.i += 2;
      this.endCommand(true);
    } else if (ch === '|') {
      this.i++;
      this.endCommand(true);
    } else {
      // `;`, `&`, `(`, `)`
      if (ch === '(' && s[this.i + 1] === ')') {
        // `name()`: a function definition hides a body that runs later.
        this.dynamic.push('defines a shell function');
        this.i += 2;
        return;
      }
      this.i++;
      this.endCommand(false);
    }
  }

  private redirect(fd: number | null): void {
    const { s } = this;
    const ops = ['&>>', '<<<', '<<-', '&>', '>>', '>|', '>&', '<<', '<>', '<&', '<(', '>(', '<', '>'];
    const op = ops.find((candidate) => s.startsWith(candidate, this.i));
    if (op === '<(' || op === '>(') {
      // Process substitution: a word whose value comes from a command.
      const start = this.i;
      const parts = this.readWord();
      if (parts) this.current.words.push({ parts, raw: s.slice(start, this.i) });
      return;
    }
    this.i += op.length;
    while (s[this.i] === ' ' || s[this.i] === '\t') this.i++;
    if (this.i >= s.length || s[this.i] === '\n' || OPERATOR_CHARS.has(s[this.i])) {
      throw new LexError(`redirection ${op} has no target`);
    }
    const start = this.i;
    const parts = this.readWord();
    if (!parts) throw new LexError(`redirection ${op} has no target`);
    const target: Word = { parts, raw: s.slice(start, this.i) };
    const cmd = this.current;
    if (op === '<<' || op === '<<-') {
      const quoted = parts.some((p) => p.kind === 'lit' && p.quoted);
      const delim = parts.map((p) => (p.kind === 'lit' ? p.text : '')).join('');
      this.pending.push({ delim, quoted, stripTabs: op === '<<-', command: cmd });
      cmd.stdinDoc = true;
      cmd.redirects.push({ op, fd, target: null });
      return;
    }
    if (op === '<<<') {
      cmd.stdinDoc = true;
      cmd.hereStrings.push(target);
      cmd.redirects.push({ op, fd, target: null });
      return;
    }
    if ((op === '>&' || op === '<&') && /^(\d+-?|-)$/.test(target.raw)) {
      cmd.redirects.push({ op, fd, target: null });
      return;
    }
    cmd.redirects.push({ op, fd, target });
  }

  private readHeredocs(): void {
    const { s } = this;
    for (const doc of this.pending) {
      let body = '';
      let found = false;
      while (this.i < s.length) {
        const nl = s.indexOf('\n', this.i);
        const line = s.slice(this.i, nl < 0 ? s.length : nl);
        this.i = nl < 0 ? s.length : nl + 1;
        const check = doc.stripTabs ? line.replace(/^\t+/, '') : line;
        if (check === doc.delim) {
          found = true;
          break;
        }
        body += `${line}\n`;
      }
      if (!found) throw new LexError('unterminated heredoc');
      if (!doc.quoted) this.scanExpansions(body);
      doc.command.heredocs.push({ quoted: doc.quoted, body });
    }
    this.pending = [];
  }

  /** An unquoted heredoc body expands `$(…)` and backticks: lex them. */
  private scanExpansions(body: string): void {
    for (let i = 0; i < body.length; i++) {
      const ch = body[i];
      if (ch === '\\') i++;
      else if (ch === '$' && body[i + 1] === '(') {
        const end = matchParen(body, i + 1);
        this.substitute(body.slice(i + 2, end), 'command substitution in a heredoc');
        i = end;
      } else if (ch === '`') {
        const end = matchBacktick(body, i);
        this.substitute(unescapeBackticks(body.slice(i + 1, end)), 'backtick substitution in a heredoc');
        i = end;
      }
    }
  }

  private substitute(inner: string, note: string): void {
    this.dynamic.push(note);
    if (this.depth >= MAX_DEPTH) throw new LexError('substitutions nested too deep');
    const sub = new Lexer(inner, this.depth + 1);
    sub.run();
    this.commands.push(...sub.commands);
    this.dynamic.push(...sub.dynamic);
  }

  /** Read one word starting at `this.i`, up to unquoted whitespace or an operator. */
  private readWord(): Part[] | null {
    const { s } = this;
    const parts: Part[] = [];
    const lit = (text: string, quoted: boolean) => {
      const last = parts[parts.length - 1];
      if (last && last.kind === 'lit' && last.quoted === quoted) last.text += text;
      else parts.push({ kind: 'lit', text, quoted });
    };
    const wordStart = this.i;
    while (this.i < s.length) {
      const ch = s[this.i];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') break;
      if ((ch === '<' || ch === '>') && s[this.i + 1] === '(') {
        const end = matchParen(s, this.i + 1);
        this.substitute(s.slice(this.i + 2, end), 'process substitution');
        parts.push({ kind: 'unknown' });
        this.i = end + 1;
        continue;
      }
      if (OPERATOR_CHARS.has(ch)) {
        // `2>file`: digits right before a redirection are its fd.
        if ((ch === '<' || ch === '>') && this.i > wordStart) {
          const text = s.slice(wordStart, this.i);
          if (/^\d+$/.test(text)) {
            parts.length = 0;
            this.redirect(Number(text));
            return null;
          }
        }
        break;
      }
      if (ch === '\\') {
        if (s[this.i + 1] === '\n') {
          this.i += 2;
          continue;
        }
        if (this.i + 1 < s.length) lit(s[this.i + 1], true);
        this.i += 2;
        continue;
      }
      if (ch === "'") {
        const end = s.indexOf("'", this.i + 1);
        if (end < 0) throw new LexError('unterminated single quote');
        lit(s.slice(this.i + 1, end), true);
        this.i = end + 1;
        continue;
      }
      if (ch === '"') {
        this.readDouble(parts, lit);
        continue;
      }
      if (ch === '`') {
        const end = matchBacktick(s, this.i);
        this.substitute(unescapeBackticks(s.slice(this.i + 1, end)), 'backtick substitution');
        parts.push({ kind: 'unknown' });
        this.i = end + 1;
        continue;
      }
      if (ch === '$') {
        this.readDollar(parts, lit, false);
        continue;
      }
      if (ch === '~' && this.atTildePosition(parts)) {
        const rest = s.slice(this.i + 1);
        const user = /^[^/\s;&|()<>:]*/.exec(rest)[0];
        if (user === '') {
          parts.push({ kind: 'tilde' });
          this.i++;
          continue;
        }
        this.dynamic.push(`~${user} expansion`);
        lit(`~${user}`, false);
        this.i += 1 + user.length;
        continue;
      }
      lit(ch, false);
      this.i++;
    }
    return parts;
  }

  /** `~` expands at the start of a word and right after `NAME=` (an assignment). */
  private atTildePosition(parts: Part[]): boolean {
    if (parts.length === 0) return true;
    if (parts.length !== 1) return false;
    const only = parts[0];
    return only.kind === 'lit' && !only.quoted && /^[A-Za-z_][A-Za-z0-9_]*=$/.test(only.text);
  }

  private readDouble(parts: Part[], lit: (text: string, quoted: boolean) => void): void {
    const { s } = this;
    this.i++;
    while (this.i < s.length) {
      const ch = s[this.i];
      if (ch === '"') {
        this.i++;
        if (parts.length === 0) lit('', true);
        return;
      }
      if (ch === '\\') {
        const next = s[this.i + 1];
        if (next === '\n') {
          this.i += 2;
        } else if (next === '"' || next === '\\' || next === '$' || next === '`') {
          lit(next, true);
          this.i += 2;
        } else {
          lit('\\', true);
          this.i++;
        }
        continue;
      }
      if (ch === '`') {
        const end = matchBacktick(s, this.i);
        this.substitute(unescapeBackticks(s.slice(this.i + 1, end)), 'backtick substitution');
        parts.push({ kind: 'unknown' });
        this.i = end + 1;
        continue;
      }
      if (ch === '$') {
        this.readDollar(parts, lit, true);
        continue;
      }
      lit(ch, true);
      this.i++;
    }
    throw new LexError('unterminated double quote');
  }

  private readDollar(parts: Part[], lit: (text: string, quoted: boolean) => void, quoted: boolean): void {
    const { s } = this;
    const next = s[this.i + 1];
    if (next === '(' && s[this.i + 2] === '(') {
      const end = matchParen(s, this.i + 1);
      const inner = s.slice(this.i + 3, end - 1);
      if (/\$\(|`/.test(inner)) this.substitute(inner.replace(/^[^$`]*/, ''), 'command substitution in arithmetic');
      parts.push({ kind: 'unknown' });
      this.i = end + 1;
      return;
    }
    if (next === '(') {
      const end = matchParen(s, this.i + 1);
      this.substitute(s.slice(this.i + 2, end), 'command substitution $(…)');
      parts.push({ kind: 'unknown' });
      this.i = end + 1;
      return;
    }
    if (next === '{') {
      const end = matchBrace(s, this.i + 1);
      const inner = s.slice(this.i + 2, end);
      this.i = end + 1;
      if (NAME_RE.test(inner)) {
        parts.push({ kind: 'var', name: inner, quoted });
        return;
      }
      if (SPECIAL_PARAMS.has(inner)) {
        parts.push({ kind: 'unknown' });
        return;
      }
      const ref = /^[#!]?([A-Za-z_][A-Za-z0-9_]*)/.exec(inner)?.[1];
      const withDefault = /^([A-Za-z_][A-Za-z0-9_]*):?[-=](.*)$/s.exec(inner);
      this.dynamic.push(`parameter expansion \${${inner}}`);
      if (/\$\(|`/.test(inner)) this.scanExpansions(inner);
      if (withDefault) {
        parts.push({ kind: 'var', name: withDefault[1], quoted, fallback: stripQuotes(withDefault[2]) });
        return;
      }
      parts.push(ref ? { kind: 'unknown', ref } : { kind: 'unknown' });
      return;
    }
    if (next === "'" && !quoted) {
      const close = findAnsiClose(s, this.i + 2);
      lit(decodeAnsiC(s.slice(this.i + 2, close)), true);
      this.i = close + 1;
      return;
    }
    if (next === '"' && !quoted) {
      // `$"…"` is a locale string: a double-quoted string.
      this.i++;
      return;
    }
    const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(this.i + 1))?.[0];
    if (name) {
      parts.push({ kind: 'var', name, quoted });
      this.i += 1 + name.length;
      return;
    }
    if (next !== undefined && SPECIAL_PARAMS.has(next)) {
      parts.push({ kind: 'unknown' });
      this.i += 2;
      return;
    }
    lit('$', quoted);
    this.i++;
  }
}

/** Lex a command. Never throws: a lexer error comes back in `error`. */
export function tokenize(command: string): Lexed {
  const lexer = new Lexer(command, 0);
  try {
    lexer.run();
    return { commands: lexer.commands, dynamic: lexer.dynamic };
  } catch (error) {
    if (!(error instanceof LexError)) throw error;
    return { commands: lexer.commands, dynamic: lexer.dynamic, error: error.message };
  }
}
