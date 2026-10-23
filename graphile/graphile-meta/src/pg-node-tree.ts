/**
 * Reader for PostgreSQL's `pg_node_tree` text: the form `pg_constraint.conbin`
 * stores a CHECK expression in. Introspection already selects `conbin`, so
 * reading it here needs no query of its own.
 *
 * The format is `{NODE :field value :field value …}`, where a value is a nested
 * node, a parenthesized list, `<>` for null, a bare token, or a datum written
 * as `<length> [ <byte> <byte> … ]`.
 */

export interface PgNode {
  node: string;
  fields: Record<string, PgNodeValue>;
}

export interface PgDatum {
  length: number;
  bytes: number[];
}

export type PgNodeValue = string | null | PgNode | PgDatum | PgNodeValue[];

const DELIMITERS = new Set(['(', ')', '{', '}']);

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (DELIMITERS.has(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    let token = '';
    while (i < text.length && !/\s/.test(text[i]) && !DELIMITERS.has(text[i])) {
      // A backslash escapes the next character, so a token can carry a
      // delimiter or a space.
      if (text[i] === '\\' && i + 1 < text.length) {
        token += text[i + 1];
        i += 2;
        continue;
      }
      token += text[i];
      i++;
    }
    tokens.push(token);
  }
  return tokens;
}

class TokenReader {
  private pos = 0;
  constructor(private readonly tokens: string[]) {}

  peek(): string | undefined {
    return this.tokens[this.pos];
  }

  next(): string {
    const token = this.tokens[this.pos++];
    if (token === undefined) throw new Error('malformed node tree');
    return token;
  }

  done(): boolean {
    return this.pos >= this.tokens.length;
  }
}

function readValue(reader: TokenReader): PgNodeValue {
  const token = reader.next();
  if (token === '{') return readNode(reader);
  if (token === '(') return readList(reader);
  if (token === '<>') return null;
  if (reader.peek() === '[') {
    reader.next();
    const bytes: number[] = [];
    while (reader.peek() !== ']') bytes.push(Number(reader.next()));
    reader.next();
    return { length: Number(token), bytes };
  }
  return token;
}

function readList(reader: TokenReader): PgNodeValue[] {
  const items: PgNodeValue[] = [];
  while (reader.peek() !== ')') items.push(readValue(reader));
  reader.next();
  return items;
}

function readNode(reader: TokenReader): PgNode {
  const node = reader.next();
  const fields: Record<string, PgNodeValue> = {};
  while (reader.peek() !== '}') {
    const key = reader.next();
    if (!key.startsWith(':')) throw new Error('malformed node tree');
    fields[key.slice(1)] = readValue(reader);
  }
  reader.next();
  return { node, fields };
}

/** Parse a node tree; null when the text isn't a single well-formed node. */
export function parsePgNodeTree(text: string): PgNode | null {
  try {
    const reader = new TokenReader(tokenize(text));
    if (reader.next() !== '{') return null;
    const root = readNode(reader);
    return reader.done() ? root : null;
  } catch {
    return null;
  }
}

export function asPgNode(value: PgNodeValue | undefined): PgNode | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'node' in value
    ? value
    : null;
}

export function isPgNode(value: PgNodeValue | undefined, node: string): value is PgNode {
  return asPgNode(value)?.node === node;
}

export function isPgDatum(value: PgNodeValue | undefined): value is PgDatum {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && 'bytes' in value;
}

const utf8 = new TextDecoder('utf-8', { fatal: true });

// Varlena datums as a little-endian server writes them (every supported
// platform today). A 1-byte header has its low bit set and holds the total
// size in the upper 7 bits; a 4-byte header has its two low bits clear and
// holds the total size in the upper 30. Compressed and TOAST-pointer forms
// can't appear in a short constant, so they are rejected rather than guessed.
function readVarlena(bytes: number[], offset: number): { text: string; size: number } | null {
  const first = bytes[offset];
  if (first === undefined) return null;
  let headerSize: number;
  let size: number;
  if ((first & 0x01) === 1) {
    if (first === 0x01) return null;
    headerSize = 1;
    size = first >>> 1;
  } else {
    if ((first & 0x03) !== 0) return null;
    headerSize = 4;
    size =
      (first | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 2;
  }
  if (size < headerSize || offset + size > bytes.length) return null;
  try {
    return {
      text: utf8.decode(Uint8Array.from(bytes.slice(offset + headerSize, offset + size))),
      size,
    };
  } catch {
    return null;
  }
}

/** Decode a text-like datum (text, varchar, bpchar). */
export function decodeTextDatum(datum: PgDatum): string | null {
  const value = readVarlena(datum.bytes, 0);
  return value && value.size === datum.bytes.length ? value.text : null;
}

function readInt32(bytes: number[], offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
}

/**
 * Decode a one-dimensional array datum without nulls whose element type is in
 * `elementTypes`. Layout: varlena header, ndim, data offset (0 when there's no
 * null bitmap), element type oid, then per dimension its length and lower
 * bound, then the elements, each 4-byte-header element aligned to 4 bytes.
 */
export function decodeTextArrayDatum(
  datum: PgDatum,
  elementTypes: ReadonlySet<string>,
): string[] | null {
  const { bytes } = datum;
  if (bytes.length < 24 || (bytes[0] & 0x03) !== 0) return null;
  if (readInt32(bytes, 0) >>> 2 !== bytes.length) return null;
  const ndim = readInt32(bytes, 4);
  const dataOffset = readInt32(bytes, 8);
  const elementType = String(readInt32(bytes, 12) >>> 0);
  if (ndim !== 1 || dataOffset !== 0 || !elementTypes.has(elementType)) return null;

  const count = readInt32(bytes, 16);
  const values: string[] = [];
  let offset = 24;
  for (let i = 0; i < count; i++) {
    // A zero byte here is alignment padding. A 4-byte header is always written
    // at a 4-byte boundary, so a zero at an unaligned offset can't be one.
    if (bytes[offset] === 0) offset = (offset + 3) & ~3;
    const value = readVarlena(bytes, offset);
    if (!value) return null;
    values.push(value.text);
    offset += value.size;
  }
  return offset === bytes.length ? values : null;
}
