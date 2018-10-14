const stream = require('stream');

const etag = require('etag-hash');

class ETagStream extends stream.Transform {
  constructor(opts = {}) {
    const {
      partSizeInMb = 5,
      mode = 'through'
    } = opts;
    super();
    this.mode = mode;
    this.hash = etag.createHash(partSizeInMb);
  }

  _write(chunk, enc, next) {
    this.hash.update(chunk);

    if (this.mode === 'through') {
      this.push(chunk);
    }

    next();
  }

  _flush(done) {
    if (this.mode === 'through') {
      this.emit('etag', this.hash.digest());
    } else {
      this.push(this.hash.digest());
    }

    done();
  }

}

module.exports = ETagStream;