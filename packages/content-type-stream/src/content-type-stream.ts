// @ts-nocheck
import mmm from '@launchql/mmmagic';
import { BufferPeekStream } from 'buffer-peek-stream';
import type { Readable } from 'stream';

import { getContentType } from './get-content-type';

const Magic = mmm.Magic;
const magic: InstanceType<typeof mmm.Magic> = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);

interface StreamContentTypeArgs {
  readStream: Readable;
  filename: string;
  peekBytes?: number;
}

interface StreamContentTypeResult {
  stream: BufferPeekStream;
  magic: { type: string; charset: string };
  contentType: string;
}

export function streamContentType({
  readStream,
  filename,
  peekBytes = 16384
}: StreamContentTypeArgs): Promise<StreamContentTypeResult> {
  return new Promise((resolve, reject) => {
    const peekStream = new BufferPeekStream({ peekBytes });
    peekStream.once('peek', function (buffer: Buffer) {
      magic.detect(buffer, (err: Error | null, res: string) => {
        if (err) return reject(err);
        const [type, charset] = res.split('; charset=');
        const contentType = getContentType(filename, type, charset);
        resolve({ stream: peekStream, magic: { type, charset }, contentType });
      });
    });
    readStream.pipe(peekStream);
  });
}
