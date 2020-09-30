const UuidStream = require('../src');
const createHash = require('crypto').createHash;

const getUuid = stream => {
  return new Promise((resolve, reject) => {
    const sum = createHash('md5');
    let result = null;
    stream
      .on('error', e => {
        reject(e);
      })
      .on('uuid', data => {
        result = data.toString();
      })
      .on('data', data => {
        sum.update(data);
      })
      .on('finish', () => {
        expect(sum.digest('hex')).not.toBe('d41d8cd98f00b204e9800998ecf8427e');
        resolve(result);
      });
  });
};

const Readable = require('stream').Readable;
class StringStream extends Readable {
  constructor (string) {
    super();
    this.push(string);
    this.push(null);
  }
  _read() {
    return {};
  }
}

describe('UUID v5', () => {
  it('uuids from streams', async () => {
    const res = {};
    const strings = ['Hello World', 'Another String'];
    for (var i = 0; i < strings.length; i++) {
      const str = strings[i];
      const s = new StringStream(str);
      const stream = new UuidStream();
      res[str] = await getUuid(s.pipe(stream));
    }
    expect(res).toMatchSnapshot();
  });
});
