// @ts-ignore
import { BufferPeekStream } from 'buffer-peek-stream';
import type { Readable } from 'stream';

import { getContentType } from './get-content-type';

const getCharsetFromMimeType = (mimeType: string): string => {
  const asciiMimeTypes = [
    'text/',
    'svg',
    'text/x-shellscript',
    'json',
    'xml',
    'javascript',
  ];

  if (asciiMimeTypes.some(type => mimeType.includes(type))) {
    return 'us-ascii';
  }
  return 'binary';
};

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
    peekStream.once('peek', async function (buffer: Buffer) {
      try {
        const Mimetics = require('mimetics');
        const mimetics = new Mimetics();
        const fileTypeResult = await mimetics.parseAsync(buffer);
        const type = fileTypeResult?.mime || 'application/octet-stream';
        const charset = getCharsetFromMimeType(type);
        const contentType = getContentType(filename, type, charset);
        resolve({ stream: peekStream, magic: { type, charset }, contentType });
      } catch (err) {
        reject(err);
      }
    });
    readStream.pipe(peekStream);
  });
}
