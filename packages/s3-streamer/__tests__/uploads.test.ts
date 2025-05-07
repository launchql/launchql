import dotenv from 'dotenv';
import { sync as glob } from 'glob';
import { createReadStream } from 'fs';
import { basename } from 'path';

import { Streamer, getClient, upload } from '../src';
import { cleanEnv, str, url } from 'envalid';
import type { AsyncUploadResult } from '../src/utils';

// Manually load the dotenv file
dotenv.config({ path: __dirname + '/../../../.env.minio.env' });

const minioEnv = cleanEnv(process.env, {
  BUCKET_NAME: str(),
  AWS_REGION: str({ default: 'us-east-1' }),
  AWS_SECRET_KEY: str(),
  AWS_ACCESS_KEY: str(),
  MINIO_ENDPOINT: url({ default: undefined })
});

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
  .filter((file) => file.split('kitchen-sink')[1] !== '')
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

    const res: Record<string, AsyncUploadResult> = {};
    for (const file of files) {
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
    const client = getClient({
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });

    const res: Record<string, AsyncUploadResult> = {};
    for (const file of files) {
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
