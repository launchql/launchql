import uuid from '../src';

describe('UUID v5', () => {
  it('uuid v5 hash', async () => {
    const res = {};
    const strings = ['Hello World', 'Another String', 'uuid'];
    for (var i = 0; i < strings.length; i++) {
      const str = strings[i];
      res[str] = uuid
        .createHash()
        .update(str)
        .digest();
    }
    expect(res).toMatchSnapshot();
  });
  it('uuid v5 hash w custom namespace', async () => {
    const res = {};
    const strings = ['Hello World', 'Another String', 'uuid'];
    for (var i = 0; i < strings.length; i++) {
      const str = strings[i];
      res[str] = uuid
        .createHash('e8613ca4-b17d-5979-82ea-86c1373c4ffc')
        .update(str)
        .digest();
    }
    expect(res).toMatchSnapshot();
  });
});
