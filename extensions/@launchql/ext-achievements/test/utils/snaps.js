// Thanks Graphile again!
// https://github.com/graphile/starter/blob/ce3c683ee19d4c92444431324b76941347fd85db/%40app/db/__tests__/helpers.ts#L46-L76

const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idReplacement = (v) => (!v ? v : '[ID]');

export const pruneDates = (row) =>
  mapValues(row, (v, k) => {
    if (!v) {
      return v;
    }
    if (v instanceof Date) {
      return '[DATE]';
    } else if (
      typeof v === 'string' &&
      k.match(/(_at|At)$/) &&
      v.match(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}/)
    ) {
      return '[DATE]';
    }
    return v;
  });
const mapValues = (objs, fn) =>
  Object.entries(objs).reduce((a, [key, value]) => {
    a[key] = fn(value, key);
    return a;
  }, {});

export const pruneIds = (row) =>
  mapValues(row, (v, k) =>
    (k === 'id' || k.endsWith('_id')) &&
    (typeof v === 'string' || typeof v === 'number')
      ? idReplacement(v)
      : v
  );

export const pruneIdArrays = (row) =>
  mapValues(row, (v, k) =>
    k.endsWith('_ids') && Array.isArray(v) ? `[UUIDs-${v.length}]` : v
  );

export const pruneUUIDs = (row) =>
  mapValues(row, (v, k) => {
    if (typeof v !== 'string') {
      return v;
    }
    const val = v;
    return ['uuid', 'queue_name'].includes(k) && v.match(uuidRegexp)
      ? '[UUID]'
      : k === 'gravatar' && val.match(/^[0-9a-f]{32}$/i)
      ? '[gUUID]'
      : v;
  });
export const pruneTokens = (row) =>
  mapValues(row, (v, k) =>
    (k === 'token' || k.endsWith('_token')) && typeof v === 'string'
      ? '[token]'
      : v
  );

export const pruneHashes = (row) =>
  mapValues(row, (v, k) =>
    k.endsWith('_hash') && typeof v === 'string' && v[0] === '$' ? '[hash]' : v
  );

export const prunePeoplestamps = (row) =>
  mapValues(row, (v, k) =>
    k.endsWith('_by') && typeof v === 'string' ? '[peoplestamp]' : v
  );

export const pruneSchemas = (row) =>
  mapValues(row, (v, k) =>
    typeof v === 'string' && /^zz-/.test(v) ? '[schemahash]' : v
  );

export const prune = (obj) =>
  pruneHashes(
    pruneUUIDs(
      pruneIds(
        pruneIdArrays(
          pruneDates(pruneSchemas(pruneTokens(prunePeoplestamps(obj))))
        )
      )
    )
  );

export const snapshot = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(snapshot);
  } else if (obj && typeof obj === 'object') {
    return mapValues(prune(obj), snapshot);
  }
  return obj;
};

export const snap = (obj) => {
  expect(snapshot(obj)).toMatchSnapshot();
};
