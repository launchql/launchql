/**
 * The decision for a classified request. First match wins:
 *
 * 1. a hard-deny or protected-write target: DENY (no grant changes this)
 * 2. a user deny rule: DENY (reserved; no rule UI in v1)
 * 3. a chat grant, then a project grant, that covers the request: ALLOW
 * 4. a user allow rule: ALLOW (reserved)
 * 5. the mode default (see `modeDefault`)
 */

import { ACCESS_VERB, findGrant, grantOptionsFor, matchCovers } from './grants';
import { showPath } from './paths';
import { buildPrompt, type PromptDisplay } from './prompt';
import { SIGNAL_RULES } from './signals';
import type { Grant, GrantMatch, PermissionDecision, PermissionMode, PermissionRequest, Signal, Target } from './types';

export interface PolicyRules {
  deny?: readonly GrantMatch[];
  allow?: readonly GrantMatch[];
}

export interface PolicyContext extends PromptDisplay {
  mode: PermissionMode;
  grants: readonly Grant[];
  rules?: PolicyRules;
}

const ING = { read: 'reading', write: 'writing', exec: 'running' } as const;

/** The classifier's sentence for a signal. */
function reasonFor(signal: Signal, request: PermissionRequest): string {
  return request.signalReasons[signal] ?? signal;
}

function blockedTarget(request: PermissionRequest): Target | undefined {
  return request.targets.find((t) => t.zone === 'hard-deny' || (t.zone === 'protected' && t.access === 'write'));
}

function denyReason(request: PermissionRequest, target: Target, ctx: PromptDisplay): string {
  const shown = showPath(target.path, ctx.workspace, ctx.homeDir);
  const bash = request.toolName === 'bash';
  if (target.zone === 'hard-deny') {
    const what = bash ? `this command ${ACCESS_VERB[target.access]} ${shown}, which` : `${ING[target.access]} ${shown}`;
    return `permissions: ${what} is not allowed (${target.label}; blocked in every mode)`;
  }
  const what = bash ? `this command writes ${shown}, which` : `writing ${shown}`;
  return `permissions: ${what} is not allowed (${target.label}; protected in every mode)`;
}

/** What the request is, for a reason: "reading /etc/hosts", "this command". */
function describe(request: PermissionRequest, ctx: PromptDisplay): string {
  if (request.toolName === 'bash') return 'this command';
  const shown = request.targets.map((t) => showPath(t.path, ctx.workspace, ctx.homeDir)).join(', ');
  const verb = request.toolName === 'edit' ? 'editing' : ING[request.targets[0]?.access ?? 'read'];
  return `${verb} ${shown}`;
}

/** The mode default (step 5): the sentences that make it ask; empty means allow. */
function modeDefault(request: PermissionRequest, mode: PermissionMode): string[] {
  const asks = (s: Signal) => {
    const rule = SIGNAL_RULES[s].asks;
    return rule === 'always' || (rule === 'unless-full' && mode !== 'full');
  };
  const reasons = request.signals.filter(asks).map((s) => reasonFor(s, request));
  if (mode === 'ask') {
    if (request.kind === 'write') reasons.push('Ask mode asks before every file change');
    if (request.kind === 'exec') reasons.push('Ask mode asks before every command');
  }
  return reasons;
}

export function decide(request: PermissionRequest, ctx: PolicyContext): PermissionDecision {
  const allow = (reason: string): PermissionDecision => ({ decision: 'allow', reason, request });
  const deny = (reason: string): PermissionDecision => ({ decision: 'deny', reason, request });

  const blocked = blockedTarget(request);
  if (blocked) return deny(denyReason(request, blocked, ctx));
  if (ctx.rules?.deny?.some((m) => matchCovers(m, request))) {
    return deny(`permissions: ${describe(request, ctx)} is blocked by a deny rule`);
  }
  const grant = findGrant(ctx.grants, request);
  if (grant) return allow(`permissions: allowed by a ${grant.scope} grant`);
  if (ctx.rules?.allow?.some((m) => matchCovers(m, request)) && !request.signals.includes('unresolvable-path')) {
    return allow('permissions: allowed by an allow rule');
  }
  const asks = modeDefault(request, ctx.mode);
  if (asks.length === 0) return allow(`permissions: allowed in ${ctx.mode} mode`);

  // The card leads with why it asks, then adds what else the user should know
  // (a secret file's values reach the model only as placeholders).
  const explained = request.signals.map((s) => reasonFor(s, request));
  const reasons = [...new Set([...asks, ...explained])];
  const grantOptions = grantOptionsFor(request, ctx.homeDir);
  return {
    decision: 'ask',
    reason: `permissions: ${describe(request, ctx)} needs approval: ${asks.join('; ')}`,
    request,
    grantOptions,
    prompt: buildPrompt(request, reasons, grantOptions, ctx)
  };
}
