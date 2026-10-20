// Pure readers for the metaschema's stored shapes: field types, structured
// defaults, check expressions (Postgres AST JSON) and foreign key actions.

import { fieldTypeToTypeName, toFieldDefault } from '@agentic-kit/harness';

import type { ColumnDefault, FkAction } from '../schema-model';

const TYPE_ALIASES: Record<string, string> = {
  int: 'integer',
  int4: 'integer',
  serial: 'integer',
  serial4: 'integer',
  int8: 'bigint',
  bigserial: 'bigint',
  serial8: 'bigint',
  int2: 'smallint',
  smallserial: 'smallint',
  bool: 'boolean',
  decimal: 'numeric',
  float4: 'real',
  float: 'double precision',
  float8: 'double precision',
  'timestamp with time zone': 'timestamptz',
  'timestamp without time zone': 'timestamp',
  'time with time zone': 'timetz',
  'time without time zone': 'time',
  'character varying': 'varchar',
  character: 'char',
  bpchar: 'char',
};

/** A field's type as one name (`integer`, `timestamptz`, `email`, …) plus `[]` per array dimension. */
export function normalizeType(rawType: unknown): string {
  const name = fieldTypeToTypeName(rawType).trim().toLowerCase();
  const dims = /(\[\])*$/.exec(name)?.[0] ?? '';
  const base = name.slice(0, name.length - dims.length).trim();
  return (TYPE_ALIASES[base] ?? base) + dims;
}

const NOW_KEYWORDS = new Set(['CURRENT_TIMESTAMP', 'LOCALTIMESTAMP']);
const NOW_FUNCTIONS = new Set([
  'now',
  'current_timestamp',
  'statement_timestamp',
  'transaction_timestamp',
  'clock_timestamp',
]);

type StructuredDefault = Partial<{
  value: unknown;
  function: string;
  args: unknown[];
  cast: unknown;
  sql_keyword: string;
  operator: string;
  left: unknown;
  right: unknown;
}>;

/**
 * A field's stored default as one of the shapes a planner can compare: a
 * literal, the current time or date, a generated id, or an expression it
 * should leave alone. `DEFAULT NULL` is no default.
 */
export function columnDefault(raw: unknown): ColumnDefault | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number' || typeof raw === 'boolean') return { kind: 'value', value: raw };
  if (typeof raw === 'string') {
    const parsed = toFieldDefault(raw);
    return parsed ? fromStructured(parsed as StructuredDefault) : null;
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) return fromStructured(raw as StructuredDefault);
  return { kind: 'expression', text: JSON.stringify(raw) };
}

function fromStructured(def: StructuredDefault): ColumnDefault | null {
  if (typeof def.sql_keyword === 'string') {
    const keyword = def.sql_keyword.toUpperCase();
    if (NOW_KEYWORDS.has(keyword)) return { kind: 'now' };
    if (keyword === 'CURRENT_DATE') return { kind: 'today' };
    return { kind: 'expression', text: keyword };
  }
  if (typeof def.function === 'string') {
    const fn = def.function.toLowerCase();
    const bare = !(Array.isArray(def.args) && def.args.length > 0) && def.cast == null;
    if (bare && NOW_FUNCTIONS.has(fn)) return { kind: 'now' };
    if (bare && fn === 'current_date') return { kind: 'today' };
    if (bare && fn.includes('uuid')) return { kind: 'generated', fn: def.function };
    return { kind: 'expression', text: renderDefault(def) };
  }
  if ('value' in def && def.operator === undefined) {
    const value = def.value;
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return { kind: 'value', value };
    }
    return { kind: 'expression', text: JSON.stringify(value) };
  }
  return { kind: 'expression', text: renderDefault(def) };
}

const sqlLiteral = (value: unknown): string =>
  typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : JSON.stringify(value);

// SQL-ish text for a default no other shape fits; it is shown, never run.
function renderDefault(def: unknown): string {
  if (def === null || def === undefined) return 'NULL';
  if (typeof def !== 'object') return sqlLiteral(def);
  const d = def as StructuredDefault;
  let text: string;
  if (typeof d.sql_keyword === 'string') text = d.sql_keyword;
  else if (typeof d.function === 'string') {
    text = `${d.function}(${Array.isArray(d.args) ? d.args.map(renderDefault).join(', ') : ''})`;
  } else if (typeof d.operator === 'string') text = `${renderDefault(d.left)} ${d.operator} ${renderDefault(d.right)}`;
  else if ('value' in d) text = d.value === null ? 'NULL' : sqlLiteral(d.value);
  else return JSON.stringify(def);
  const cast = fieldTypeToTypeName(d.cast);
  return cast ? `${text}::${cast}` : text;
}

// ---- check expressions -------------------------------------------------

type Node = Record<string, unknown>;

const isObject = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A node's list: a plain array, or a `{ List: { items } }` wrapper. */
function listItems(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value;
  if (isObject(value)) {
    const list = isObject(value.List) ? value.List : value;
    if (Array.isArray(list.items)) return list.items;
  }
  return undefined;
}

// `{ expression: <ast> }` is how the metaschema stores a raw AST on
// field.chk and check_constraint.expr.
function unwrapExpression(value: unknown): unknown {
  return isObject(value) && 'expression' in value ? value.expression : value;
}

function unwrapCast(value: unknown): unknown {
  let node = value;
  while (isObject(node) && isObject(node.TypeCast)) node = node.TypeCast.arg;
  return node;
}

const stringOf = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (isObject(value)) {
    if (typeof value.sval === 'string') return value.sval;
    if (typeof value.str === 'string') return value.str;
    if (isObject(value.String)) return stringOf(value.String);
  }
  return undefined;
};

/** The operator of an `A_Expr`: the last name in its `name` list. */
function operatorOf(name: unknown): string | undefined {
  const items = listItems(name);
  return items && items.length > 0 ? stringOf(items[items.length - 1]) : undefined;
}

/** An `A_Const` as text: `sval` plain or wrapped, `ival`, `fval`, `boolval`. */
function constValue(value: unknown): string | undefined {
  const node = unwrapCast(value);
  if (!isObject(node) || !isObject(node.A_Const)) return undefined;
  const c = node.A_Const;
  if (c.isnull === true) return undefined;
  if ('sval' in c) return stringOf(c.sval);
  if ('ival' in c) {
    // The parser's JSON leaves out zero: `{ ival: {} }` is 0.
    const ival = isObject(c.ival) ? (c.ival.ival ?? 0) : c.ival;
    return typeof ival === 'number' ? String(ival) : undefined;
  }
  if ('fval' in c) {
    const fval = isObject(c.fval) ? c.fval.fval : c.fval;
    return typeof fval === 'string' || typeof fval === 'number' ? String(fval) : undefined;
  }
  if ('boolval' in c) {
    const boolval = isObject(c.boolval) ? (c.boolval.boolval ?? false) : c.boolval;
    return typeof boolval === 'boolean' ? String(boolval) : undefined;
  }
  if (isObject(c.val)) {
    const val = c.val;
    if (isObject(val.String)) return stringOf(val.String);
    if (isObject(val.Integer)) return String(val.Integer.ival ?? 0);
  }
  return undefined;
}

/** The values of `col IN (…)` or `col = ANY (ARRAY[…])`; undefined for anything else. */
function inListValues(value: unknown): string[] | undefined {
  if (!isObject(value) || !isObject(value.A_Expr)) return undefined;
  const expr = value.A_Expr;
  if (operatorOf(expr.name) !== '=') return undefined;
  let items: unknown[] | undefined;
  if (expr.kind === 'AEXPR_IN') {
    items = listItems(expr.rexpr);
  } else if (expr.kind === 'AEXPR_OP_ANY') {
    const array = unwrapCast(expr.rexpr);
    items = isObject(array) && isObject(array.A_ArrayExpr) ? listItems(array.A_ArrayExpr.elements) : undefined;
  }
  if (!items || items.length === 0) return undefined;
  const values = items.map(constValue);
  return values.every((v): v is string => v !== undefined) ? values : undefined;
}

export type CheckRead = { values?: string[]; other: boolean };

/**
 * What one check expression allows. An IN-list gives `values`; anything else
 * it can't read (ranges, patterns, other columns) sets `other`. In an AND,
 * one IN-list still gives its values, beside `other` for the rest.
 */
export function readCheck(raw: unknown): CheckRead {
  const node = unwrapExpression(raw);
  if (node === null || node === undefined) return { other: false };
  if (isObject(node) && isObject(node.BoolExpr) && /AND/i.test(String(node.BoolExpr.boolop ?? ''))) {
    const parts = (listItems(node.BoolExpr.args) ?? []).map(readCheck);
    const lists = parts.filter((part) => part.values);
    return {
      values: lists.length === 1 ? lists[0].values : undefined,
      other: lists.length > 1 || parts.some((part) => part.other),
    };
  }
  const values = inListValues(node);
  return values ? { values, other: false } : { other: true };
}

// ---- foreign keys -----------------------------------------------------

const FK_ACTIONS: Record<string, FkAction> = {
  c: 'cascade',
  n: 'set_null',
  r: 'restrict',
  a: 'no_action',
  d: 'set_default',
  cascade: 'cascade',
  set_null: 'set_null',
  restrict: 'restrict',
  no_action: 'no_action',
  set_default: 'set_default',
};

/** A stored action code (`c n r a d`) as a name; Postgres' default is no action. */
export function fkAction(code: unknown): FkAction {
  const key = String(code ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  return FK_ACTIONS[key] ?? 'no_action';
}
