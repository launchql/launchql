import * as ast from 'pg-ast';
import { join, resolve } from 'path';

export const normalizePath = (path, cwd) =>
  path.startsWith('/') ? path : resolve(join(cwd ? cwd : process.cwd(), path));

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

export const makeLocation = (longitude, latitude) => {
  if (!longitude || !latitude) {
    return ast.Null();
  }
  return funcCall('st_setsrid', [
    funcCall('st_makepoint', [aflt(longitude), aflt(latitude)]),
    aint(4326)
  ]);
};

// a string in the form of lon,lat,lon,lat
// -118.587533,34.024999,-118.495177,34.13165
export const makeBoundingBox = (bbox) => {
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
    throw new Error('coercion function missing');
  });

const makeCast = (arg, type) => ({
  TypeCast: {
    arg,
    typeName: {
      TypeName: {
        names: [
          {
            String: {
              str: type
            }
          }
        ],
        typemod: -1
      }
    }
  }
});

const ref = (name) => ({
  ResTarget: {
    name,
    val: {
      ColumnRef: {
        fields: [
          {
            String: {
              str: 'excluded'
            }
          },
          {
            String: {
              str: name
            }
          }
        ]
      }
    }
  }
});

const indexElem = (name) => ({
  IndexElem: {
    name,
    ordering: 0,
    nulls_ordering: 0
  }
});

const makeConflictClause = (conflictElems, fields) => {
  if (!conflictElems || !conflictElems.length) return undefined;
  const setElems = fields.filter((el) => !conflictElems.includes(el));
  if (setElems.length) {
    return {
      OnConflictClause: {
        action: 2,
        infer: {
          InferClause: {
            indexElems: conflictElems.map((a) => indexElem(a))
          }
        },
        targetList: setElems.map((a) => ref(a))
      }
    };
  } else {
    return {
      OnConflictClause: {
        action: 1,
        infer: {
          InferClause: {
            indexElems: conflictElems.map((a) => indexElem(a))
          }
        }
      }
    };
  }
};

export const InsertOne = ({
  schema = 'public',
  table,
  types,
  record,
  conflict
}) => ({
  RawStmt: {
    stmt: {
      InsertStmt: {
        relation: {
          RangeVar: {
            schemaname: schema,
            relname: table,
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
        onConflictClause: makeConflictClause(conflict, Object.keys(types)),
        override: 0
      }
    },
    stmt_len: 1
  }
});

export const InsertMany = ({
  schema = 'public',
  table,
  types,
  records,
  conflict
}) => ({
  RawStmt: {
    stmt: {
      InsertStmt: {
        relation: {
          RangeVar: {
            schemaname: schema,
            relname: table,
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
        onConflictClause: makeConflictClause(conflict, Object.keys(types)),
        override: 0
      }
    },
    stmt_len: 1
  }
});

export const wrapValue = (val, { wrap, wrapAst, cast } = {}) => {
  if (Array.isArray(wrap)) {
    val = ast.FuncCall({
      funcname: wrap.map((n) => ast.String({ str: n })),
      args: [val]
    });
  }
  if (wrapAst) return wrapAst(val);
  if (cast) return makeCast(val, cast);
  return val;
};

export const getRelatedField = ({
  schema = 'public',
  table,
  refType,
  refKey,
  refField,
  wrap,
  wrapAst,
  cast,
  record,
  parse,
  from
}) => {
  let val;

  const value = parse(record[from[0]]);
  if (typeof value === 'undefined') {
    return ast.Null({});
  }

  switch (refType) {
    case 'int':
      val = ast.A_Const({ val: ast.Integer({ ival: value }) });
      break;
    case 'float':
      val = ast.A_Const({ val: ast.Float({ str: value }) });
      break;
    case 'boolean':
    case 'bool':
      val = ast.String({ str: value ? 'TRUE' : 'FALSE' });
      break;
    case 'text':
    default:
      val = ast.A_Const({ val: ast.String({ str: value }) });
  }

  val = wrapValue(val, { wrap, wrapAst });

  return wrapValue(
    {
      SubLink: {
        subLinkType: 4,
        subselect: {
          SelectStmt: {
            targetList: [
              {
                ResTarget: {
                  val: {
                    ColumnRef: {
                      fields: [
                        {
                          String: {
                            str: refKey
                          }
                        }
                      ]
                    }
                  }
                }
              }
            ],
            fromClause: [
              {
                RangeVar: {
                  schemaname: schema,
                  relname: table,
                  inh: true,
                  relpersistence: 'p'
                }
              }
            ],
            whereClause: {
              A_Expr: {
                kind: 0,
                name: [
                  {
                    String: {
                      str: '='
                    }
                  }
                ],
                lexpr: {
                  ColumnRef: {
                    fields: [
                      {
                        String: {
                          str: refField
                        }
                      }
                    ]
                  }
                },
                rexpr: val
              }
            },
            op: 0
          }
        }
      }
    },
    { cast }
  );
};
