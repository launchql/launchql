import stream2etag from '../src';
import { createReadStream } from 'fs';
import { sync as glob } from 'glob';

describe('etags', () => {
  it('calculates etags properly', async () => {
    const res: Record<string, string> = {};
    const files = glob(__dirname + '/../__fixtures__/*.*');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('__fixtures__')[1];
      res[key] = await stream2etag(createReadStream(file));
    }

    expect(res).toMatchSnapshot();
  });
});
