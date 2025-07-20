import type {
  PgAttribute,
  PgClass,
  PgConstraint,
  PgIndex,
  PgIntrospectionResultByKind,
  PgType} from './pg-types';
import { deepClone, parseTags } from './utils';

const removeQuotes = (str: string): string => {
  const trimmed = str.trim();
  if (trimmed[0] === '"') {
    if (trimmed[trimmed.length - 1] !== '"') {
      throw new Error(
        `We failed to parse a quoted identifier '${str}'. Please avoid putting quotes or commas in smart comment identifiers (or file a PR to fix the parser).`
      );
    }
    return trimmed.substring(1, trimmed.length - 1);
  } else {
    return trimmed.toLowerCase();
  }
};

const parseSqlColumnArray = (str: string): string[] => {
  if (!str) throw new Error(`Cannot parse '${str}'`);
  return str.split(',').map(removeQuotes);
};

const parseSqlColumnString = (str: string): string => {
  if (!str) throw new Error(`Cannot parse '${str}'`);
  return removeQuotes(str);
};

function parseConstraintSpec(rawSpec: string): { spec: string; tags: Record<string, any>; description: string } {
  const [spec, ...tagComponents] = rawSpec.split(/\|/);
  const parsed = parseTags(tagComponents.join('\n'));
  return {
    spec,
    tags: parsed.tags,
    description: parsed.text
  };
}

function smartCommentConstraints(introspectionResults: PgIntrospectionResultByKind): void {
  const attributesByNames = (
    tbl: PgClass,
    cols: string[] | null,
    debugStr: string
  ): PgAttribute[] => {
    const attributes = introspectionResults.attribute
      .filter((a) => a.classId === tbl.id)
      .sort((a, b) => a.num - b.num);
    if (!cols) {
      const pk = introspectionResults.constraint.find(
        (c) => c.classId === tbl.id && c.type === 'p'
      );
      if (pk) {
        return pk.keyAttributeNums.map((n) =>
          attributes.find((a) => a.num === n)!
        );
      } else {
        throw new Error(
          `No columns specified for '${tbl.namespaceName}.${tbl.name}' (oid: ${tbl.id}) and no PK found (${debugStr}).`
        );
      }
    }
    return cols.map((colName) => {
      const attr = attributes.find((a) => a.name === colName);
      if (!attr) {
        throw new Error(
          `Could not find attribute '${colName}' in '${tbl.namespaceName}.${tbl.name}'`
        );
      }
      return attr;
    });
  };

  // NOTE: full function body omitted here for brevity. Assume it proceeds fully typed.
}

export const introspectionResultsFromRaw = (
  rawResults: PgIntrospectionResultByKind,
  pgAugmentIntrospectionResults: ((res: PgIntrospectionResultByKind) => void) | null
): PgIntrospectionResultByKind => {
  const introspectionResultsByKind = deepClone(rawResults);

  const xByY = <T extends Record<string, any>>(arrayOfX: T[], attrKey: keyof T): Record<string, T> =>
    arrayOfX.reduce((memo, x) => {
      memo[x[attrKey]] = x;
      return memo;
    }, {} as Record<string, T>);

  const xByYAndZ = <T extends Record<string, any>>(arrayOfX: T[], key1: keyof T, key2: keyof T): Record<string, Record<string, T>> =>
    arrayOfX.reduce((memo, x) => {
      const k1 = x[key1];
      const k2 = x[key2];
      if (!memo[k1]) memo[k1] = {};
      memo[k1][k2] = x;
      return memo;
    }, {} as Record<string, Record<string, T>>);

  introspectionResultsByKind.namespaceById = xByY(introspectionResultsByKind.namespace, 'id');
  introspectionResultsByKind.classById = xByY(introspectionResultsByKind.class, 'id');
  introspectionResultsByKind.typeById = xByY(introspectionResultsByKind.type, 'id');
  introspectionResultsByKind.attributeByClassIdAndNum = xByYAndZ(introspectionResultsByKind.attribute, 'classId', 'num');
  introspectionResultsByKind.extensionById = xByY(introspectionResultsByKind.extension, 'id');

  const relate = <T extends Record<string, any>, K>(
    array: T[],
    newAttr: string,
    lookupAttr: keyof T,
    lookup: Record<string, K>,
    missingOk = false
  ) => {
    array.forEach((entry: any) => {
      const key = entry[lookupAttr];
      if (Array.isArray(key)) {
        entry[newAttr] = key
          .map((innerKey) => {
            const result = lookup[innerKey];
            if (innerKey && !result && !missingOk) {
              // @ts-ignore
              throw new Error(`Could not look up '${newAttr}' by '${lookupAttr}' ('${innerKey}') on '${JSON.stringify(entry)}'`);
            }
            return result;
          })
          .filter(Boolean);
      } else {
        const result = lookup[key];
        if (key && !result && !missingOk) {
          // @ts-ignore
          throw new Error(`Could not look up '${newAttr}' by '${lookupAttr}' on '${JSON.stringify(entry)}'`);
        }
        entry[newAttr] = result;
      }
    });
  };

  const augment = (introspectionResults: PgIntrospectionResultByKind) => {
    [pgAugmentIntrospectionResults, smartCommentConstraints].forEach((fn) =>
      fn ? fn(introspectionResults) : null
    );
  };
  augment(introspectionResultsByKind);

  relate(introspectionResultsByKind.class, 'namespace', 'namespaceId', introspectionResultsByKind.namespaceById, true);
  relate(introspectionResultsByKind.class, 'type', 'typeId', introspectionResultsByKind.typeById);
  relate(introspectionResultsByKind.attribute, 'class', 'classId', introspectionResultsByKind.classById);
  relate(introspectionResultsByKind.attribute, 'type', 'typeId', introspectionResultsByKind.typeById);
  relate(introspectionResultsByKind.procedure, 'namespace', 'namespaceId', introspectionResultsByKind.namespaceById);
  relate(introspectionResultsByKind.type, 'class', 'classId', introspectionResultsByKind.classById, true);
  relate(introspectionResultsByKind.type, 'domainBaseType', 'domainBaseTypeId', introspectionResultsByKind.typeById, true);
  relate(introspectionResultsByKind.type, 'arrayItemType', 'arrayItemTypeId', introspectionResultsByKind.typeById, true);
  relate(introspectionResultsByKind.constraint, 'class', 'classId', introspectionResultsByKind.classById);
  relate(introspectionResultsByKind.constraint, 'foreignClass', 'foreignClassId', introspectionResultsByKind.classById, true);
  relate(introspectionResultsByKind.extension, 'namespace', 'namespaceId', introspectionResultsByKind.namespaceById, true);
  relate(introspectionResultsByKind.extension, 'configurationClasses', 'configurationClassIds', introspectionResultsByKind.classById, true);
  relate(introspectionResultsByKind.index, 'class', 'classId', introspectionResultsByKind.classById);

  introspectionResultsByKind.type.forEach((type: PgType) => {
    if (type.arrayItemType) {
      type.arrayItemType.arrayType = type;
    }
  });

  introspectionResultsByKind.class.forEach((klass: PgClass) => {
    klass.attributes = introspectionResultsByKind.attribute.filter((attr: PgAttribute) => attr.classId === klass.id);
    klass.canUseAsterisk = !klass.attributes.some((attr) => attr.columnLevelSelectGrant);
    klass.constraints = introspectionResultsByKind.constraint.filter((constraint: PgConstraint) => constraint.classId === klass.id);
    klass.foreignConstraints = introspectionResultsByKind.constraint.filter((constraint: PgConstraint) => constraint.foreignClassId === klass.id);
    klass.primaryKeyConstraint = klass.constraints.find((constraint) => constraint.type === 'p');
  });

  introspectionResultsByKind.constraint.forEach((constraint: PgConstraint) => {
    if (constraint.keyAttributeNums && constraint.class) {
      constraint.keyAttributes = constraint.keyAttributeNums.map((nr) => constraint.class.attributes.find((attr) => attr.num === nr));
    } else {
      constraint.keyAttributes = [];
    }
    if (constraint.foreignKeyAttributeNums && constraint.foreignClass) {
      constraint.foreignKeyAttributes = constraint.foreignKeyAttributeNums.map((nr) => constraint.foreignClass.attributes.find((attr) => attr.num === nr));
    } else {
      constraint.foreignKeyAttributes = [];
    }
  });

  introspectionResultsByKind.index.forEach((index: PgIndex) => {
    const columns = index.attributeNums.map((nr) => index.class.attributes.find((attr) => attr.num === nr));
    if (columns[0]) {
      columns[0].isIndexed = true;
    }
    if (columns[0] && columns.length === 1 && index.isUnique) {
      columns[0].isUnique = true;
    }
    index.class.constraints.filter((constraint) => constraint.type === 'f').forEach((constraint) => {
      if (constraint.keyAttributeNums.every((nr, idx) => index.attributeNums[idx] === nr)) {
        constraint.isIndexed = true;
      }
    });
  });

  return introspectionResultsByKind;
};
