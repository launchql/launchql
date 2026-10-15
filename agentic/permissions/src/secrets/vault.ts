/**
 * The secret vault: the values the model must never see, and the placeholders
 * it sees instead.
 *
 * A value is replaced by `«secret:NAME#h4»`, where `h4` is the first 4 hex
 * chars of HMAC-SHA256(key, value). The key is per install (or per engine), so
 * a placeholder says which secret it stands for without revealing anything
 * about the value. Restoring maps a placeholder back to its value; the engine
 * only does that where it is safe (writes to secret files, approved commands).
 */

import { createHmac } from 'node:crypto';

import { isTrivial, MIN_SECRET_LENGTH, TOKEN_SHAPES } from './rules';

export const PLACEHOLDER_PATTERN = /«secret:([A-Za-z0-9_]+)#([0-9a-f]{4,64})»/g;

/** The name used for a token-shaped value found in text with no name of its own. */
export const UNNAMED_TOKEN = 'TOKEN';

function sanitizeName(name: string): string {
  return name.replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'SECRET';
}

interface Entry {
  name: string;
  value: string;
  placeholder: string;
}

export type SecretOrigin = 'file' | 'host' | 'token';

export class SecretVault {
  private readonly byValue = new Map<string, Entry>();
  private readonly byPlaceholder = new Map<string, Entry>();
  private readonly origin = new Map<string, SecretOrigin>();
  private sorted: Entry[] | null = null;

  constructor(private readonly key: string) {}

  get size(): number {
    return this.byValue.size;
  }

  /** Register a value. The first name a value gets is the one it keeps. */
  add(name: string, value: string, origin: SecretOrigin = 'host'): string {
    const existing = this.byValue.get(value);
    if (existing) {
      if (origin === 'host') this.origin.set(value, 'host');
      return existing.placeholder;
    }
    const safe = sanitizeName(name);
    const digest = createHmac('sha256', this.key).update(value).digest('hex');
    let placeholder = '';
    for (let len = 4; len <= digest.length; len += 4) {
      placeholder = `«secret:${safe}#${digest.slice(0, len)}»`;
      if (!this.byPlaceholder.has(placeholder)) break;
    }
    const entry = { name: safe, value, placeholder };
    this.byValue.set(value, entry);
    this.byPlaceholder.set(placeholder, entry);
    this.origin.set(value, origin);
    this.sorted = null;
    return placeholder;
  }

  /** Drop the values from one origin (before re-reading the files). */
  clear(origin: SecretOrigin): void {
    for (const [value, o] of this.origin) {
      if (o !== origin) continue;
      const entry = this.byValue.get(value);
      this.byValue.delete(value);
      this.byPlaceholder.delete(entry.placeholder);
      this.origin.delete(value);
    }
    this.sorted = null;
  }

  private entries(): Entry[] {
    this.sorted ??= [...this.byValue.values()].sort((a, b) => b.value.length - a.value.length);
    return this.sorted;
  }

  /** Learn token-shaped values in `text` that no source named. */
  private discover(text: string): void {
    for (const shape of TOKEN_SHAPES) {
      const re = new RegExp(shape.source, `${shape.flags ?? ''}g`);
      for (const m of text.matchAll(re)) {
        const value = m[1] ?? m[0];
        if (shape.name === 'UrlPassword' && (isTrivial(value) || /[${}]/.test(value))) continue;
        if (value.length >= MIN_SECRET_LENGTH && !this.byValue.has(value)) this.add(UNNAMED_TOKEN, value, 'token');
      }
    }
  }

  /** Replace every known value, longest first, with its placeholder. */
  redact(text: string): { text: string; changed: boolean } {
    if (!text) return { text, changed: false };
    this.discover(text);
    const claimed = new Uint8Array(text.length);
    const hits: { start: number; end: number; placeholder: string }[] = [];
    for (const entry of this.entries()) {
      const len = entry.value.length;
      for (let at = text.indexOf(entry.value); at >= 0; at = text.indexOf(entry.value, at + 1)) {
        let free = true;
        for (let k = at; k < at + len; k++) {
          if (claimed[k]) {
            free = false;
            break;
          }
        }
        if (!free) continue;
        claimed.fill(1, at, at + len);
        hits.push({ start: at, end: at + len, placeholder: entry.placeholder });
        at += len - 1;
      }
    }
    if (hits.length === 0) return { text, changed: false };
    hits.sort((a, b) => a.start - b.start);
    let out = '';
    let last = 0;
    for (const hit of hits) {
      out += text.slice(last, hit.start) + hit.placeholder;
      last = hit.end;
    }
    return { text: out + text.slice(last), changed: true };
  }

  /**
   * A known value runs across the boundary between two of `parts` (adjacent
   * text blocks), so redacting each part alone would leave both halves.
   */
  crossesBoundary(parts: readonly string[]): boolean {
    const joined = parts.join('');
    this.discover(joined);
    const bounds: number[] = [];
    let offset = 0;
    for (const part of parts.slice(0, -1)) bounds.push((offset += part.length));
    for (const entry of this.entries()) {
      for (let at = joined.indexOf(entry.value); at >= 0; at = joined.indexOf(entry.value, at + 1)) {
        const end = at + entry.value.length;
        if (bounds.some((b) => b > at && b < end)) return true;
      }
    }
    return false;
  }

  /** Put real values back for known placeholders. Unknown placeholders stay. */
  restore(text: string): string {
    return text.replace(PLACEHOLDER_PATTERN, (m) => this.byPlaceholder.get(m)?.value ?? m);
  }

  /** The secret a text carries: a known value or a placeholder. */
  findSecret(text: string): { name: string; kind: 'value' | 'placeholder' } | null {
    const placeholder = findPlaceholders(text)[0];
    if (placeholder) return { name: /«secret:([A-Za-z0-9_]+)#/.exec(placeholder)[1], kind: 'placeholder' };
    for (const entry of this.entries()) {
      if (text.includes(entry.value)) return { name: entry.name, kind: 'value' };
    }
    return null;
  }
}

export function findPlaceholders(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER_PATTERN)].map((m) => m[0]);
}
