import {
  asPgNode,
  decodeTextArrayDatum,
  decodeTextDatum,
  isPgDatum,
  isPgNode,
  parsePgNodeTree,
  type PgNode,
  type PgNodeValue,
} from './pg-node-tree';

/**
 * Allowed values from simple CHECK constraints on one text-like column:
 *
 * - `col IN ('a', 'b')` and `col = ANY (ARRAY['a', 'b'])`, which Postgres
 *   stores as the same `= ANY` expression;
 * - `col = ANY ('{a,b}'::text[])`;
 * - `col = 'a' OR col = 'b'` (either operand order), and a lone `col = 'a'`.
 *
 * The column may be text, varchar (compared through a binary-compatible cast)
 * or char(n). Anything else in the expression (another column, a function
 * call, AND, a non-equality operator, a non-text constant) makes the
 * constraint not simple, and it contributes nothing.
 */

// Built-in equality operators: text = text (varchar columns relabel to text)
// and bpchar = bpchar. Built-in operators keep the same oids on every server.
const TEXT_EQUALITY_OPERATORS = new Set(['98', '1054']);
// text, varchar, bpchar and their array types.
const TEXT_TYPES: ReadonlySet<string> = new Set(['25', '1043', '1042']);
const TEXT_ARRAY_TYPES: ReadonlySet<string> = new Set(['1009', '1015', '1014']);

export interface CheckConstraintLike {
  contype: string;
  conkey: ReadonlyArray<number> | null;
  conbin: string | null;
}

function unwrapRelabel(value: PgNodeValue | undefined): PgNodeValue | undefined {
  let current = value;
  while (isPgNode(current, 'RELABELTYPE')) current = current.fields.arg;
  return current;
}

function isColumn(value: PgNodeValue | undefined, attnum: number): boolean {
  const column = unwrapRelabel(value);
  return (
    isPgNode(column, 'VAR') &&
    column.fields.varattno === String(attnum) &&
    column.fields.varlevelsup === '0'
  );
}

function textConstant(value: PgNodeValue | undefined): string | null {
  const constant = unwrapRelabel(value);
  if (!isPgNode(constant, 'CONST')) return null;
  if (!TEXT_TYPES.has(constant.fields.consttype as string)) return null;
  const datum = constant.fields.constvalue;
  return isPgDatum(datum) ? decodeTextDatum(datum) : null;
}

function textArray(value: PgNodeValue | undefined): string[] | null {
  let array = value;
  // varchar elements reach a text column through an element-wise relabel.
  if (isPgNode(array, 'ARRAYCOERCEEXPR')) {
    if (!isPgNode(array.fields.elemexpr, 'RELABELTYPE')) return null;
    array = array.fields.arg;
  }
  if (isPgNode(array, 'ARRAYEXPR')) {
    const elements = array.fields.elements;
    if (!Array.isArray(elements) || elements.length === 0) return null;
    const values = elements.map(textConstant);
    return values.every((v): v is string => v !== null) ? values : null;
  }
  if (isPgNode(array, 'CONST') && TEXT_ARRAY_TYPES.has(array.fields.consttype as string)) {
    const datum = array.fields.constvalue;
    return isPgDatum(datum) ? decodeTextArrayDatum(datum, TEXT_TYPES) : null;
  }
  return null;
}

function valuesFromExpression(expr: PgNode, attnum: number): string[] | null {
  const args = expr.fields.args;
  switch (expr.node) {
  case 'SCALARARRAYOPEXPR': {
    if (expr.fields.useOr !== 'true') return null;
    if (!TEXT_EQUALITY_OPERATORS.has(expr.fields.opno as string)) return null;
    if (!Array.isArray(args) || args.length !== 2 || !isColumn(args[0], attnum)) return null;
    return textArray(args[1]);
  }
  case 'OPEXPR': {
    if (!TEXT_EQUALITY_OPERATORS.has(expr.fields.opno as string)) return null;
    if (!Array.isArray(args) || args.length !== 2) return null;
    const [left, right] = args;
    const value = isColumn(left, attnum)
      ? textConstant(right)
      : isColumn(right, attnum)
        ? textConstant(left)
        : null;
    return value === null ? null : [value];
  }
  case 'BOOLEXPR': {
    if (expr.fields.boolop !== 'or' || !Array.isArray(args)) return null;
    const values: string[] = [];
    for (const arg of args) {
      const node = asPgNode(arg);
      const branch = node ? valuesFromExpression(node, attnum) : null;
      if (!branch) return null;
      values.push(...branch);
    }
    return values;
  }
  default:
    return null;
  }
}

/** Allowed values for one CHECK expression on column `attnum`, or null. */
export function allowedValuesFromCheck(conbin: string, attnum: number): string[] | null {
  const expr = parsePgNodeTree(conbin);
  const values = expr ? valuesFromExpression(expr, attnum) : null;
  return values ? [...new Set(values)] : null;
}

/**
 * Allowed values for column `attnum` across a table's constraints. Only CHECK
 * constraints on that column alone count. When several are simple, a value
 * must pass all of them, so the lists intersect in the first one's order. One
 * that isn't simple may reject listed values too, so then the column has no
 * fixed set to report.
 */
export function allowedValuesForAttribute(
  constraints: ReadonlyArray<CheckConstraintLike>,
  attnum: number,
): string[] | null {
  let allowed: string[] | null = null;
  for (const constraint of constraints) {
    if (constraint.contype !== 'c') continue;
    if (constraint.conkey?.length !== 1 || constraint.conkey[0] !== attnum) continue;
    const values = constraint.conbin ? allowedValuesFromCheck(constraint.conbin, attnum) : null;
    if (!values) return null;
    allowed = allowed ? allowed.filter((value) => values.includes(value)) : values;
  }
  return allowed;
}
