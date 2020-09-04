import { deepClone, parseTags } from './utils';

const removeQuotes = (str) => {
  const trimmed = str.trim();
  if (trimmed[0] === '"') {
    if (trimmed[trimmed.length - 1] !== '"') {
      throw new Error(
        `We failed to parse a quoted identifier '${str}'. Please avoid putting quotes or commas in smart comment identifiers (or file a PR to fix the parser).`
      );
    }
    return trimmed.substr(1, trimmed.length - 2);
  } else {
    // PostgreSQL lower-cases unquoted columns, so we should too.
    return trimmed.toLowerCase();
  }
};

const parseSqlColumnArray = (str) => {
  if (!str) {
    throw new Error(`Cannot parse '${str}'`);
  }
  const parts = str.split(',');
  return parts.map(removeQuotes);
};

const parseSqlColumnString = (str) => {
  if (!str) {
    throw new Error(`Cannot parse '${str}'`);
  }
  return removeQuotes(str);
};

function parseConstraintSpec(rawSpec) {
  const [spec, ...tagComponents] = rawSpec.split(/\|/);
  const parsed = parseTags(tagComponents.join('\n'));
  return {
    spec,
    tags: parsed.tags,
    description: parsed.text
  };
}

function smartCommentConstraints(introspectionResults) {
  const attributesByNames = (tbl, cols, debugStr) => {
    const attributes = introspectionResults.attribute
      .filter((a) => a.classId === tbl.id)
      .sort((a, b) => a.num - b.num);
    if (!cols) {
      const pk = introspectionResults.constraint.find(
        (c) => c.classId == tbl.id && c.type === 'p'
      );
      if (pk) {
        return pk.keyAttributeNums.map((n) =>
          attributes.find((a) => a.num === n)
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

  // First: primary keys
  introspectionResults.class.forEach((klass) => {
    const namespace = introspectionResults.namespace.find(
      (n) => n.id === klass.namespaceId
    );
    if (!namespace) {
      return;
    }
    if (klass.tags.primaryKey) {
      if (typeof klass.tags.primaryKey !== 'string') {
        throw new Error(
          `@primaryKey configuration of '${klass.namespaceName}.${klass.name}' is invalid; please specify just once "@primaryKey col1,col2"`
        );
      }
      const { spec: pkSpec, tags, description } = parseConstraintSpec(
        klass.tags.primaryKey
      );
      const columns = parseSqlColumnArray(pkSpec);
      const attributes = attributesByNames(
        klass,
        columns,
        `@primaryKey ${klass.tags.primaryKey}`
      );
      attributes.forEach((attr) => {
        attr.tags.notNull = true;
      });
      const keyAttributeNums = attributes.map((a) => a.num);
      // Now we need to fake a constraint for this:
      const fakeConstraint = {
        kind: 'constraint',
        isFake: true,
        isIndexed: true, // otherwise it gets ignored by ignoreIndexes
        id: Math.random(),
        name: `FAKE_${klass.namespaceName}_${klass.name}_primaryKey`,
        type: 'p', // primary key
        classId: klass.id,
        foreignClassId: null,
        comment: null,
        description,
        keyAttributeNums,
        foreignKeyAttributeNums: null,
        tags
      };
      introspectionResults.constraint.push(fakeConstraint);
    }
  });
  // Now primary keys are in place, we can apply foreign keys
  introspectionResults.class.forEach((klass) => {
    const namespace = introspectionResults.namespace.find(
      (n) => n.id === klass.namespaceId
    );
    if (!namespace) {
      return;
    }
    const getType = () =>
      introspectionResults.type.find((t) => t.id === klass.typeId);
    const foreignKey = klass.tags.foreignKey || getType().tags.foreignKey;
    if (foreignKey) {
      const foreignKeys =
        typeof foreignKey === 'string' ? [foreignKey] : foreignKey;
      if (!Array.isArray(foreignKeys)) {
        throw new Error(
          `Invalid foreign key smart comment specified on '${klass.namespaceName}.${klass.name}'`
        );
      }
      foreignKeys.forEach((fkSpecRaw, index) => {
        if (typeof fkSpecRaw !== 'string') {
          throw new Error(
            `Invalid foreign key spec (${index}) on '${klass.namespaceName}.${klass.name}'`
          );
        }
        const { spec: fkSpec, tags, description } = parseConstraintSpec(
          fkSpecRaw
        );
        const matches = fkSpec.match(
          /^\(([^()]+)\) references ([^().]+)(?:\.([^().]+))?(?:\s*\(([^()]+)\))?$/i
        );
        if (!matches) {
          throw new Error(
            `Invalid foreignKey syntax for '${klass.namespaceName}.${klass.name}'; expected something like "(col1,col2) references schema.table (c1, c2)", you passed '${fkSpecRaw}'`
          );
        }
        const [
          ,
          rawColumns,
          rawSchemaOrTable,
          rawTableOnly,
          rawForeignColumns
        ] = matches;
        const rawSchema = rawTableOnly
          ? rawSchemaOrTable
          : `"${klass.namespaceName}"`;
        const rawTable = rawTableOnly || rawSchemaOrTable;
        const columns = parseSqlColumnArray(rawColumns);
        const foreignSchema = parseSqlColumnString(rawSchema);
        const foreignTable = parseSqlColumnString(rawTable);
        const foreignColumns = rawForeignColumns
          ? parseSqlColumnArray(rawForeignColumns)
          : null;

        const foreignKlass = introspectionResults.class.find(
          (k) => k.name === foreignTable && k.namespaceName === foreignSchema
        );
        if (!foreignKlass) {
          throw new Error(
            `@foreignKey smart comment referenced non-existant table/view '${foreignSchema}'.'${foreignTable}'. Note that this reference must use *database names* (i.e. it does not respect @name). (${fkSpecRaw})`
          );
        }
        const foreignNamespace = introspectionResults.namespace.find(
          (n) => n.id === foreignKlass.namespaceId
        );
        if (!foreignNamespace) {
          return;
        }

        const keyAttributeNums = attributesByNames(
          klass,
          columns,
          `@foreignKey ${fkSpecRaw}`
        ).map((a) => a.num);
        const foreignKeyAttributeNums = attributesByNames(
          foreignKlass,
          foreignColumns,
          `@foreignKey ${fkSpecRaw}`
        ).map((a) => a.num);

        // Now we need to fake a constraint for this:
        const fakeConstraint = {
          kind: 'constraint',
          isFake: true,
          isIndexed: true, // otherwise it gets ignored by ignoreIndexes
          id: Math.random(),
          name: `FAKE_${klass.namespaceName}_${klass.name}_foreignKey_${index}`,
          type: 'f', // foreign key
          classId: klass.id,
          foreignClassId: foreignKlass.id,
          comment: null,
          description,
          keyAttributeNums,
          foreignKeyAttributeNums,
          tags
        };
        introspectionResults.constraint.push(fakeConstraint);
      });
    }
  });
}

export const introspectionResultsFromRaw = (
  rawResults,
  pgAugmentIntrospectionResults
) => {
  const introspectionResultsByKind = deepClone(rawResults);

  console.log('made it here');

  const xByY = (arrayOfX, attrKey) =>
    arrayOfX.reduce((memo, x) => {
      memo[x[attrKey]] = x;
      return memo;
    }, {});
  const xByYAndZ = (arrayOfX, attrKey, attrKey2) =>
    arrayOfX.reduce((memo, x) => {
      if (!memo[x[attrKey]]) memo[x[attrKey]] = {};
      memo[x[attrKey]][x[attrKey2]] = x;
      return memo;
    }, {});
  console.log('1');
  introspectionResultsByKind.namespaceById = xByY(
    introspectionResultsByKind.namespace,
    'id'
  );
  introspectionResultsByKind.classById = xByY(
    introspectionResultsByKind.class,
    'id'
  );
  introspectionResultsByKind.typeById = xByY(
    introspectionResultsByKind.type,
    'id'
  );
  console.log('2');
  introspectionResultsByKind.attributeByClassIdAndNum = xByYAndZ(
    introspectionResultsByKind.attribute,
    'classId',
    'num'
  );
  introspectionResultsByKind.extensionById = xByY(
    introspectionResultsByKind.extension,
    'id'
  );

  const relate = (array, newAttr, lookupAttr, lookup, missingOk = false) => {
    console.log('relate');
    array.forEach((entry) => {
      const key = entry[lookupAttr];
      if (Array.isArray(key)) {
        entry[newAttr] = key
          .map((innerKey) => {
            const result = lookup[innerKey];
            if (innerKey && !result) {
              if (missingOk) {
                return;
              }
              throw new Error(
                `Could not look up '${newAttr}' by '${lookupAttr}' ('${innerKey}') on '${JSON.stringify(
                  entry
                )}'`
              );
            }
            return result;
          })
          .filter((_) => _);
      } else {
        const result = lookup[key];
        if (key && !result) {
          if (missingOk) {
            return;
          }
          throw new Error(
            `Could not look up '${newAttr}' by '${lookupAttr}' on '${JSON.stringify(
              entry
            )}'`
          );
        }
        entry[newAttr] = result;
      }
    });
  };

  const augment = (introspectionResults) => {
    [pgAugmentIntrospectionResults, smartCommentConstraints].forEach((fn) =>
      fn ? fn(introspectionResults) : null
    );
  };
  augment(introspectionResultsByKind);

  relate(
    introspectionResultsByKind.class,
    'namespace',
    'namespaceId',
    introspectionResultsByKind.namespaceById,
    true // Because it could be a type defined in a different namespace - which is fine so long as we don't allow querying it directly
  );

  relate(
    introspectionResultsByKind.class,
    'type',
    'typeId',
    introspectionResultsByKind.typeById
  );

  relate(
    introspectionResultsByKind.attribute,
    'class',
    'classId',
    introspectionResultsByKind.classById
  );

  relate(
    introspectionResultsByKind.attribute,
    'type',
    'typeId',
    introspectionResultsByKind.typeById
  );

  relate(
    introspectionResultsByKind.procedure,
    'namespace',
    'namespaceId',
    introspectionResultsByKind.namespaceById
  );

  relate(
    introspectionResultsByKind.type,
    'class',
    'classId',
    introspectionResultsByKind.classById,
    true
  );

  relate(
    introspectionResultsByKind.type,
    'domainBaseType',
    'domainBaseTypeId',
    introspectionResultsByKind.typeById,
    true // Because not all types are domains
  );

  relate(
    introspectionResultsByKind.type,
    'arrayItemType',
    'arrayItemTypeId',
    introspectionResultsByKind.typeById,
    true // Because not all types are arrays
  );

  relate(
    introspectionResultsByKind.constraint,
    'class',
    'classId',
    introspectionResultsByKind.classById
  );

  relate(
    introspectionResultsByKind.constraint,
    'foreignClass',
    'foreignClassId',
    introspectionResultsByKind.classById,
    true // Because many constraints don't apply to foreign classes
  );

  relate(
    introspectionResultsByKind.extension,
    'namespace',
    'namespaceId',
    introspectionResultsByKind.namespaceById,
    true // Because the extension could be a defined in a different namespace
  );

  relate(
    introspectionResultsByKind.extension,
    'configurationClasses',
    'configurationClassIds',
    introspectionResultsByKind.classById,
    true // Because the configuration table could be a defined in a different namespace
  );

  relate(
    introspectionResultsByKind.index,
    'class',
    'classId',
    introspectionResultsByKind.classById
  );

  console.log('arrayType');

  // Reverse arrayItemType -> arrayType
  introspectionResultsByKind.type.forEach((type) => {
    if (type.arrayItemType) {
      type.arrayItemType.arrayType = type;
    }
  });

  console.log('columns constraints');
  // Table/type columns / constraints
  introspectionResultsByKind.class.forEach((klass) => {
    klass.attributes = introspectionResultsByKind.attribute.filter(
      (attr) => attr.classId === klass.id
    );
    klass.canUseAsterisk = !klass.attributes.some(
      (attr) => attr.columnLevelSelectGrant
    );
    klass.constraints = introspectionResultsByKind.constraint.filter(
      (constraint) => constraint.classId === klass.id
    );
    klass.foreignConstraints = introspectionResultsByKind.constraint.filter(
      (constraint) => constraint.foreignClassId === klass.id
    );
    klass.primaryKeyConstraint = klass.constraints.find(
      (constraint) => constraint.type === 'p'
    );
  });

  // Constraint attributes
  introspectionResultsByKind.constraint.forEach((constraint) => {
    if (constraint.keyAttributeNums && constraint.class) {
      constraint.keyAttributes = constraint.keyAttributeNums.map((nr) =>
        constraint.class.attributes.find((attr) => attr.num === nr)
      );
    } else {
      constraint.keyAttributes = [];
    }
    if (constraint.foreignKeyAttributeNums && constraint.foreignClass) {
      constraint.foreignKeyAttributes = constraint.foreignKeyAttributeNums.map(
        (nr) =>
          constraint.foreignClass.attributes.find((attr) => attr.num === nr)
      );
    } else {
      constraint.foreignKeyAttributes = [];
    }
  });

  console.log('detect indexed');
  // Detect which columns and constraints are indexed
  introspectionResultsByKind.index.forEach((index) => {
    const columns = index.attributeNums.map((nr) =>
      index.class.attributes.find((attr) => attr.num === nr)
    );

    // Indexed column (for orderBy / filter):
    if (columns[0]) {
      columns[0].isIndexed = true;
    }

    if (columns[0] && columns.length === 1 && index.isUnique) {
      columns[0].isUnique = true;
    }

    // Indexed constraints (for reverse relations):
    index.class.constraints
      .filter((constraint) => constraint.type === 'f')
      .forEach((constraint) => {
        if (
          constraint.keyAttributeNums.every(
            (nr, idx) => index.attributeNums[idx] === nr
          )
        ) {
          constraint.isIndexed = true;
        }
      });
  });

  console.log('done!');

  return introspectionResultsByKind;
};
