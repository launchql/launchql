const ETagStream = require('../src');
const createReadStream = require('fs').createReadStream;
const glob = require('glob').sync;
const createHash = require('crypto').createHash;

const getETag = stream => {
  return new Promise((resolve, reject) => {
    let result = null;
    stream
      .on('error', e => {
        reject(e);
      })
      .on('data', data => {
        result = data.toString();
      })
      .on('finish', () => {
        resolve(result);
      });
  });
};

const getETagThrough = stream => {
  return new Promise((resolve, reject) => {
    const sum = createHash('md5');
    let result = null;
    stream
      .on('error', e => {
        reject(e);
      })
      .on('etag', data => {
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

describe('etags', () => {
  it('through mode', async () => {
    const res = {};
    const files = [].concat(glob(__dirname + '/fixtures/*.*'));
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('fixtures')[1];
      const stream = new ETagStream({ mode: 'through' });
      res[key] = await getETagThrough(createReadStream(file).pipe(stream));
    }
    expect(res).toMatchSnapshot();
  });
  it('other mode', async () => {
    const res = {};
    const files = [].concat(glob(__dirname + '/fixtures/*.*'));
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('fixtures')[1];
      const stream = new ETagStream({ mode: false });
      res[key] = await getETag(createReadStream(file).pipe(stream));
    }
    expect(res).toMatchSnapshot();
  });
});
