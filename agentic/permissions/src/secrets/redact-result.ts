/** Redaction of a whole tool result: its content blocks and its details. */

import type { SecretVault } from './vault';

interface TextBlock {
  type: 'text';
  text: string;
}

function isTextBlock(block: unknown): block is TextBlock {
  const b = block as { type?: unknown; text?: unknown };
  return Boolean(b) && typeof b === 'object' && b.type === 'text' && typeof b.text === 'string';
}

/**
 * Join a run of adjacent text blocks into one when a secret value runs across
 * the boundary between two of them, so it is redacted whole.
 */
function joinSplitSecrets(content: readonly unknown[], vault: SecretVault): unknown[] {
  const out: unknown[] = [];
  let run: TextBlock[] = [];
  const flush = () => {
    const texts = run.map((b) => b.text);
    if (run.length > 1 && vault.crossesBoundary(texts)) out.push({ ...run[0], text: texts.join('') });
    else out.push(...run);
    run = [];
  };
  for (const block of content) {
    if (isTextBlock(block)) {
      run.push(block);
    } else {
      flush();
      out.push(block);
    }
  }
  flush();
  return out;
}

/** Redact every string inside a value, copying containers. Cycles keep their shape. */
function redactDeep(value: unknown, text: (s: string) => string, seen = new WeakMap<object, unknown>()): unknown {
  if (typeof value === 'string') return text(value);
  if (!value || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    seen.set(value, out);
    for (const item of value) out.push(redactDeep(item, text, seen));
    return out;
  }
  if (value instanceof Uint8Array || value instanceof Date) return value;
  const out: Record<string, unknown> = {};
  seen.set(value, out);
  for (const [k, v] of Object.entries(value)) out[k] = redactDeep(v, text, seen);
  return out;
}

/** Replace every known secret value in the text blocks and in every string of `details`. */
export function redactToolResult(
  vault: SecretVault,
  content: readonly unknown[],
  details: unknown
): { content: unknown[]; details: unknown; changed: boolean } {
  let changed = false;
  const text = (s: string): string => {
    const out = vault.redact(s);
    if (out.changed) changed = true;
    return out.text;
  };
  const redacted = joinSplitSecrets(content, vault).map((block) => (isTextBlock(block) ? { ...block, text: text(block.text) } : block));
  return { content: redacted, details: details === undefined ? undefined : redactDeep(details, text), changed };
}
