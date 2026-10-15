/**
 * Turn one built-in tool call into a `PermissionRequest`: its canonical
 * targets, their zones, and the risk signals, each with the sentence that
 * explains it. No decision is made here.
 */

import * as path from 'node:path';

import { analyzeBash, type DestructiveCheck, normalizeCommand } from './bash/analyze';
import type { ContentFlow } from './bash/flows';
import { Findings } from './findings';
import { GLOB_CHARS } from './glob';
import { canonicalize, resolveLikePi, showPath } from './paths';
import { globZoneOf, isRootItself, type Roots, zoneOf } from './roots';
import { globNamesSecretFiles, isSecretFile } from './secret-files';
import { SECRET_KEY_PATTERN, type SecretVault } from './secrets';
import { newTexts, stringField } from './tool-input';
import { type Access, type BuiltinTool, type FsProbe, type PermissionRequest, type Signal, type Target, TOOL_KIND, type Zone } from './types';

export interface ClassifyContext {
  cwd: string;
  homeDir: string;
  roots: Roots;
  fs: FsProbe;
  vault: SecretVault;
  /** Env names the host marked secret (`refreshSecrets({ env })`). */
  secretEnvNames: ReadonlySet<string>;
}

/** Zones stricter than the plain ones, strictest first. */
const RESTRICTIVE: readonly Zone[] = ['hard-deny', 'protected', 'ask-write'];

const ZONE_SIGNAL: Partial<Record<Zone, Signal>> = {
  'hard-deny': 'hard-deny',
  protected: 'protected-write',
  'ask-write': 'ask-write',
  outside: 'outside-workspace',
  unresolvable: 'unresolvable-path'
};

function strictness(zone: Zone): number {
  const at = RESTRICTIVE.indexOf(zone);
  return at < 0 ? RESTRICTIVE.length : at;
}

/** How a path with an unexpanded glob is judged: `dot` when `*` may match dotfiles. */
interface GlobInfo {
  dot: boolean;
}

type Place = Pick<Target, 'path' | 'zone' | 'label'>;

/**
 * Where a path sits. The canonical path decides the zone, but the lexical
 * spelling can only make it stricter (`~/.ssh` reached through a link). With
 * no canonical path, only a restrictive lexical zone stands.
 */
function placeOf(lexical: string, canonical: string | null, access: Access, roots: Roots): Place {
  const lexicalHit = zoneOf(lexical, access, roots);
  if (canonical === null) {
    return RESTRICTIVE.includes(lexicalHit.zone)
      ? { path: lexical, zone: lexicalHit.zone, label: lexicalHit.root.label }
      : { path: lexical, zone: 'unresolvable', label: 'unresolvable' };
  }
  let hit = zoneOf(canonical, access, roots);
  if (canonical !== lexical && strictness(lexicalHit.zone) < strictness(hit.zone)) hit = lexicalHit;
  return { path: canonical, zone: hit.zone, label: hit.root?.label ?? hit.zone };
}

/**
 * The target for one path. A glob is matched as a pattern first: if it can
 * expand into a restrictive root, it takes that root's zone.
 */
async function makeTarget(raw: string, abs: string, access: Access, ctx: ClassifyContext, glob?: GlobInfo): Promise<Target> {
  const lexical = path.resolve(abs);
  const canonical = await canonicalize(abs, ctx.fs);
  const secretFile =
    isSecretFile(lexical) ||
    (canonical !== null && isSecretFile(canonical)) ||
    (glob !== undefined && globNamesSecretFiles(path.basename(lexical)));
  const globHit = glob
    ? (globZoneOf(lexical, access, ctx.roots, glob.dot) ?? (canonical ? globZoneOf(canonical, access, ctx.roots, glob.dot) : undefined))
    : undefined;
  const place: Place = globHit
    ? { path: canonical ?? lexical, zone: globHit.zone, label: globHit.root.label }
    : placeOf(lexical, canonical, access, ctx.roots);
  return { raw, path: place.path, access, zone: place.zone, secretFile, label: place.label, ...(glob ? { glob: true } : {}) };
}

function zoneSentence(t: Target, shown: string): string {
  switch (t.zone) {
  case 'hard-deny':
    return `${shown} is in a credential store (${t.label}) that the agent may never touch`;
  case 'protected':
    return `${shown} is in the ${t.label}, which the agent may not change`;
  case 'ask-write':
    return `${shown} is a ${t.label}: a change there runs code later`;
  case 'outside':
    return `${shown} is outside the project`;
  case 'unresolvable':
    return `${shown} goes through a symlink that cannot be resolved`;
  default:
    return `${shown} is in the ${t.label}`;
  }
}

/** `rm`, `dd of=`, `chmod -R`, …: destructive outside the project, or on a whole project or temp root. */
async function flagDestructive(checks: readonly DestructiveCheck[], ctx: ClassifyContext, findings: Findings) {
  const resetRoots = [...ctx.roots.workspace, ...ctx.roots.temp];
  const wipesRoot = (p: string) =>
    isRootItself(resetRoots, p) || (/^[*?.[\]]+$/.test(path.basename(p)) && isRootItself(resetRoots, path.dirname(p)));
  for (const check of checks) {
    const canonical = await canonicalize(check.abs, ctx.fs);
    if (canonical === null) continue;
    if (check.rootCounts && wipesRoot(canonical)) {
      findings.flag('destructive', `it runs ${check.what} on ${check.raw}, which wipes a whole project or temp dir`);
      continue;
    }
    const zone = zoneOf(canonical, 'write', ctx.roots).zone;
    if (zone !== 'workspace' && zone !== 'temp') {
      findings.flag('destructive', `it runs ${check.what} on ${show(canonical, ctx)}, outside the project`);
    }
  }
}

function show(p: string, ctx: Pick<ClassifyContext, 'roots' | 'homeDir'>): string {
  return showPath(p, ctx.roots.workspace[0]?.path, ctx.homeDir);
}

/**
 * Copies, clipboard writes and transforms of a secret file. Redaction matches
 * exact values, so a secret that is encoded, cut or copied into a plain file
 * gets past it.
 */
async function flagFlows(flows: readonly ContentFlow[], ctx: ClassifyContext, findings: Findings) {
  const known = new Map<string, boolean>();
  const isSecret = async (abs: string): Promise<boolean> => {
    if (!known.has(abs)) {
      const canonical = await canonicalize(abs, ctx.fs);
      known.set(abs, isSecretFile(abs) || (canonical !== null && isSecretFile(canonical)));
    }
    return known.get(abs);
  };
  for (const flow of flows) {
    for (const source of flow.sources) {
      if (!(await isSecret(source.abs))) continue;
      const shown = show(path.resolve(source.abs), ctx);
      if (flow.to.kind === 'transform') {
        // An upload already asks, and says more.
        if (!findings.signals.has('upload')) findings.flag('secret-transform', `it runs ${flow.what} on the secret file ${shown}; redaction cannot match values it changes`);
      } else if (flow.to.kind === 'clipboard') {
        findings.flag('upload', `it uploads data: ${flow.what} puts the secret file ${shown} on the clipboard`);
      } else {
        const dir = flow.to.dir || (await isDir(flow.to.abs, ctx.fs));
        const dest = dir ? path.join(flow.to.abs, path.basename(source.abs)) : flow.to.abs;
        if (await isSecret(dest)) continue;
        findings.flag(
          'secret-into-plain-file',
          `it copies the secret file ${shown} into ${show(path.resolve(dest), ctx)} with ${flow.what}, which is not a secret file`
        );
      }
    }
  }
}

async function isDir(abs: string, fs: FsProbe): Promise<boolean> {
  try {
    await fs.readDir(abs);
    return true;
  } catch {
    return false;
  }
}

async function bashTargets(command: string, ctx: ClassifyContext, findings: Findings): Promise<Target[]> {
  const analysis = analyzeBash(command, { cwd: ctx.cwd, homeDir: ctx.homeDir }, findings);
  const targets: Target[] = [];
  for (const p of analysis.paths) {
    const target = await makeTarget(p.raw, p.abs, p.access, ctx, p.glob ? { dot: analysis.dotglob } : undefined);
    // A bare word is only a target when it leads somewhere that matters.
    const plain = target.zone === 'workspace' || target.zone === 'temp' || target.zone === 'trusted';
    if (p.hard || target.secretFile || !plain) targets.push(target);
  }
  await flagDestructive(analysis.destructiveChecks, ctx, findings);
  await flagFlows(analysis.flows, ctx, findings);
  const secretVars = analysis.envRefs.filter((name) => SECRET_KEY_PATTERN.test(name) || ctx.secretEnvNames.has(name));
  if (secretVars.length > 0) {
    findings.flag(
      'secret-env-expansion',
      `it expands ${secretVars.map((n) => `$${n}`).join(', ')}, which ${secretVars.length === 1 ? 'holds a secret' : 'hold secrets'} the command can send or print`
    );
  }
  return targets;
}

async function fileTarget(toolName: BuiltinTool, input: Record<string, unknown>, ctx: ClassifyContext): Promise<Target> {
  const kind = TOOL_KIND[toolName];
  const rawPath = stringField(input, 'path') ?? (kind === 'read' && toolName !== 'read' ? '.' : undefined);
  const access: Access = kind === 'write' ? 'write' : 'read';
  const abs = rawPath === undefined ? null : resolveLikePi(rawPath, ctx.cwd, ctx.homeDir);
  if (abs === null) {
    const shown = rawPath ?? '(no path)';
    return { raw: shown, path: shown, access, zone: 'unresolvable', secretFile: false, label: 'unresolvable' };
  }
  return makeTarget(rawPath, abs, access, ctx, GLOB_CHARS.test(rawPath) ? { dot: true } : undefined);
}

function uniqueTargets(targets: readonly Target[]): Target[] {
  const seen = new Set<string>();
  return targets.filter((t) => {
    const key = `${t.access}\0${t.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function classify(
  call: { toolCallId: string; toolName: BuiltinTool; input: Record<string, unknown> },
  ctx: ClassifyContext
): Promise<PermissionRequest> {
  const { toolName, input } = call;
  const findings = new Findings();
  const command = toolName === 'bash' ? stringField(input, 'command') ?? '' : undefined;
  const targets = uniqueTargets(
    command === undefined ? [await fileTarget(toolName, input, ctx)] : await bashTargets(command, ctx, findings)
  );

  const glob = toolName === 'grep' ? stringField(input, 'glob') : undefined;
  if (glob && globNamesSecretFiles(glob)) findings.flag('secret-file', `the glob ${glob} names secret files; matches are redacted`);

  for (const target of targets) {
    const shown = show(target.path, ctx);
    const signal = ZONE_SIGNAL[target.zone];
    if (signal) findings.flag(signal, zoneSentence(target, shown));
    if (target.secretFile) findings.flag('secret-file', `${shown} is a secret file: its values reach the model only as placeholders`);
  }

  const written = toolName === 'write' || toolName === 'edit' ? targets[0] : undefined;
  if (written && !written.secretFile) {
    const found = newTexts(toolName, input)
      .map((text) => ctx.vault.findSecret(text))
      .find(Boolean);
    if (found) {
      const shown = show(written.path, ctx);
      findings.flag(
        'secret-into-plain-file',
        found.kind === 'value'
          ? `the new content of ${shown} holds the value of ${found.name}, and ${shown} is not a secret file`
          : `the new content of ${shown} holds the placeholder for ${found.name}; it would be written as literal text, because ${shown} is not a secret file`
      );
    }
  }

  return {
    toolCallId: call.toolCallId,
    toolName,
    kind: TOOL_KIND[toolName],
    targets,
    ...(command === undefined ? {} : { command: normalizeCommand(command) }),
    signals: [...findings.signals],
    signalReasons: findings.reasons
  };
}

