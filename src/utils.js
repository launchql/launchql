import * as ast from 'pg-ast';

const lstr = (bbox) => {
  const [lng1, lat1, lng2, lat2] = bbox.split(',').map((a) => a.trim());
  return `LINESTRING(${lng1} ${lat1}, ${lng1} ${lat2}, ${lng2} ${lat2}, ${lng2} ${lat1}, ${lng1} ${lat1})`;
};

const funcCall = (name, args) => {
  return ast.FuncCall({
    funcname: [ast.String({ str: name })],
    args
  });
};

const aflt = (num) => ast.A_Const({ val: ast.Float({ str: num }) });
const aint = (num) => ast.A_Const({ val: ast.Integer({ ival: num }) });

export const makePoint = ({ longitude, latitude }) => {
  return funcCall('st_setsrid', [
    funcCall('st_makepoint', [aflt(longitude), aflt(latitude)]),
    aint(4326)
  ]);
};

export const makePoly = ({ bbox }) => {
  return funcCall('st_setsrid', [
    funcCall('st_makepolygon', [
      funcCall('st_geomfromtext', [
        ast.A_Const({ val: ast.String({ str: lstr(bbox) }) })
      ])
    ]),
    aint(4326)
  ]);
};

const ValuesLists = ({ types, record }) =>
  Object.entries(types).map(([field, type]) => {
    if (typeof type === 'function') {
      return type(record);
    }
    if (!record[field]) {
      throw new Error('field/record mismatch');
    }
    switch (type) {
      case 'text':
        return ast.A_Const({ val: ast.String({ str: record[field] }) });
      case 'int':
        return ast.A_Const({ val: ast.Integer({ ival: record[field] }) });
      case 'float':
        return ast.A_Const({ val: ast.Float({ str: record[field] }) });
      default:
        return ast.A_Const({ val: ast.String({ str: record[field] }) });
    }
  });

export const InsertStmt = ({ schemaName, tableName, types, record }) => ({
  RawStmt: {
    stmt: {
      InsertStmt: {
        relation: {
          RangeVar: {
            schemaname: schemaName,
            relname: tableName,
            inh: true,
            relpersistence: 'p'
          }
        },
        cols: Object.keys(types).map((field) => ast.ResTarget({ name: field })),
        selectStmt: {
          SelectStmt: {
            valuesLists: [ValuesLists({ types, record })],
            op: 0
          }
        },
        override: 0
      }
    },
    stmt_len: 1
  }
});

export const InsertStmtValues = ({
  schemaName,
  tableName,
  types,
  records
}) => ({
  RawStmt: {
    stmt: {
      InsertStmt: {
        relation: {
          RangeVar: {
            schemaname: schemaName,
            relname: tableName,
            inh: true,
            relpersistence: 'p'
          }
        },
        cols: Object.keys(types).map((field) => ast.ResTarget({ name: field })),
        selectStmt: {
          SelectStmt: {
            valuesLists: records.map((record) =>
              ValuesLists({ types, record })
            ),
            op: 0
          }
        },
        override: 0
      }
    },
    stmt_len: 1
  }
});
