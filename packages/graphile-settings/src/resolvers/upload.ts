import uploadNames from '@launchql/upload-names';
import type { ReadStream } from 'fs';

interface Upload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
}

interface UploadPluginInfo {
  uploadPlugin: {
    tags: Record<string, string>;
    type?: string;
  };
}

export default async function resolveUpload(
  upload: Upload,
  _args: unknown,
  _context: unknown,
  info: UploadPluginInfo
): Promise<
  | {
      filename: string;
      mime: string;
      url: string;
    }
  | string
> {
  const {
    uploadPlugin: { tags, type }
  } = info;

  const { filename, mimetype } = upload;

  const rand =
    Math.random().toString(36).substring(2, 7) +
    Math.random().toString(36).substring(2, 7);

  const key = rand + '-' + uploadNames(filename);
  const url = `https://mock-bucket.local/${key}`;

  const typ = type || tags.type;

  const mimetypes = tags.mime
    ? tags.mime.trim().split(',').map(a => a.trim())
    : typ === 'image'
    ? ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']
    : [];

  const allowed = !mimetypes.length || mimetypes.includes(mimetype);

  if (!allowed) {
    throw new Error(
      `Upload rejected: MIME type "${mimetype}" is not allowed. Expected one of: ${mimetypes.join(', ')}.`
    );
  }

  switch (typ) {
    case 'image':
    case 'upload':
      return {
        filename,
        mime: mimetype,
        url
      };
    case 'attachment':
    default:
      return url;
  }
}
