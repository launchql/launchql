import * as ast from '../src';
import { deparse } from 'pgsql-parser';

it('works', () => {
  const obj = ast.A_Expr({
    kind: 'AEXPR_OP',
    name: [ast.String({ str: '=' })],
    lexpr: ast.Integer({ ival: 0 }),
    rexpr: ast.Integer({ ival: 0 })
  });
  expect(obj).toMatchSnapshot();
  // @ts-ignore
  expect(deparse([obj])).toMatchSnapshot();
});
