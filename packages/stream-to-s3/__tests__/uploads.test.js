import { sync as glob } from 'glob';
import { createReadStream } from 'fs';
import { basename } from 'path';

import asyncUpload from '../src';
import env from '../src/env';
import { cleanEnv, str } from 'envalid';

const testEnv = cleanEnv(
  env,
  {
    BUCKET_NAME: str()
  },
  { dotEnvPath: null }
);

jest.setTimeout(3000000);
const files = []
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**'))
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**/.*'))
  .filter((file) => {
    const key = file.split('kitchen-sink')[1];
    return key != '';
  })
  .map((f) => ({
    key: basename(f),
    path: f
  }));

describe('uploads', () => {
  it('works', async () => {
    const res = {};
    const use = files;
    // const use = [files[3]];
    for (var i = 0; i < use.length; i++) {
      const file = use[i];
      const key = file.key;
      const readStream = createReadStream(file.path);
      const results = await asyncUpload({
        readStream,
        filename: file.path,
        bucket: testEnv.BUCKET_NAME,
        key: 'db1/assets/' + basename(file.path)
      });
      res[key] = results;
    }
    expect(res).toMatchSnapshot();
  });
});
