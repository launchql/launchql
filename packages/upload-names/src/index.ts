import { basename, extname } from 'path';
import slugify from './slugify';

interface Options {
  english?: boolean;
  lower?: boolean;
  delimeter?: string;
}

export default (
  filename: string,
  { english = true, lower = true, delimeter = '-' }: Options = {}
): string => {
  // Step 1: Normalize input
  filename = filename.trim().replace(/\.{2,}/g, '.'); // collapse double dots

  const ext = extname(filename);
  const base = basename(filename, ext);

  // Step 2: Normalize base name
  const name = base
    .replace(/\s+/g, delimeter)
    .replace(new RegExp(`${delimeter}{2,}`, 'g'), delimeter)
    .trim();

  // Step 3: Sluggify (ASCII-only if english = true)
  let slug = name;
  if (english) {
    slug = slugify(name);
    if (slug.length === 0 && name.length > 0) {
      // Optionally fallback instead of throwing:
      // return `${crypto.randomUUID()}${ext}`;
      throw new Error(`BAD_FILE_NAME ${name}`);
    }
  }

  const result = english ? `${slug}${slugify(ext)}` : `${name}${ext}`;
  return lower ? result.toLowerCase() : result;
};
