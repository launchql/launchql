import { Transform, TransformCallback } from 'stream';
import { createHash as createUuidHash, UuidHash } from 'uuid-hash';

export const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

export default class UuidStream extends Transform {
  private hash: UuidHash;

  constructor(namespace: string = URL, version: number = 0x50) {
    super();
    this.hash = createUuidHash(namespace, version);
  }

  _write(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.hash.update(chunk);
    this.push(chunk);
    callback();
  }

  _flush(callback: TransformCallback): void {
    this.emit('uuid', this.hash.digest());
    callback();
  }
}
