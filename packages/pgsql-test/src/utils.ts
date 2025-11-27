const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const idReplacement = (v: unknown): string | unknown => (!v ? v : '[ID]');

// Generic object type for any key-value mapping
type AnyObject = Record<string, any>;

function mapValues<T extends AnyObject, R = any>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key as keyof T] = fn(value, key as keyof T);
    return acc;
  }, {} as Record<keyof T, R>);
}

export const pruneDates = (row: AnyObject): AnyObject =>
  mapValues(row, (v, k) => {
    if (!v) {
      return v;
    }
    if (v instanceof Date) {
      return '[DATE]';
    } else if (
      typeof v === 'string' &&
      /(_at|At)$/.test(k as string) &&
      /^20[0-9]{2}-[0-9]{2}-[0-9]{2}/.test(v)
    ) {
      return '[DATE]';
    }
    return v;
  });

export const pruneIds = (row: AnyObject): AnyObject =>
  mapValues(row, (v, k) =>
    (k === 'id' || (typeof k === 'string' && k.endsWith('_id'))) &&
    (typeof v === 'string' || typeof v === 'number')
      ? idReplacement(v)
      : v
  );

export const pruneIdArrays = (row: AnyObject): AnyObject =>
  mapValues(row, (v, k) =>
    typeof k === 'string' && k.endsWith('_ids') && Array.isArray(v)
      ? `[UUIDs-${v.length}]`
      : v
  );

export const pruneUUIDs = (row: AnyObject): AnyObject =>
  mapValues(row, (v, k) => {
    if (typeof v !== 'string') {
      return v;
    }
    if (['uuid', 'queue_name'].includes(k as string) && uuidRegexp.test(v)) {
      return '[UUID]';
    }
    if (k === 'gravatar' && /^[0-9a-f]{32}$/i.test(v)) {
      return '[gUUID]';
    }
    return v;
  });

export const pruneHashes = (row: AnyObject): AnyObject =>
  mapValues(row, (v, k) =>
    typeof k === 'string' &&
    k.endsWith('_hash') &&
    typeof v === 'string' &&
    v.startsWith('$')
      ? '[hash]'
      : v
  );

export const prune = (obj: AnyObject): AnyObject =>
  pruneHashes(pruneUUIDs(pruneIds(pruneIdArrays(pruneDates(obj)))));

export const snapshot = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(snapshot);
  } else if (obj && typeof obj === 'object') {
    return mapValues(prune(obj as AnyObject), snapshot);
  }
  return obj;
};
