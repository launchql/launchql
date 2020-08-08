import mmm from 'mmmagic';
import { BufferPeekStream } from 'buffer-peek-stream';

import { getContentType } from './get-content-type';

const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE | mmm.MAGIC_MIME_ENCODING);

export function streamContentType({ readStream, filename, peekBytes = 16384 }) {
  return new Promise((resolve, reject) => {
    const peekStream = new BufferPeekStream({ peekBytes });
    peekStream.once('peek', function (buffer) {
      magic.detect(buffer, (err, res) => {
        if (err) return reject(err);
        const [type, charset] = res.split('; charset=');
        const contentType = getContentType(filename, type, charset);
        resolve({ stream: peekStream, magic: { type, charset }, contentType });
      });
    });
    readStream.pipe(peekStream);
  });
}
