/** The approval card for an ASK: a title, what it touches, and why it asks. */

import { showPath } from './paths';
import type { GrantOption, PermissionPrompt, PermissionRequest, Signal } from './types';

/** The title of a write to a file that runs code later, by the label of its root. */
const ASK_WRITE_TITLES: Record<string, string> = {
  'git hook': 'Write to a git hook',
  'git config': 'Change the git config',
  'direnv script': 'Change the direnv script',
  'editor task config': 'Change the editor task config'
};

/** The most specific title, by signal priority. */
export function promptTitle(request: PermissionRequest): string {
  const has = (s: Signal) => request.signals.includes(s);
  const bash = request.toolName === 'bash';
  if (has('placeholder-in-command')) return 'Run a command that uses a secret';
  if (has('upload')) return 'Run a command that uploads data';
  if (has('destructive')) return 'Run a destructive command';
  if (has('sudo')) return 'Run a command as root';
  if (has('persistence')) return 'Make a change that outlasts this session';
  if (has('network-exposure')) return 'Expose this machine to the network';
  if (has('secret-env-expansion')) return 'Run a command that uses a secret variable';
  if (has('secret-transform')) return 'Run a command that transforms a secret file';
  if (has('shell-dynamic')) return 'Run a command with dynamic shell code';
  if (has('secret-into-plain-file')) return 'Write a secret into a regular file';
  if (has('clipboard')) return 'Use the clipboard';
  if (has('stdin-operands')) return 'Run a command on file names from its input';
  if (has('ask-write')) {
    const label = request.targets.find((t) => t.zone === 'ask-write')?.label ?? '';
    return ASK_WRITE_TITLES[label] ?? 'Write to a file that runs code';
  }
  if (has('unresolvable-path')) return 'Use a path that cannot be resolved';
  if (has('outside-workspace')) {
    if (bash) return 'Run a command that touches files outside the project';
    if (request.kind === 'write') return 'Write a file outside the project';
    return 'Read a file outside the project';
  }
  if (bash) return 'Run a command';
  if (request.toolName === 'edit') return 'Edit a file';
  if (request.kind === 'write') return 'Write a file';
  return 'Read a file';
}

export interface PromptDisplay {
  workspace: string | undefined;
  homeDir: string;
}

/**
 * The card for an ASK. `reasons` are the sentences the policy asked for, in
 * order. With one target and no command, the card shows the path in its own
 * row, so a reason that opens with that path says "it" instead.
 */
export function buildPrompt(
  request: PermissionRequest,
  reasons: readonly string[],
  grantOptions: readonly GrantOption[],
  display: PromptDisplay
): PermissionPrompt {
  const shown = request.targets.map((t) => showPath(t.path, display.workspace, display.homeDir));
  const only = request.command === undefined && shown.length === 1 ? `${shown[0]} ` : null;
  const cardReasons = reasons.map((r) => (only && r.startsWith(only) ? `it ${r.slice(only.length)}` : r));
  return {
    title: promptTitle(request),
    summary: request.command ?? shown.join('\n'),
    toolName: request.toolName,
    kind: request.kind,
    ...(request.command === undefined ? {} : { command: request.command }),
    targets: request.targets.map((t, i) => ({ path: shown[i], access: t.access, zone: t.zone })),
    signals: request.signals,
    reasons: cardReasons,
    grantOptions: grantOptions.map(({ scope, label, pattern }) => ({ scope, label, pattern }))
  };
}
