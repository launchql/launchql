// @ts-nocheck
import { createReadStream } from 'fs';
import { sync as glob } from 'glob';
import { basename } from 'path';

import { streamContentType } from '../src';

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

const malicious = glob(__dirname + '/../../../__fixtures__/malicious/**')
  .filter((file) => {
    const key = file.split('malicious')[1];
    return key != '';
  })
  .map((f) => ({
    key: basename(f),
    path: f
  }));

describe('mimetypes', () => {
  it('good files', async () => {
    const res = {};
    const use = files;

    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      const key = file.key;
      const readStream = createReadStream(file.path);
      const { stream: newStream, magic, contentType } = await streamContentType(
        {
          readStream,
          filename: file.path
        }
      );
      res[key] = {
        magic,
        contentType
      };
    }
    expect(res).toMatchSnapshot();
  });
  it('malicious files', async () => {
    const res = {};
    const use = malicious;

    for (let i = 0; i < use.length; i++) {
      const file = use[i];
      const key = file.key;
      const readStream = createReadStream(file.path);
      const { stream: newStream, magic, contentType } = await streamContentType(
        {
          readStream,
          filename: file.path
        }
      );
      res[key] = {
        magic,
        contentType
      };
    }
    expect(res).toMatchSnapshot();
  });
});
