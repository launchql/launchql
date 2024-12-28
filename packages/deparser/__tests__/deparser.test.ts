import ast, { SelectStmt } from '@pgsql/utils';

import { deparse } from '../src';

const selectStmt: SelectStmt = ast.selectStmt({
  targetList: [
    ast.resTarget({
      val: ast.columnRef({
        fields: [ast.aStar()]
      })
    })
  ],
  fromClause: [
    ast.rangeVar({
      schemaname: 'myschema',
      relname: 'mytable',
      inh: true,
      relpersistence: 'p'
    })
  ],
  whereClause: ast.aExpr({
    kind: 'AEXPR_OP',
    name: [ast.string({ str: '=' })],
    lexpr: ast.columnRef({
      fields: [ast.string({ str: 'a' })]
    }),
    rexpr: ast.typeCast({
      arg: ast.aConst({
        val: ast.string({ str: 't' })
      }),
      typeName: ast.typeName({
        names: [
          ast.string({ str: 'pg_catalog' }),
          ast.string({ str: 'bool' })
        ],
        typemod: -1
      })
    })
  }),
  limitOption: 'LIMIT_OPTION_DEFAULT',
  op: 'SETOP_NONE'
});

it('Select Stmt', () => {
  console.log(deparse(selectStmt, {}));
});