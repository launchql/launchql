import { createHash as createCryptoHash, Hash as NodeHash } from 'crypto';

export class ETagHash {
  private partSizeInBytes: number;
  private sums: NodeHash[];
  private part: number;
  private bytes: number;

  constructor(partSizeInMb: number = 5) {
    this.partSizeInBytes = partSizeInMb * 1024 * 1024;
    this.sums = [createCryptoHash('md5')];
    this.part = 0;
    this.bytes = 0;
  }

  update(chunk: Buffer): this {
    const len = chunk.length;

    if (this.bytes + len < this.partSizeInBytes) {
      this.sums[this.part].update(chunk);
      this.bytes += len;
    } else {
      const bytesNeeded = this.partSizeInBytes - this.bytes;
      this.sums[this.part].update(chunk.subarray(0, bytesNeeded));
      this.part++;
      this.sums.push(createCryptoHash('md5'));
      this.bytes = len - bytesNeeded;
      this.sums[this.part].update(chunk.subarray(bytesNeeded));
    }

    return this;
  }

  digest(): string {
    if (!this.part) {
      return this.sums[0].digest('hex');
    }

    const checksum = this.sums.map((s) => s.digest('hex')).join('');
    const final = createCryptoHash('md5')
      .update(Buffer.from(checksum, 'hex'))
      .digest('hex');

    return `${final}-${this.part + 1}`;
  }
}

export const createHash = (...args: ConstructorParameters<typeof ETagHash>): ETagHash => {
  return new ETagHash(...args);
};
