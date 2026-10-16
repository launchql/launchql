/**
 * Commands that read, write, copy and delete files: which operands they touch
 * with which access, which forms destroy data, and where a copy puts a file's
 * contents.
 */

import * as path from 'node:path';

import type { Access } from '../types';
import type { Arg } from './analyze';
import { type CommandContext, files, has, literalArg, parse, valuesOf } from './args';
import type { Source } from './flows';

/**
 * Record that the contents of `sources` (or of `stdin`) land in `dest`: a dir
 * when `dir`, where each file keeps its name.
 */
function copies(ctx: CommandContext, what: string, sources: readonly Arg[], dest: Arg, dir: boolean, stdin: readonly Source[] = []) {
  const { analyzer } = ctx;
  const to = dest.unknown ? null : analyzer.toAbs(dest.text);
  if (to === null) return;
  const from: Source[] = [...stdin];
  for (const s of sources) {
    const abs = s.unknown ? null : analyzer.toAbs(s.text);
    if (abs !== null) from.push({ raw: s.raw, abs });
  }
  if (from.length > 0) analyzer.tracker.flows.push({ sources: from, to: { kind: 'file', raw: dest.raw, abs: to, dir }, what });
}

/** `tee file…`: stdin lands in each file. */
export function tee(ctx: CommandContext, rest: readonly Arg[]): void {
  const ops = parse(rest).positionals;
  files(ctx, ops, 'write');
  for (const op of ops) copies(ctx, 'tee', [], op, false, ctx.analyzer.stdin.sources);
}

/** Options that come before `find`'s roots. */
const FIND_LEADING = new Set(['-H', '-L', '-P', '-E', '-X', '-s', '-x', '-d', '-O0', '-O1', '-O2', '-O3']);

/** The dirs `find` searches (`.` when none is given), and the index of its first expression word. */
export function findRoots(rest: readonly Arg[]): { roots: Arg[]; next: number } {
  let k = 0;
  while (k < rest.length && FIND_LEADING.has(rest[k].text)) k++;
  const roots: Arg[] = [];
  while (k < rest.length && !/^[-(!)]/.test(rest[k].text)) roots.push(rest[k++]);
  return { roots: roots.length > 0 ? roots : [literalArg('.')], next: k };
}

export function find(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const { roots, next } = findRoots(rest);
  for (const r of roots) analyzer.addPath(r, 'read', true);
  for (let k = next; k < rest.length; k++) {
    const t = rest[k].text;
    if (t === '-delete') {
      for (const r of roots) analyzer.destroy(r, 'find -delete');
    } else if (/^-(fprint0?|fprintf|fls)$/.test(t) && rest[k + 1]) {
      analyzer.addPath(rest[++k], 'write', true);
    } else if (/^-(exec|execdir|ok|okdir)$/.test(t)) {
      const end = rest.findIndex((a, j) => j > k && (a.text === ';' || a.text === '+'));
      const sub = rest.slice(k + 1, end < 0 ? rest.length : end);
      k = end < 0 ? rest.length : end;
      if (sub.length === 0) continue;
      // `{}` stands for each match: a path inside each root.
      for (const r of roots) {
        const replaced = sub.map((a) => (a.text.includes('{}') ? { ...a, text: a.text.split('{}').join(`${r.text}/{}`) } : a));
        analyzer.runArgs(replaced, false);
      }
    }
  }
}

export function sed(ctx: CommandContext, rest: readonly Arg[]): void {
  const p = parse(rest, new Set(['-e', '-f', '--expression', '--file', '-l']));
  const inPlace = has(p, '-i', '--in-place') || [...p.flags].some((f) => f.startsWith('-i'));
  let ops = p.positionals;
  // BSD `sed -i '' …`: the empty word is the backup suffix.
  if (inPlace && ops[0]?.text === '') ops = ops.slice(1);
  for (const f of valuesOf(p, '-f', '--file')) ctx.analyzer.addPath(f, 'read', true);
  if (valuesOf(p, '-e', '--expression', '-f', '--file').length === 0) ops = ops.slice(1);
  files(ctx, ops, inPlace ? 'write' : 'read');
}

export function grep(ctx: CommandContext, rest: readonly Arg[]): void {
  const p = parse(
    rest,
    new Set([
      '-e',
      '-f',
      '-m',
      '-A',
      '-B',
      '-C',
      '-g',
      '-t',
      '-T',
      '-d',
      '-D',
      '--regexp',
      '--file',
      '--max-count',
      '--glob',
      '--type',
      '--type-not',
      '--include',
      '--exclude',
      '--exclude-dir',
      '--context',
      '--after-context',
      '--before-context'
    ])
  );
  for (const f of valuesOf(p, '-f', '--file')) ctx.analyzer.addPath(f, 'read', true);
  const ops = valuesOf(p, '-e', '--regexp', '-f', '--file').length ? p.positionals : p.positionals.slice(1);
  for (const op of ops) ctx.analyzer.operand(op);
}

export function awk(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const p = parse(rest, new Set(['-f', '-v', '-F', '-i', '--file', '--include']));
  let ops = p.positionals;
  const progFiles = valuesOf(p, '-f', '--file');
  for (const f of progFiles) ctx.analyzer.addPath(f, 'read', true);
  if (progFiles.length === 0) {
    const program = ops[0];
    ops = ops.slice(1);
    if (program && (program.unknown || /\bsystem\s*\(|\|/.test(program.text))) {
      ctx.analyzer.dynamic(`its ${name} program runs commands`);
    }
  }
  const inPlace = valuesOf(p, '-i', '--include').some((v) => v.text === 'inplace');
  for (const op of ops) {
    if (/^[A-Za-z_]\w*=/.test(op.text)) continue;
    if (inPlace) ctx.analyzer.addPath(op, 'write', true);
    else ctx.analyzer.operand(op);
  }
}

export function remove(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const p = parse(rest);
  if (has(p, '--no-preserve-root')) analyzer.flag('destructive', `it runs ${name} --no-preserve-root`);
  const forceful =
    name === 'rimraf' ||
    name === 'shred' ||
    has(p, '-r', '-R', '-f', '--recursive', '--force');
  for (const op of p.positionals) {
    analyzer.addPath(op, 'write', true);
    if (forceful) analyzer.destroy(op, `${name} ${[...p.flags].join(' ')}`.trim(), true);
  }
  if (ctx.xargs && (name === 'rm' || name === 'rimraf' || name === 'shred' || name === 'unlink')) {
    analyzer.destroy(null, `xargs ${name}`);
  }
}

export function copyLike(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const p = parse(rest, new Set(['-t', '--target-directory', '-S', '--suffix', '-m', '--mode', '-o', '--owner', '-g', '--group']));
  const targetDir = valuesOf(p, '-t', '--target-directory')[0];
  const ops = p.positionals;
  const sourceAccess: Access = name === 'mv' ? 'write' : 'read';
  if (name === 'install' && has(p, '-d')) return files(ctx, ops, 'write');
  if (targetDir) {
    analyzer.addPath(targetDir, 'write', true);
    if (name !== 'ln') copies(ctx, name, ops, targetDir, true);
    return files(ctx, ops, sourceAccess);
  }
  if (ops.length === 1 && name === 'ln') {
    analyzer.addPath(ops[0], 'read', true);
    analyzer.addPath({ ...ops[0], text: path.basename(ops[0].text) }, 'write', true);
    return;
  }
  if (ops.length === 0) return;
  const dest = ops[ops.length - 1];
  files(ctx, ops.slice(0, -1), sourceAccess);
  analyzer.addPath(dest, 'write', true);
  if (name !== 'ln') copies(ctx, name, ops.slice(0, -1), dest, ops.length > 2 || dest.text.endsWith('/'));
}

export function chmodLike(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  let recursive = false;
  let reference = false;
  const operands: Arg[] = [];
  for (const arg of rest) {
    const t = arg.text;
    if (/^-[RvcfhHLP]+$/.test(t) || t === '--recursive' || t.startsWith('--')) {
      if (/^-[a-zA-Z]*R/.test(t) || t === '--recursive') recursive = true;
      if (t.startsWith('--reference')) reference = true;
      continue;
    }
    operands.push(arg);
  }
  // The first operand is the mode or owner (`755`, `+x`, `-w`, `user:group`).
  for (const op of reference ? operands : operands.slice(1)) {
    ctx.analyzer.addPath(op, 'write', true);
    if (recursive) ctx.analyzer.destroy(op, `${name} -R`);
  }
}

export function dd(ctx: CommandContext, rest: readonly Arg[]): void {
  const input = rest.find((a) => a.text.startsWith('if='));
  const output = rest.find((a) => a.text.startsWith('of='));
  if (output) {
    const dest = { ...output, text: output.text.slice(3) };
    if (input) copies(ctx, 'dd', [{ ...input, text: input.text.slice(3) }], dest, false);
    else copies(ctx, 'dd', [], dest, false, ctx.analyzer.stdin.sources);
  }
  for (const arg of rest) {
    const m = /^(if|of)=(.*)$/.exec(arg.text);
    if (!m) continue;
    const target = { ...arg, text: m[2] };
    if (m[1] === 'if') {
      ctx.analyzer.addPath(target, 'read', true);
    } else {
      if (m[2].startsWith('/dev/') && !/^\/dev\/(null|stdout|stderr)$/.test(m[2])) {
        ctx.analyzer.flag('destructive', `dd writes raw blocks to ${m[2]}`);
      }
      ctx.analyzer.addPath(target, 'write', true);
      ctx.analyzer.destroy(target, 'dd of=');
    }
  }
}
