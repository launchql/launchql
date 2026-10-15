/**
 * The shape of pi's built-in tool inputs, in one place: `path`, `command` and
 * `glob` strings, a write's `content`, and an edit's `edits[]` of
 * `{ oldText, newText }` (older callers send `oldText`/`newText` at the top).
 */

import type { BuiltinTool } from './types';

export function stringField(input: Record<string, unknown>, key: string): string | undefined {
  const v = input[key];
  return typeof v === 'string' ? v : undefined;
}

function editsOf(input: Record<string, unknown>): Record<string, unknown>[] {
  const edits = Array.isArray(input.edits) ? (input.edits as unknown[]) : [];
  return edits.filter((e): e is Record<string, unknown> => Boolean(e) && typeof e === 'object');
}

/** The new text a write or edit puts in the file. */
export function newTexts(toolName: BuiltinTool, input: Record<string, unknown>): string[] {
  if (toolName === 'write') return [stringField(input, 'content') ?? ''];
  const texts = editsOf(input)
    .map((e) => e.newText)
    .filter((t): t is string => typeof t === 'string');
  const legacy = stringField(input, 'newText');
  return legacy === undefined ? texts : [...texts, legacy];
}

function mapFields(target: Record<string, unknown>, keys: readonly string[], fn: (text: string) => string): void {
  for (const key of keys) {
    const value = target[key];
    if (typeof value === 'string') target[key] = fn(value);
  }
}

/** Rewrite, in place, every text field of a write or edit input. */
export function mapWriteTexts(input: Record<string, unknown>, fn: (text: string) => string): void {
  mapFields(input, ['content', 'oldText', 'newText'], fn);
  for (const edit of editsOf(input)) mapFields(edit, ['oldText', 'newText'], fn);
}

/** Rewrite, in place, a bash input's command. */
export function mapCommand(input: Record<string, unknown>, fn: (text: string) => string): void {
  mapFields(input, ['command'], fn);
}
