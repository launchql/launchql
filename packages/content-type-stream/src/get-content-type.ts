import mime from 'mime';
import { extname } from 'path';

const special: Record<string, Record<string, string>> = {
  ts: {
    ascii: 'text/x-typescript',
    binary: 'video/mp2t'
  },
  tsx: {
    ascii: 'text/x-typescript'
  }
};

const needsMimeReplacement: string[] = [
  'text/plain',
  'application/zip',
  'application/octet-stream',
  'application/vnd.ms-opentype',
  'application/font-sfnt'
];

const directReplacements: Record<string, string> = {
  'font/ttf': 'application/x-font-ttf',
  'application/vnd.ms-opentype': 'application/x-font-opentype',
  'font/otf': 'application/x-font-opentype',
  'font/woff2': 'application/font-woff2',
  'font/woff': 'application/font-woff',
  'font/eot': 'application/vnd.ms-fontobject',
  'image/svg': 'image/svg+xml'
};

// https: //stackoverflow.com/questions/2871655/proper-mime-type-for-fonts
// svg as "image/svg+xml"(W3C: August 2011)
// ttf as "application/x-font-ttf"(IANA: March 2013)
// or "application/x-font-truetype"
// otf as "application/x-font-opentype"(IANA: March 2013)
// woff as "application/font-woff"(IANA: January 2013)
// woff2 as "application/font-woff2"(W3C W. / E.Draft: May 2014 / March 2016)
// eot as "application/vnd.ms-fontobject"(IANA: December 2005)
// sfnt as "application/font-sfnt"(IANA: March 2013)

export const getContentType = (
  file: string,
  type: string,
  charset?: string
): string => {
  const ext = extname(file).replace(/./, '');

  let final = type;
  if (needsMimeReplacement.includes(type)) {
    // @ts-ignore
    const test = mime.getType(file);
    if (test) final = test;
  }

  if (Object.prototype.hasOwnProperty.call(special, ext)) {
    const key = /ascii/.test(charset || '') ? 'ascii' : (charset || '');
    if (special[ext][key]) {
      final = special[ext][key];
    }
  }

  if (Object.prototype.hasOwnProperty.call(directReplacements, final)) {
    return directReplacements[final];
  }

  return final;
};
