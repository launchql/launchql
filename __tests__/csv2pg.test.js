import { parse } from '../src';
import { resolve } from 'path';

const CSV = resolve(__dirname + '/../__fixtures__/zip-codes.csv');

it('works', async () => {
  const result = await parse(CSV);
  expect(result).toMatchSnapshot();
});
