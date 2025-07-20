import { basename, extname } from 'path';

import slugify from './slugify';
export default (
  filename: string,
  { english = true, lower = true, delimeter = '-' } = {}
) => {
  const ext = extname(filename);

  const name = basename(filename)
    .replace(new RegExp(ext.replace(/\./g, '\\.') + '$'), '')
    .replace(/\s+/g, delimeter)
    .replace(new RegExp(delimeter + delimeter + '+', 'g'), delimeter)
    .trim();

  if (english) {
    const fname = slugify(name);
    if (fname.length === 0 && name.length > 0) {
      throw new Error(`BAD_FILE_NAME ${name}`);
    }
  }

  const result = english ? slugify(name) + slugify(ext) : name + ext;
  return lower ? result.toLowerCase() : result;
};