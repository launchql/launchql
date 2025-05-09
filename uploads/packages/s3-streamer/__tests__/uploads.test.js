import { sync as glob } from 'glob';
import { createReadStream } from 'fs';
import { basename } from 'path';

import { Streamer, getClient, upload } from '../src';
import { cleanEnv, str } from 'envalid';

const minioEnv = cleanEnv(
  process.env,
  {
    BUCKET_NAME: str(),
    AWS_REGION: str({ default: 'us-east-1' }),
    AWS_SECRET_KEY: str(),
    AWS_ACCESS_KEY: str()
  },
  { dotEnvPath: __dirname + '/../../../.env.minio.env' }
);

const {
  BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
  MINIO_ENDPOINT
} = minioEnv;

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
  it('upload files via class', async () => {
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });

    const res = {};
    const use = files;
    // const use = [files[3]];
    for (var i = 0; i < use.length; i++) {
      const file = use[i];
      const key = file.key;
      const readStream = createReadStream(file.path);
      const results = await streamer.upload({
        readStream,
        filename: file.path,
        key: 'db1/assets/' + basename(file.path)
      });
      res[key] = results;
    }
    expect(res).toMatchSnapshot();
  });
  it('upload files via functions', async () => {
    const client = new getClient({
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });

    const res = {};
    const use = files;
    // const use = [files[3]];
    for (var i = 0; i < use.length; i++) {
      const file = use[i];
      const key = file.key;
      const readStream = createReadStream(file.path);
      const results = await upload({
        client,
        readStream,
        filename: file.path,
        bucket: BUCKET_NAME,
        key: 'db1/assets/' + basename(file.path)
      });
      res[key] = results;
    }
    expect(res).toMatchSnapshot();
  });
});
