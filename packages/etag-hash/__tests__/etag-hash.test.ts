const etag = require('../src');

describe('ETag', () => {
  it('ETag hash', async () => {
    const res = {};
    const strings = ['Hello World', 'Another String'];
    for (var i = 0; i < strings.length; i++) {
      const str = strings[i];
      res[str] = etag
        .createHash()
        .update(str)
        .digest();
    }
    expect(res).toMatchSnapshot();
  });
  it('Large ETag hash', async () => {
    const hash = etag.createHash();

    const SZ = 5 * 1024 * 1024;
    for (let i = 0; i < SZ; i++) {
      hash.update(i + '');
    }

    const res = hash.digest();
    expect(res).toMatchSnapshot();
  });
});
