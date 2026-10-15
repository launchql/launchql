/**
 * Commands that reach past the project into the machine: jobs and services
 * that outlive the session, the macOS keychain, the clipboard, and archivers
 * that take their file names from stdin.
 */

import * as path from 'node:path';

import { KEYCHAIN_DIR } from '../roots';
import type { Arg } from './analyze';
import { type CommandContext, generic, literalArg } from './args';
import type { Source } from './flows';
import { isPathLike } from './words';

const LAUNCHCTL_LOADS = new Set(['load', 'bootstrap', 'submit', 'enable']);

/** `crontab`, `at`, `launchctl load`, `defaults write`: a change that lasts past this session. */
export function persistence(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const words = rest.map((a) => a.text);
  const say = (what: string) => ctx.analyzer.flag('persistence', `it makes a change that outlasts this session: ${what}`);
  if (name === 'crontab' && !words.includes('-l')) say('crontab installs or changes cron jobs');
  if ((name === 'at' || name === 'batch') && !words.some((w) => w === '-l' || w === '-c')) say(`${name} schedules a command to run later`);
  if (name === 'launchctl') {
    const sub = words.find((w) => !w.startsWith('-'));
    if (sub && LAUNCHCTL_LOADS.has(sub)) say(`launchctl ${sub} starts a background service`);
  }
  if (name === 'defaults' && words.some((w) => w === 'write' || w === 'import')) say('defaults write changes app or system settings');
  generic(ctx, rest.filter((a) => isPathLike(a.text)));
}

const KEYCHAIN_READS = new Set(['find-generic-password', 'find-internet-password', 'dump-keychain', 'export']);

/** `security find-generic-password`, …: a read of the keychain, which the hard-deny list blocks. */
export function security(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const sub = rest.find((a) => !a.text.startsWith('-'));
  const pem = sub?.text === 'find-certificate' && rest.some((a) => /^-[a-zA-Z]*p/.test(a.text));
  if (sub && (KEYCHAIN_READS.has(sub.text) || pem)) {
    analyzer.addPath(literalArg(path.join(analyzer.ctx.homeDir, KEYCHAIN_DIR), `security ${sub.text}`), 'read', true);
  }
  generic(ctx, rest.filter((a) => isPathLike(a.text)));
}

export const CLIPBOARD = new Set(['pbcopy', 'pbpaste', 'xclip', 'xsel', 'wl-copy', 'wl-paste']);

/** xclip options whose value is the next word. */
const XCLIP_WITH_VALUE = new Set(['-selection', '-sel', '-target', '-t', '-display', '-d', '-loops', '-l']);

/** The clipboard: a paste shows the model what the user copied, a copy may carry a secret file out. */
export function clipboard(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const words = rest.map((a) => a.text);
  const pastes =
    name === 'pbpaste' ||
    name === 'wl-paste' ||
    (name === 'xclip' && words.some((w) => w === '-o' || w === '-out')) ||
    (name === 'xsel' && (words.some((w) => /^(-[a-zA-Z]*o|--output)$/.test(w)) || (!ctx.stdinFed && !words.includes('-i'))));
  if (pastes) {
    analyzer.flag('clipboard', `it reads the clipboard with ${name}, which may hold anything the user copied`);
    return;
  }
  analyzer.flag('clipboard', `it puts text on the clipboard with ${name}`);
  const sources: Source[] = [...analyzer.stdin.sources];
  if (name === 'xclip') {
    for (let k = 0; k < rest.length; k++) {
      if (XCLIP_WITH_VALUE.has(rest[k].text)) k++;
      else if (!rest[k].text.startsWith('-')) {
        analyzer.addPath(rest[k], 'read', true);
        const abs = rest[k].unknown ? null : analyzer.toAbs(rest[k].text);
        if (abs !== null) sources.push({ raw: rest[k].raw, abs });
      }
    }
  }
  if (sources.length > 0) analyzer.tracker.flows.push({ sources, to: { kind: 'clipboard' }, what: name });
}

/** `cpio -o`, `tar -T -`, `zip -@`: the file names come from stdin. */
export function namesFromStdin(name: string, rest: readonly Arg[]): boolean {
  const words = rest.map((a) => a.text);
  if (name === 'cpio') return words.some((w) => /^-[a-zA-Z]*[op]/.test(w) || w === '--create' || w === '--pass-through');
  if (name === 'zip') return words.includes('-@');
  if (name === 'tar') {
    return words.some((w, k) => w === '-T-' || w === '--files-from=-' || ((w === '-T' || w === '--files-from') && words[k + 1] === '-'));
  }
  return false;
}
