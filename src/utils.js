import * as ast from 'pg-ast';

export const InsertStmt = ({
  schemaName,
  tableName,
  fields,
  types,
  record
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
        cols: fields.map((field) => ({
          ResTarget: {
            name: field.name
          }
        })),
        selectStmt: {
          SelectStmt: {
            valuesLists: [
              Object.entries(record).map(([k, v]) => {
                const type = types[k];
                switch (type) {
                  case 'text':
                    return ast.A_Const({ val: ast.String({ str: v }) });
                  case 'int':
                    return ast.A_Const({ val: ast.Integer({ ival: v }) });
                  case 'float':
                    return ast.A_Const({ val: ast.Float({ str: v }) });
                  default:
                    return ast.A_Const({ val: ast.String({ str: v }) });
                }
              })
            ],
            op: 0
          }
        },
        override: 0
      }
    },
    stmt_len: 90
  }
});
