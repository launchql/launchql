import * as ast from '../src';

it('works', () => {
  const obj = ast.A_Expr({
    kind: 0,
    name: [ast.String({ str: '=' })],
    lexpr: ast.Integer({ ival: 0 }),
    rexpr: ast.Integer({ ival: 0 })
  });
  expect(obj).toMatchSnapshot();
});
