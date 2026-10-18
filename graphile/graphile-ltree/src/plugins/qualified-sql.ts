import type { SQL } from 'pg-sql2';
import sql from 'pg-sql2';

import type { LtreeExtensionInfo } from './detect-ltree';

export function ltreePathExpression(value: SQL, info: LtreeExtensionInfo): SQL {
  if (info.helperSchemaName) {
    const toPath = sql.identifier(info.helperSchemaName, 'to_path');
    return sql.fragment`${toPath}(${value})`;
  }
  const ltreeType = sql.identifier(info.schemaName, 'ltree');
  return sql.fragment`replace(ltrim(${value}, '/'), '/', '.')::${ltreeType}`;
}

export function ltreeQueryExpression(
  value: SQL,
  info: LtreeExtensionInfo
): SQL {
  if (info.helperSchemaName) {
    const toQuery = sql.identifier(info.helperSchemaName, 'to_query');
    return sql.fragment`${toQuery}(${value})`;
  }
  const lqueryType = sql.identifier(info.schemaName, 'lquery');
  return sql.fragment`replace(replace(replace(replace(ltrim(${value}, '/'), '**', '__DSTAR__'), '*', '*{1}'), '__DSTAR__', '*'), '/', '.')::${lqueryType}`;
}

export function ltreeOperatorExpression(
  operator: '<@' | '@>' | '~',
  left: SQL,
  right: SQL,
  info: LtreeExtensionInfo
): SQL {
  const schema = sql.identifier(info.schemaName);
  if (operator === '<@') {
    return sql.fragment`${left} OPERATOR(${schema}.<@) ${right}`;
  }
  if (operator === '@>') {
    return sql.fragment`${left} OPERATOR(${schema}.@>) ${right}`;
  }
  return sql.fragment`${left} OPERATOR(${schema}.~) ${right}`;
}
