/**
 * Commands that talk to other machines: uploads (`curl -d @file`, `scp` to a
 * host, publishing a package), servers and tunnels that expose the project to
 * the network, and raw network tools.
 */

import type { Arg } from './analyze';
import { type CommandContext, generic, has, parse, valuesOf } from './args';
import { isLoopbackHost, isPathLike, isRemoteSpec, isUrl } from './words';

const CURL_WITH_VALUE = new Set([
  '-d',
  '-F',
  '-T',
  '-H',
  '-o',
  '-u',
  '-X',
  '-A',
  '-e',
  '-b',
  '-c',
  '-K',
  '-E',
  '-x',
  '-w',
  '-m',
  '-y',
  '-Y',
  '-z',
  '-C',
  '-r',
  '-Q',
  '-D',
  '-U',
  '-t',
  '--data',
  '--data-binary',
  '--data-raw',
  '--data-ascii',
  '--data-urlencode',
  '--json',
  '--form',
  '--form-string',
  '--upload-file',
  '--header',
  '--output',
  '--config',
  '--url',
  '--user',
  '--request',
  '--cookie',
  '--cookie-jar',
  '--proxy',
  '--cert',
  '--key',
  '--cacert',
  '--dump-header',
  '--write-out',
  '--max-time',
  '--connect-timeout',
  '--retry',
  '--referer',
  '--user-agent',
  '--range',
  '--resolve',
  '--output-dir'
]);

function isLocalUrl(url: string): boolean {
  const m = /^(?:[a-z][a-z0-9+.-]*:\/\/)?(?:[^@/]*@)?(\[[^\]]*\]|[^:/?#]*)/i.exec(url);
  return isLoopbackHost(m?.[1] ?? '');
}

export function curl(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const p = parse(rest, CURL_WITH_VALUE);
  const say = (detail: string) => analyzer.flag('upload', `it uploads data: ${detail}`);
  let dataForms = false;
  for (const key of ['-d', '--data', '--data-binary', '--data-raw', '--data-ascii', '--json']) {
    for (const v of p.values.get(key) ?? []) {
      dataForms = true;
      if (v.unknown) say(`curl ${key} with a value from a variable or substitution`);
      if (v.text.startsWith('@')) {
        say(`curl ${key} ${v.text} sends a file's contents`);
        if (v.text !== '@-') analyzer.addPath({ ...v, text: v.text.slice(1) }, 'read', true);
      }
    }
  }
  for (const v of p.values.get('--data-urlencode') ?? []) {
    dataForms = true;
    const at = v.text.indexOf('@');
    if (at >= 0) {
      say(`curl --data-urlencode ${v.text} sends a file's contents`);
      const file = v.text.slice(at + 1);
      if (file !== '-') analyzer.addPath({ ...v, text: file }, 'read', true);
    }
  }
  for (const v of valuesOf(p, '-F', '--form')) {
    dataForms = true;
    const m = /=([@<])([^;]*)/.exec(v.text);
    if (m) {
      say(`curl -F ${v.text} sends a file`);
      if (m[2] !== '-') analyzer.addPath({ ...v, text: m[2] }, 'read', true);
    }
  }
  for (const v of valuesOf(p, '-T', '--upload-file')) {
    dataForms = true;
    say(`curl -T ${v.text} uploads a file`);
    if (v.text !== '-' && v.text !== '.') analyzer.addPath(v, 'read', true);
  }
  for (const v of valuesOf(p, '-H', '--header')) {
    if (v.text.startsWith('@')) {
      say(`curl -H ${v.text} sends headers from a file`);
      analyzer.addPath({ ...v, text: v.text.slice(1) }, 'read', true);
    }
  }
  for (const v of valuesOf(p, '-K', '--config')) {
    analyzer.dynamic(`curl ${v.text === '-' ? 'reads its options from stdin' : `reads its options from ${v.raw}`}`);
    if (v.text !== '-') analyzer.addPath(v, 'read', true);
  }
  for (const v of valuesOf(p, '-o', '--output', '-c', '--cookie-jar', '-D', '--dump-header')) {
    if (v.text !== '-') analyzer.addPath(v, 'write', true);
  }
  for (const v of valuesOf(p, '--output-dir')) analyzer.addPath(v, 'write', true);
  for (const v of valuesOf(p, '-E', '--cert', '--key', '--cacert', '-b', '--cookie')) {
    if (isPathLike(v.text)) analyzer.addPath(v, 'read', true);
  }
  const urls = [...p.positionals, ...valuesOf(p, '--url')];
  for (const u of p.positionals) if (!isUrl(u.text) && isPathLike(u.text) && !/^[\w.-]+:\d/.test(u.text)) analyzer.operand(u);
  const remote = urls.length === 0 || urls.some((u) => u.unknown || !isLocalUrl(u.text));
  if (ctx.stdinFed && dataForms) say('curl sends data it reads from stdin');
  else if (ctx.stdinFed && remote) say('curl gets piped input and talks to a remote host');
}

export function wget(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const p = parse(
    rest,
    new Set(['-O', '-o', '-a', '-P', '-i', '--post-file', '--body-file', '--output-document', '--input-file'])
  );
  for (const v of valuesOf(p, '--post-file', '--body-file')) {
    analyzer.flag('upload', `it uploads data: wget sends ${v.raw}`);
    analyzer.addPath(v, 'read', true);
  }
  for (const v of valuesOf(p, '-O', '--output-document', '-o', '-a', '-P')) {
    if (v.text !== '-') analyzer.addPath(v, 'write', true);
  }
  for (const v of valuesOf(p, '-i', '--input-file')) if (v.text !== '-') analyzer.addPath(v, 'read', true);
  const remote = p.positionals.length === 0 || p.positionals.some((u) => u.unknown || !isLocalUrl(u.text));
  if (ctx.stdinFed && remote) analyzer.flag('upload', 'it uploads data: wget gets piped input and talks to a remote host');
}

export function remoteCopy(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const withValue =
    name === 'scp'
      ? new Set(['-i', '-F', '-P', '-o', '-c', '-l', '-S', '-J'])
      : new Set(['-e', '--rsh', '--exclude', '--include', '--exclude-from', '--include-from', '--files-from', '-f', '--filter']);
  const p = parse(rest, withValue);
  for (const v of valuesOf(p, '-i', '-F', '--exclude-from', '--include-from', '--files-from')) {
    if (v.text === '-') analyzer.flag('stdin-operands', `${name} takes file names from its input, which cannot be checked before it runs`);
    else analyzer.addPath(v, 'read', true);
  }
  const ops = p.positionals;
  if (ops.length === 0) return;
  const dest = ops[ops.length - 1];
  const sources = ops.slice(0, -1);
  if (isRemoteSpec(dest.text) || dest.unknown) {
    analyzer.flag('upload', `it uploads data: ${name} copies to the remote ${dest.raw}`);
  } else {
    analyzer.addPath(dest, 'write', true);
  }
  for (const s of sources) if (!isRemoteSpec(s.text)) analyzer.addPath(s, 'read', true);
}

export function ssh(ctx: CommandContext, rest: readonly Arg[]): void {
  const { analyzer } = ctx;
  const p = parse(rest, new Set(['-i', '-F', '-o', '-p', '-l', '-J', '-L', '-R', '-D', '-E', '-S', '-W', '-b', '-c', '-e', '-m', '-O', '-Q', '-w']));
  for (const v of valuesOf(p, '-i', '-F')) analyzer.addPath(v, 'read', true);
  if (has(p, '-R')) expose(ctx, 'ssh -R forwards a port from a remote host to this machine');
  if (ctx.stdinFed) analyzer.flag('upload', 'it uploads data: ssh gets piped input');
}

function expose(ctx: CommandContext, what: string): void {
  ctx.analyzer.flag('network-exposure', `it exposes this machine to the network: ${what}`);
}

/** Tunnels that put a local port on the internet. */
export const TUNNELS = new Set(['ngrok', 'cloudflared', 'localtunnel', 'lt']);

export function tunnel(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  expose(ctx, `${name} opens a public tunnel to a local port`);
  generic(ctx, rest.filter((a) => isPathLike(a.text)));
}

/** The value of one option, as `-b X`, `-bX`, `--bind X` or `--bind=X`. */
function optionValue(rest: readonly Arg[], short: string | null, long: string | null): string | undefined {
  for (let k = 0; k < rest.length; k++) {
    const t = rest[k].text;
    if (t === short || t === long) return rest[k + 1]?.text ?? '';
    if (long && t.startsWith(`${long}=`)) return t.slice(long.length + 1);
    if (short && t.startsWith(short) && t.length > short.length && !t.startsWith('--')) return t.slice(short.length);
  }
  return undefined;
}

/** The host of `host:port`, `[::1]:port` or a bare host. */
function hostOf(address: string): string {
  const v6 = /^\[([^\]]*)\]/.exec(address);
  if (v6) return v6[1];
  const colon = address.lastIndexOf(':');
  return colon > 0 && address.indexOf(':') === colon ? address.slice(0, colon) : address;
}

/** A dev server that serves files on an address: asks unless it is loopback only. */
function serves(ctx: CommandContext, what: string, address: string | undefined): void {
  if (address !== undefined && address !== '' && isLoopbackHost(hostOf(address))) return;
  expose(ctx, `${what} serves files on ${address ? hostOf(address) : 'every network interface'}`);
}

/** `python -m http.server` binds every interface unless `--bind` says otherwise. */
export function pythonServer(ctx: CommandContext, rest: readonly Arg[]): void {
  const m = rest.findIndex((a) => a.text === '-m');
  const module = m >= 0 ? rest[m + 1]?.text : undefined;
  if (module === 'SimpleHTTPServer') serves(ctx, 'python -m SimpleHTTPServer', undefined);
  else if (module === 'http.server') serves(ctx, 'python -m http.server', optionValue(rest.slice(m + 2), '-b', '--bind'));
}

/** `php -S host:port`. */
export function phpServer(ctx: CommandContext, rest: readonly Arg[]): void {
  const address = optionValue(rest, '-S', null);
  if (address !== undefined) serves(ctx, 'php -S', address);
}

/** `ruby -run -e httpd`. */
export function rubyServer(ctx: CommandContext, rest: readonly Arg[]): void {
  const un = rest.some((a, k) => a.text === '-run' || (a.text === '-r' && rest[k + 1]?.text === 'un'));
  if (un && rest.some((a) => a.text === 'httpd')) serves(ctx, 'ruby -run -e httpd', optionValue(rest, null, '--bind-address'));
}

/** `busybox httpd -p [ip:]port`. */
export function busyboxServer(ctx: CommandContext, rest: readonly Arg[]): void {
  const port = optionValue(rest, '-p', null);
  serves(ctx, 'busybox httpd', port !== undefined && port.includes(':') ? port : undefined);
}

/** Commands that send a package or an image to a registry, by program, and the subcommand that does. */
const PUBLISH = new Map([
  ['npm', 'publish'],
  ['pnpm', 'publish'],
  ['yarn', 'publish'],
  ['bun', 'publish'],
  ['gem', 'push'],
  ['twine', 'upload'],
  ['cargo', 'publish'],
  ['docker', 'push'],
  ['podman', 'push']
]);

/** `npm publish`, `docker push`, …: an upload. */
export function publishes(name: string, ctx: CommandContext, rest: readonly Arg[]): void {
  const sub = PUBLISH.get(name);
  if (sub && rest.some((a) => a.text === sub)) ctx.analyzer.flag('upload', `it uploads data: ${name} ${sub} sends it to a registry`);
}
