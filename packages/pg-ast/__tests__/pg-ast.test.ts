import { deparse } from 'pgsql-deparser';

import * as t from '../src';

it('deparses', async () => {
  const obj = t.nodes.aExpr({
    kind: 'AEXPR_OP',
    name: [t.nodes.string({ sval: '=' })],
    lexpr: t.nodes.integer({ ival: 0 }),
    rexpr: t.nodes.integer({ ival: 0 })
  });
  expect(obj).toMatchSnapshot();
  expect(await deparse([obj])).toMatchSnapshot();
});
