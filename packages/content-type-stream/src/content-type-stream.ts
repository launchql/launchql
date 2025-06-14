// @ts-ignore
import { BufferPeekStream } from 'buffer-peek-stream';
import type { Readable } from 'stream';
import { extname } from 'path';

import { getContentType } from './get-content-type';

// Special cases for binary files that might be incorrectly detected as text
const binaryExtensions = new Set([
  // Font files
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  // CAD and vector formats
  '.dwg',
  '.dxf',
  '.emf',
  '.wmf',
  // Image formats
  '.psd',
  '.pct',
  '.tga',
  // Media formats
  '.mp4',
  '.swf',
  // Source code (should be text but often detected incorrectly)
  '.ts',
  '.tsx'
]);

// Override MIME types for specific extensions
const mimeTypeOverrides: Record<string, string> = {
  '.ts': 'text/x-typescript',
  '.tsx': 'text/x-typescript',
  '.scss': 'text/x-scss',
  '.less': 'text/x-less',
  '.md': 'text/markdown',
  '.sql': 'text/x-sql',
  '.tsv': 'text/tab-separated-values',
  '.svg': 'image/svg+xml',
  '.shellscript': 'application/x-sh',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pct': 'image/x-pict',
  '.psd': 'image/vnd.adobe.photoshop',
  '.wmf': 'image/wmf'
};

const getCharsetFromMimeType = (mimeType: string, filename: string): string => {
  const ext = extname(filename).toLowerCase();
  
  // If it's a known binary extension, force binary charset
  if (binaryExtensions.has(ext)) {
    return 'binary';
  }

  // Special case for shellscript - should be binary
  if (ext === '.shellscript') {
    return 'binary';
  }

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
        const ext = extname(filename).toLowerCase();
        
        // Use override if exists, otherwise use detected type
        const type = mimeTypeOverrides[ext] || fileTypeResult?.mime || 'application/octet-stream';
        const charset = getCharsetFromMimeType(type, filename);
        const contentType = getContentType(filename, type, charset);
        resolve({ stream: peekStream, magic: { type, charset }, contentType });
      } catch (err) {
        reject(err);
      }
    });
    readStream.pipe(peekStream);
  });
}
