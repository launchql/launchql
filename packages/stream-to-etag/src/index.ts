import { createHash } from 'etag-hash';
import { Readable } from 'stream';

export default function stream2etag(stream: Readable, partSizeInMb: number = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(partSizeInMb);

    stream
      .on('error', (error: Error) => {
        reject(error);
      })
      .on('data', (chunk: Buffer | string) => {
        const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk;
        hash.update(buf);
      })      
      .on('end', () => {
        resolve(hash.digest());
      });
  });
}
