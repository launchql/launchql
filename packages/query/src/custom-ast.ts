// @ts-nocheck

import * as t from 'gql-ast';

export function getCustomAst(fieldDefn) {
  const { pgType } = fieldDefn.type;
  if (pgType === 'geometry') {
    return geometryAst(fieldDefn.name);
  }

  if (pgType === 'interval') {
    return intervalAst(fieldDefn.name);
  }

  return t.field({
    name: fieldDefn.name
  });
}

export function geometryAst(name) {
  return t.field({
    name,
    selectionSet: t.selectionSet({
      selections: toFieldArray(['geojson'])
    })
  });
}

export function intervalAst(name) {
  return t.field({
    name,
    selectionSet: t.selectionSet({
      selections: toFieldArray([
        'days',
        'hours',
        'minutes',
        'months',
        'seconds',
        'years'
      ])
    })
  });
}

function toFieldArray(strArr) {
  return strArr.map((fieldName) => t.field({ name: fieldName }));
}

export function isIntervalType(obj) {
  return [
    'days',
    'hours',
    'minutes',
    'months',
    'seconds',
    'years'
  ].every((key) => obj.hasOwnProperty(key));
}
