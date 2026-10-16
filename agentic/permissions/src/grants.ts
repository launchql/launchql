/**
 * Grants: "allow this again" answers, keyed by what the call touches.
 *
 * A path grant covers a file tool call whose every target sits inside its
 * folder with the same access. A command grant covers a bash call with the
 * exact same normalized command. Nothing ever matches on a tool name alone.
 */

import { commonParent, contains, displayDir } from './paths';
import { SIGNAL_RULES } from './signals';
import type { Access, Grant, GrantMatch, GrantOption, PermissionRequest, Signal, Target } from './types';

/** Signals a grant must never cover: each such call needs its own yes. */
export const NEVER_GRANTED: readonly Signal[] = (Object.keys(SIGNAL_RULES) as Signal[]).filter((s) => !SIGNAL_RULES[s].grantable);

export function isGrantable(request: PermissionRequest): boolean {
  return !request.signals.some((s) => NEVER_GRANTED.includes(s));
}

/** `match` covers the request. */
export function matchCovers(match: GrantMatch, request: PermissionRequest): boolean {
  if (match.type === 'command') {
    return request.toolName === 'bash' && request.command !== undefined && request.command === match.command;
  }
  if (request.toolName === 'bash' || !pathGrantable(request)) return false;
  return request.targets.every(
    (t) => t.access === match.access && t.zone !== 'unresolvable' && contains(match.pathPrefix, t.path)
  );
}

/** A glob outside the project: a folder grant cannot say where it expands to. */
function isOutsideGlob(t: Target): boolean {
  return Boolean(t.glob) && t.zone !== 'workspace' && t.zone !== 'temp';
}

/** A folder grant can hold the request: it has targets, and none is a glob outside the project. */
function pathGrantable(request: PermissionRequest): boolean {
  return request.targets.length > 0 && !request.targets.some(isOutsideGlob);
}

/** The first grant that covers the request, or `undefined`. Never for an ungrantable request. */
export function findGrant(grants: readonly Grant[], request: PermissionRequest): Grant | undefined {
  if (!isGrantable(request)) return undefined;
  const ordered = [...grants.filter((g) => g.scope === 'chat'), ...grants.filter((g) => g.scope !== 'chat')];
  return ordered.find((g) => matchCovers(g.match, request));
}

export const ACCESS_VERB: Readonly<Record<Access, string>> = { read: 'reads', write: 'writes', exec: 'runs' };

/** What a grant covers, in words: "reads in ~/work/lib/", "bash: pnpm dlx shadcn add button". */
export function describeGrant(match: GrantMatch, homeDir: string): string {
  if (match.type === 'command') return `bash: ${match.command}`;
  return `${ACCESS_VERB[match.access]} in ${displayDir(match.pathPrefix, homeDir)}`;
}

/** The scopes the user may pick on an ASK: this chat, or always for this project. */
export function grantOptionsFor(request: PermissionRequest, homeDir: string): GrantOption[] {
  if (!isGrantable(request)) return [];
  let match: GrantMatch;
  let pattern: string;
  let always: string;
  if (request.toolName === 'bash') {
    if (!request.command) return [];
    match = { type: 'command', command: request.command };
    pattern = request.command;
    always = `Always allow ${request.command}`;
  } else {
    if (!pathGrantable(request)) return [];
    const access = request.targets[0].access;
    if (request.targets.some((t) => t.access !== access)) return [];
    const prefix = commonParent(request.targets.map((t) => t.path));
    match = { type: 'path', access, pathPrefix: prefix };
    pattern = displayDir(prefix, homeDir);
    always = `Always allow ${describeGrant(match, homeDir)}`;
  }
  return [
    { scope: 'chat', label: 'Allow in this chat', pattern, match },
    { scope: 'project', label: always, pattern, match }
  ];
}

/** The grant one of an ASK's options saves. */
export function grantFrom(option: GrantOption, now: Date = new Date()): Grant {
  return { scope: option.scope, match: option.match, createdAt: now.toISOString() };
}

/** Two matches are the same grant (for de-duplicating a store). */
export function sameMatch(a: GrantMatch, b: GrantMatch): boolean {
  if (a.type === 'command' && b.type === 'command') return a.command === b.command;
  if (a.type === 'path' && b.type === 'path') return a.access === b.access && a.pathPrefix === b.pathPrefix;
  return false;
}

/**
 * Where a host keeps project grants. Desktop keeps one JSON file per project;
 * a worktree project reads and writes its parent's.
 */
export interface GrantStore {
  list(): readonly Grant[] | Promise<readonly Grant[]>;
  add(grant: Grant): void | Promise<void>;
}

/** An in-memory store (tests, and hosts with no persistence). */
export function memoryGrantStore(initial: readonly Grant[] = []): GrantStore & { grants: Grant[] } {
  const grants = [...initial];
  return {
    grants,
    list: () => grants,
    add(grant) {
      if (!grants.some((g) => sameMatch(g.match, grant.match))) grants.push(grant);
    }
  };
}
