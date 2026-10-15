/**
 * The pi side of the permissions layer: classify every built-in tool call with
 * the neutral engine, ask through the run's approval channel when it must, and
 * keep secret values out of every tool result the model sees.
 *
 * Loaded by `composeRun` before the DB gate, so it decides on the input after
 * every file-based extension ran and before trusted host code. It abstains on
 * tools that are not pi built-ins: the DB gate and the host own those.
 *
 * Fails closed: an engine error blocks the call, and a redaction error
 * withholds the output (pi swallows a `tool_result` throw and would send the
 * raw output, so the catch here is the only guard).
 */

import type { ApprovalChannel, ApprovalGrantScope } from '@agentic-kit/harness';
import {
  BUILTIN_TOOLS,
  type Grant,
  grantFrom,
  type GrantStore,
  type PermissionDecision,
  type PermissionEngine,
  type PermissionMode,
  scrubEnv,
  type Signal
} from '@agentic-kit/permissions';
import type {
  createBashToolDefinition,
  ExtensionAPI,
  ExtensionFactory,
  ToolCallEvent,
  ToolResultEvent
} from '@earendil-works/pi-coding-agent';

/** The session entry that carries one chat-scope grant. Not sent to the model. */
export const PERMISSION_GRANT_ENTRY = 'agentic.permissions.grant';

export const PERMISSION_INTERNAL_ERROR = 'permissions: internal error — the call was blocked';

export const PERMISSION_OUTPUT_WITHHELD =
  'permissions: output withheld — redaction failed, so the result was not sent to the model';

export interface PermissionDecisionRecord {
  runId: string;
  toolCallId: string;
  toolName: string;
  /** What the engine said before any human answered. */
  verdict: PermissionDecision['decision'];
  /** How the call was finally settled. */
  decision: 'allow' | 'deny';
  reason?: string;
  signals: Signal[];
  targets: { path: string; access: string; zone: string }[];
  /** On an approved ask: how far the answer reaches. */
  scope?: 'once' | ApprovalGrantScope;
  actorId?: string;
  decidedAt: string;
}

export interface PermissionsExtensionOptions {
  runId: string;
  engine: PermissionEngine;
  /** Read at every decision, so a mode change applies to the next tool call. */
  getMode: () => PermissionMode | Promise<PermissionMode>;
  /** Required for `ask`. Without one, an ask becomes a deny that tells the model why. */
  approvals?: ApprovalChannel;
  /** Where "always in this project" grants live (a file per project on desktop). */
  projectGrants?: GrantStore;
  /** Every settled decision, for the run log / audit trail. */
  onDecision?: (record: PermissionDecisionRecord) => void;
  /** Internal failures (the call is already blocked or withheld). */
  onError?: (error: unknown, phase: 'tool_call' | 'tool_result' | 'session_start') => void;
  /**
   * Replace pi's `bash` with one whose commands run without the secret-looking
   * variables of the host environment, so a command cannot send a provider key
   * or token it never saw. The host passes pi's own factory (this package
   * imports pi as types only).
   */
  bash?: { cwd: string; createDefinition: typeof createBashToolDefinition };
  now?: () => Date;
}

export interface PermissionsExtension {
  extension: ExtensionFactory;
  /** The grants this chat holds (restored from the session on start). */
  readonly chatGrants: readonly Grant[];
}

type AskDecision = Extract<PermissionDecision, { decision: 'ask' }>;

export function createPermissionsExtension(options: PermissionsExtensionOptions): PermissionsExtension {
  const { engine, runId } = options;
  const now = options.now ?? (() => new Date());
  const chatGrants: Grant[] = [];

  const record = (
    decision: PermissionDecision,
    settled: 'allow' | 'deny',
    extra: { reason?: string; scope?: PermissionDecisionRecord['scope']; actorId?: string } = {}
  ): void => {
    options.onDecision?.({
      runId,
      toolCallId: decision.request.toolCallId,
      toolName: decision.request.toolName,
      verdict: decision.decision,
      decision: settled,
      ...(extra.reason === undefined ? {} : { reason: extra.reason }),
      signals: decision.request.signals,
      targets: decision.request.targets.map(({ path, access, zone }) => ({ path, access, zone })),
      ...(extra.scope === undefined ? {} : { scope: extra.scope }),
      ...(extra.actorId === undefined ? {} : { actorId: extra.actorId }),
      decidedAt: now().toISOString()
    });
  };

  const remember = async (pi: ExtensionAPI, decision: AskDecision, scope: ApprovalGrantScope) => {
    const option = decision.grantOptions.find((candidate) => candidate.scope === scope);
    if (!option) return;
    const grant = grantFrom(option);
    if (scope === 'chat') {
      chatGrants.push(grant);
      pi.appendEntry(PERMISSION_GRANT_ENTRY, grant);
    } else {
      await options.projectGrants?.add(grant);
    }
  };

  const decide = async (pi: ExtensionAPI, event: ToolCallEvent) => {
    const input = (event.input ?? {}) as Record<string, unknown>;
    const call = { toolCallId: event.toolCallId, toolName: event.toolName, input };
    const projectGrants = (await options.projectGrants?.list()) ?? [];
    const decision = await engine.evaluate(call, {
      mode: await options.getMode(),
      grants: [...chatGrants, ...projectGrants]
    });
    if (!decision) return undefined;

    if (decision.decision === 'allow') {
      engine.restoreInput(decision, input);
      record(decision, 'allow');
      return undefined;
    }

    if (decision.decision === 'deny') {
      record(decision, 'deny', { reason: decision.reason });
      return { block: true, reason: decision.reason };
    }

    if (!options.approvals) {
      const reason = `${decision.reason} — this needs user approval, and no one can approve it here; ask the user to allow it`;
      record(decision, 'deny', { reason });
      return { block: true, reason };
    }

    const outcome = await options.approvals.request({
      runId,
      toolCallId: event.toolCallId,
      toolName: event.toolName,
      input,
      reason: decision.reason,
      requestedAt: now().toISOString(),
      permission: decision.prompt
    });

    if (outcome.decision !== 'allow') {
      const reason = outcome.reason ?? `permissions: the user denied this ${event.toolName} call`;
      record(decision, 'deny', { reason, actorId: outcome.actorId });
      return { block: true, reason };
    }

    const scope = outcome.grant?.scope;
    if (scope) await remember(pi, decision, scope);
    engine.restoreInput(decision, input, { approved: true });
    record(decision, 'allow', { scope: scope ?? 'once', actorId: outcome.actorId });
    return undefined;
  };

  const extension: ExtensionFactory = (pi: ExtensionAPI) => {
    if (options.bash) {
      const { cwd, createDefinition } = options.bash;
      pi.registerTool(createDefinition(cwd, { spawnHook: (spawn) => ({ ...spawn, env: scrubEnv(spawn.env) }) }));
    }

    pi.on('session_start', async (_event, ctx) => {
      chatGrants.length = 0;
      try {
        for (const entry of ctx.sessionManager.getEntries()) {
          if (entry.type === 'custom' && entry.customType === PERMISSION_GRANT_ENTRY && entry.data) {
            chatGrants.push(entry.data as Grant);
          }
        }
      } catch (error) {
        options.onError?.(error, 'session_start');
      }
    });

    pi.on('tool_call', async (event) => {
      if (!BUILTIN_TOOLS.has(event.toolName)) return undefined;
      try {
        return await decide(pi, event);
      } catch (error) {
        options.onError?.(error, 'tool_call');
        return { block: true, reason: PERMISSION_INTERNAL_ERROR };
      }
    });

    // Every tool's output passes through redaction, not only the built-ins: a
    // host tool can echo a token as easily as `cat .env` can.
    pi.on('tool_result', async (event) => {
      try {
        const redacted = await engine.redactResult({
          toolName: event.toolName,
          content: event.content ?? [],
          details: event.details
        });
        if (!redacted.changed) return undefined;
        // Redaction keeps every block's shape and only rewrites the text in it.
        return { content: redacted.content as ToolResultEvent['content'], details: redacted.details };
      } catch (error) {
        options.onError?.(error, 'tool_result');
        return {
          content: [{ type: 'text' as const, text: PERMISSION_OUTPUT_WITHHELD }],
          details: undefined,
          isError: true
        };
      }
    });
  };

  return { extension, chatGrants };
}
