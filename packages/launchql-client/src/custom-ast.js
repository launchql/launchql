import * as t from 'gql-ast';

export function getCustomAst(fieldDefn) {
  const { subtype, pgType } = fieldDefn.type;
  if (subtype === 'GeometryPoint' && pgType === 'geometry') {
    return geometryPointAst(fieldDefn.name);
  }

  if (pgType === 'interval') {
    return intervalAst(fieldDefn.name);
  }

  return t.field({
    name: fieldDefn.name
  });
}

export function geometryPointAst(name) {
  return t.field({
    name,
    selectionSet: t.selectionSet({
      selections: toFieldArray(['geojson', 'srid', 'x', 'y'])
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
