const stream2etag = require('../src');
const createReadStream = require('fs').createReadStream;
const glob = require('glob').sync;

describe('etags', () => {
  it('calculates etags properly', async () => {
    const res = {};
    const files = [].concat(glob(__dirname + '/fixtures/*.*'));

    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const key = file.split('fixtures')[1];
      res[key] = await stream2etag(createReadStream(file));
    }
    expect(res).toMatchSnapshot();
  });
});
