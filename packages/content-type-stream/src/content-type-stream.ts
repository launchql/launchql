// @ts-nocheck
import { BufferPeekStream } from 'buffer-peek-stream';
import type { Readable } from 'stream';

import { getContentType } from './get-content-type';

const getCharsetFromMimeType = (mimeType: string): string => {
  if (mimeType.startsWith('text/') || mimeType.includes('svg') || mimeType === 'text/x-shellscript') {
    return 'us-ascii';
  }
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('javascript')) {
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
    peekStream.once('peek', function (buffer: Buffer) {
      import('file-type').then(async (fileType) => {
        try {
          const fileTypeResult = await fileType.fileTypeFromBuffer(buffer);
          const type = fileTypeResult?.mime || 'application/octet-stream';
          const charset = getCharsetFromMimeType(type);
          const contentType = getContentType(filename, type, charset);
          resolve({ stream: peekStream, magic: { type, charset }, contentType });
        } catch (err) {
          reject(err);
        }
      }).catch((err) => {
        reject(err);
      });
    });
    readStream.pipe(peekStream);
  });
}
