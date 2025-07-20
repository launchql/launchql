import { createHash } from 'etag-hash';
import { Transform, TransformCallback } from 'stream';

interface ETagStreamOptions {
  partSizeInMb?: number;
  mode?: 'through' | 'buffer';
}

class ETagStream extends Transform {
  private mode: 'through' | 'buffer';
  private hash: ReturnType<typeof createHash>;

  constructor(opts: ETagStreamOptions = {}) {
    const { partSizeInMb = 5, mode = 'through' } = opts;
    super();
    this.mode = mode;
    this.hash = createHash(partSizeInMb);
  }

  _transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.hash.update(chunk);
    if (this.mode === 'through') {
      this.push(chunk);
    }
    callback();
  }

  _flush(callback: TransformCallback): void {
    const digest = this.hash.digest();
    if (this.mode === 'through') {
      this.emit('etag', digest);
    } else {
      this.push(digest);
    }
    callback();
  }
}

export default ETagStream;
