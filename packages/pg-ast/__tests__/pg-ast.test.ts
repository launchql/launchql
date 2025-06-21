import * as ast from '../src';
import { deparse } from 'pgsql-deparser';

it('deparses', async () => {
  const obj = ast.A_Expr({
    kind: 'AEXPR_OP',
    name: [ast.String({ str: '=' })],
    lexpr: ast.Integer({ ival: 0 }),
    rexpr: ast.Integer({ ival: 0 })
  });
  expect(obj).toMatchSnapshot();
  expect(await deparse([obj])).toMatchSnapshot();
});
