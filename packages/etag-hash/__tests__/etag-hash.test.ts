import { createHash } from '../src';

describe('ETag', () => {
  it('ETag hash', async () => {
    const res: Record<string, string> = {};
    const strings = ['Hello World', 'Another String'];

    for (let i = 0; i < strings.length; i++) {
      const str = strings[i];
      res[str] = createHash()
        .update(Buffer.from(str, 'utf8'))
        .digest();
    }

    expect(res).toMatchSnapshot();
  });

  it('Large ETag hash', async () => {
    const hash = createHash();

    const SZ = 5 * 1024 * 1024;
    for (let i = 0; i < SZ; i++) {
      hash.update(Buffer.from(String(i), 'utf8'));
    }

    const res = hash.digest();
    expect(res).toMatchSnapshot();
  });
});
