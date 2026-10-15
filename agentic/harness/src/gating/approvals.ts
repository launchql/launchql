/**
 * The asynchronous half of the gate: an `ask` verdict has to reach a human who
 * may be on another machine, so approval is an interface rather than a prompt.
 *
 * `pollingApprovalChannel` is the baseline implementation of the platform's
 * rendezvous model — the request is submitted (a row), and the decision is
 * polled for (another row). No socket back into the agent's process, which is
 * what lets a cloud run be approved from a browser.
 */

import type { GrantScope, PermissionPrompt } from '@agentic-kit/permissions';

/**
 * The card for a permissions-layer request (a built-in tool such as `read` or
 * `bash`), as `@agentic-kit/permissions` builds it. A channel that sees it
 * renders this instead of its own prompt, and may offer the grant scopes.
 */
export type ApprovalPermissionPrompt = PermissionPrompt;

export type ApprovalGrantScope = GrantScope;

export interface ApprovalRequest {
  runId: string;
  toolCallId: string;
  toolName: string;
  input: Record<string, unknown>;
  /** The policy's reason for asking. */
  reason?: string;
  requestedAt: string;
  /** Set by the permissions lane; absent for every other gate. */
  permission?: ApprovalPermissionPrompt;
}

export interface ApprovalOutcome {
  decision: 'allow' | 'deny';
  reason?: string;
  /** Who decided, when the channel knows. */
  actorId?: string;
  /** On `allow`: remember it beyond this call. Absent means once. */
  grant?: { scope: ApprovalGrantScope };
}

export interface ApprovalChannel {
  /** Resolves once a decision exists; may take as long as a human takes. */
  request(request: ApprovalRequest): Promise<ApprovalOutcome>;
}

export interface PollingApprovalChannelOptions {
  /** Publish the request (insert the row, post to the API). */
  submit: (request: ApprovalRequest) => Promise<void>;
  /** Read the decision, or `undefined` while it is still outstanding. */
  poll: (request: ApprovalRequest) => Promise<ApprovalOutcome | undefined>;
  intervalMs?: number;
  /** Give up after this long. Omit to wait indefinitely. */
  timeoutMs?: number;
  /** Verdict on timeout. Defaults to `deny`: an unattended run must not take an
   * action nobody approved just because nobody was watching. */
  onTimeout?: 'deny' | 'allow';
  /** Injectable clock/sleep for tests. */
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

export function pollingApprovalChannel(options: PollingApprovalChannelOptions): ApprovalChannel {
  const intervalMs = options.intervalMs ?? 1000;
  const onTimeout = options.onTimeout ?? 'deny';
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = options.now ?? (() => Date.now());

  return {
    async request(request) {
      await options.submit(request);
      const startedAt = now();

      for (;;) {
        const outcome = await options.poll(request);
        if (outcome) return outcome;

        if (options.timeoutMs !== undefined && now() - startedAt >= options.timeoutMs) {
          return {
            decision: onTimeout,
            reason: `gate: no decision within ${options.timeoutMs}ms`
          };
        }
        await sleep(intervalMs);
      }
    }
  };
}

/** Decide every request the same way — for tests, and for a headless run that is
 * explicitly configured to auto-approve. */
export function staticApprovalChannel(outcome: ApprovalOutcome): ApprovalChannel {
  return { request: () => Promise.resolve(outcome) };
}
