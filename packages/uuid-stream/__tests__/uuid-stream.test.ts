import { createHash } from 'crypto';
import { Readable, ReadableOptions } from 'stream';

import UuidStream from '../src';

const getUuid = (stream: NodeJS.ReadableStream): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const sum = createHash('md5');
    let result: string | null = null;

    stream
      .on('error', (e: Error) => {
        reject(e);
      })
      .on('uuid', (data: Buffer | string) => {
        result = data.toString();
      })
      .on('data', (data: Buffer | string) => {
        sum.update(data);
      })
      .on('finish', () => {
        expect(sum.digest('hex')).not.toBe('d41d8cd98f00b204e9800998ecf8427e');
        resolve(result);
      });
  });
};

class StringStream extends Readable {
  constructor(private string: string, opts?: ReadableOptions) {
    super(opts);
    this.push(string);
    this.push(null);
  }

  _read(): void {
    // no-op
  }
}

describe('UUID v5', () => {
  it('uuids from streams', async () => {
    const res: Record<string, string | null> = {};
    const strings = ['Hello World', 'Another String'];

    for (let i = 0; i < strings.length; i++) {
      const str = strings[i];
      const s = new StringStream(str);
      const stream = new UuidStream();
      res[str] = await getUuid(s.pipe(stream));
    }

    expect(res).toMatchSnapshot();
  });
});
