import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { sync as glob } from 'glob';

import ETagStream from '../src';

const getETag = (stream: NodeJS.ReadableStream): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    let result: string | null = null;
    stream
      .on('error', (e) => reject(e))
      .on('data', (data: Buffer) => {
        result = data.toString();
      })
      .on('finish', () => resolve(result));
  });
};

const getETagThrough = (stream: NodeJS.ReadableStream): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const sum = createHash('md5');
    let result: string | null = null;

    stream
      .on('error', (e) => reject(e))
      .on('etag', (data: Buffer) => {
        result = data.toString();
      })
      .on('data', (data: Buffer) => {
        sum.update(data);
      })
      .on('finish', () => {
        // Confirm non-empty content
        expect(sum.digest('hex')).not.toBe('d41d8cd98f00b204e9800998ecf8427e');
        resolve(result);
      });
  });
};

describe('etags', () => {
  it('through mode', async () => {
    const res: Record<string, string | null> = {};
    const files = glob(`${__dirname}/../__fixtures__/*.*`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('__fixtures__')[1];
      const stream = new ETagStream({ mode: 'through' });
      res[key] = await getETagThrough(createReadStream(file).pipe(stream));
    }

    expect(res).toMatchSnapshot();
  });

  it('other mode', async () => {
    const res: Record<string, string | null> = {};
    const files = glob(`${__dirname}/../__fixtures__/*.*`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('__fixtures__')[1];
      const stream = new ETagStream({ mode: 'buffer' }); // changed `false` to a valid type
      res[key] = await getETag(createReadStream(file).pipe(stream));
    }

    expect(res).toMatchSnapshot();
  });
});
