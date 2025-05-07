// @ts-nocheck
import crypto from 'crypto';
import stream from 'stream';

// TODO move these into this monorepo
import uuid from 'uuid-hash';
import etag from 'etag-hash';

export class ContentStream extends stream.Transform {
  constructor() {
    super();
    this.shasum = crypto.createHash('sha1');
    this.etagsum = etag.createHash();
    this.uuidsum = uuid.createHash();
  }
  _write(chunk, enc, next) {
    this.shasum.update(chunk);
    this.etagsum.update(chunk);
    this.uuidsum.update(chunk);
    this.push(chunk);
    next();
  }
  _flush(done) {
    this.emit('contents', {
      uuid: this.uuidsum.digest(),
      sha: this.shasum.digest('hex'),
      etag: this.etagsum.digest()
    });
    done();
  }
}
