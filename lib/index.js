const stream = require('stream');

const uuid = require('uuid-hash');

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
module.exports.DNS = DNS;
module.exports.URL = URL;

class UuidStream extends stream.Transform {
  constructor(namespace = URL, version = 0x50) {
    super();
    this.hash = uuid.createHash(namespace, version);
  }

  _write(chunk, enc, next) {
    this.hash.update(chunk);
    this.push(chunk);
    next();
  }

  _flush(done) {
    this.emit('uuid', this.hash.digest());
    done();
  }

}

module.exports = UuidStream;