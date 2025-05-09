function range(start, end) {
  var foo = [];
  for (var i = start; i <= end; i++) {
    foo.push(i);
  }
  return foo;
}

const escapeFields = (field) => {
  switch (field) {
    case 'current_user':
      return `"current_user"`;
    case 'current_role':
      return `"current_role"`;
    default:
      return field;
  }
};

const listFields = (fields) => {
  return fields.map((field) => escapeFields(field)).join(',');
};

const getParameter = (N, i, castsArray) => {
  if (castsArray[i]) {
    return '$' + N + '::' + castsArray[i];
  }
  return '$' + N;
};

const P = (values, castVals) => {
  const array = range(1, values.length);
  // makes ($1, $2, $3, $4)
  const that = array.map((a, i) => getParameter(a, i, castVals)).join(', ');
  return `(${that})`;
};

export const getSelectStmt = (name, vars, where = {}, casts = {}) => {
  // const castVals = keys.map(k => casts[k]);
  // const values = Object.values(vars);
  // return `SELECT ${vars.join(',')} FROM ${name}`;

  const whereKeys = Object.keys(where);
  const castVals = whereKeys.map((k) => casts[k]);

  if (!whereKeys.length) {
    return `SELECT ${listFields(vars)} FROM ${name}`;
  }

  let c = 0;
  return `SELECT ${listFields(vars)} FROM ${name}
    WHERE
    ${whereKeys
      .map((key, i) => {
        c++;
        return `${key}=${getParameter(c, c - 1, castVals)}`;
      })
      .join(' AND ')}
  `;
};

export const getSelect = (name, vars = {}, where = {}, casts) => {
  const wheres = Object.values(where);
  return [getSelectStmt(name, vars, where, casts), wheres];
};

export const getSelectOne = (name, vars = {}, where = {}, casts) => {
  const wheres = Object.values(where);
  return [getSelectStmt(name, vars, where, casts) + ' LIMIT 1', wheres];
};

export const getInsertStmt = (name, vars, casts = {}) => {
  const keys = Object.keys(vars);
  const castVals = keys.map((k) => casts[k]);
  const values = Object.values(vars);
  // console.log( `INSERT INTO ${name} (${keys.join(',')}) VALUES ${P(values, castVals)} RETURNING *`);
  return `INSERT INTO ${name} (${listFields(keys)}) VALUES ${P(
    values,
    castVals
  )} RETURNING *`;
};

export const getInsertDefaultStmt = (name) => {
  return `INSERT INTO ${name} DEFAULT VALUES RETURNING *`;
};

export const getInsert = (name, vars, casts) => {
  const values = Object.values(vars || {});
  if (values.length > 0) {
    return [getInsertStmt(name, vars, casts), values];
  } else {
    return [getInsertDefaultStmt(name)];
  }
};

export const getDeleteStmt = (name, where, casts = {}) => {
  const whereKeys = Object.keys(where);
  const keys = [...whereKeys];
  const castVals = keys.map((k) => casts[k]);
  let c = 0;
  return `DELETE FROM ${name}
  WHERE
  ${whereKeys
    .map((key, i) => {
      c++;
      return `${key}=${getParameter(c, c - 1, castVals)}`;
    })
    .join(',')}
`;
};

export const getDeleteAllStmt = (name) => {
  return `DELETE FROM ${name} WHERE TRUE`;
};

export const getDelete = (name, where, casts) => {
  const values = Object.values(where || {});
  if (values.length > 0) {
    return [getDeleteStmt(name, where, casts), values];
  } else {
    return [getDeleteAllStmt(name)];
  }
};

export const getUpdateStmt = (name, vars, where, casts = {}) => {
  const varkeys = Object.keys(vars);
  const whereKeys = Object.keys(where);
  const keys = [...varkeys, ...whereKeys];
  const castVals = keys.map((k) => casts[k]);
  const l = range(1, varkeys).map((a) => false);
  const whereCasts = [...l, ...whereKeys.map((k) => casts[k])];

  let c = 0;
  return `UPDATE ${name} 
    SET ${varkeys
      .map((key, i) => {
        c++;
        return `${key}=${getParameter(c, c - 1, castVals)}`;
      })
      .join(',')}
    WHERE
    ${whereKeys
      .map((key, i) => {
        c++;
        return `${key}=${getParameter(c, c - 1, castVals)}`;
      })
      .join(' AND ')}
  `;
};

export const getUpdate = (name, vars, where, casts) => {
  const values = [...Object.values(vars), ...Object.values(where)];
  return [getUpdateStmt(name, vars, where, casts), values];
};

export const getFuncStmt = (name, vars = {}, casts = {}) => {
  const keys = Object.keys(vars);
  const castVals = keys.map((k) => casts[k]);
  const values = Object.values(vars);
  return `SELECT * FROM ${name} ${P(values, castVals)};`;
};

export const getFunc = (name, vars = {}, casts = {}) => {
  const values = Object.values(vars);
  return [getFuncStmt(name, vars, casts), values];
};

export const wrapConn = (conn, schema, nick) => {
  const n = (name) => {
    return schema ? `"${schema}".${name}` : name;
  };

  const applyFn = (obj, conn) => {
    obj.callOne = async (name, vars, casts) => {
      name = n(name);
      const nm = name.split('.')[1];
      const obj = await conn.one(...getFunc(name, vars, casts));
      return obj[nm];
    };
    obj.callAny = async (name, vars, casts) => {
      name = n(name);
      return await conn.any(...getFunc(name, vars, casts));
    };
    obj.update = async (name, vars, where, casts) => {
      name = n(name);
      return await conn.any(...getUpdate(name, vars, where, casts));
    };
    obj.delete = async (name, where, casts) => {
      name = n(name);
      return await conn.any(...getDelete(name, where, casts));
    };
    obj.select = async (name, vars, where, casts) => {
      name = n(name);
      return await conn.any(...getSelect(name, vars, where, casts));
    };
    obj.selectOne = async (name, vars, where, casts) => {
      name = n(name);
      return await conn.one(...getSelectOne(name, vars, where, casts));
    };
    obj.selectExpr = async (name, vars, where, casts) => {
      name = n(name);
      return getSelect(name, vars, where, casts);
    };
    obj.call = obj.callAny;
    obj.insertOne = async (name, vars, casts) => {
      name = n(name);
      return await conn.one(...getInsert(name, vars, casts));
    };
    obj.insert = async (name, vars, casts) => {
      name = n(name);
      return await conn.any(...getInsert(name, vars, casts));
    };

    return obj;
  };

  if (schema) {
    nick = nick || schema;
    conn.schemas = conn.schemas || {};
    conn.schemas[nick] = {};
    return applyFn(conn.schemas[nick], conn);
  } else {
    return applyFn(conn, conn);
  }
};
