import Streamer from '@pyramation/s3-streamer';
import uploadNames from '@pyramation/upload-names';
import { env } from '../env';
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

interface UploadResult {
  upload: {
    Location: string;
  };
  contentType: string;
  magic: {
    charset: string;
  };
}

function ensureVar(v: unknown, name: string): asserts v {
  if (!v) throw new Error(`REQUIRES env var: ${name}`);
}

let streamer: Streamer;

function getUploader(): Streamer {
  if (streamer) return streamer;

  const {
    BUCKET_NAME,
    AWS_REGION,
    AWS_SECRET_KEY,
    AWS_ACCESS_KEY,
    MINIO_ENDPOINT
  } = env;

  ensureVar(BUCKET_NAME, 'BUCKET_NAME');
  ensureVar(AWS_ACCESS_KEY, 'AWS_ACCESS_KEY');
  ensureVar(AWS_SECRET_KEY, 'AWS_SECRET_KEY');

  streamer = new Streamer({
    defaultBucket: BUCKET_NAME,
    AWS_REGION,
    AWS_SECRET_KEY,
    AWS_ACCESS_KEY,
    MINIO_ENDPOINT
  });

  return streamer;
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

  const streamer = getUploader();
  const readStream = upload.createReadStream();
  const { filename, mimetype, encoding } = upload;

  const rand =
    Math.random().toString(36).substring(2, 7) +
    Math.random().toString(36).substring(2, 7);

  const key = rand + '-' + uploadNames(filename);

  const result: UploadResult = await streamer.upload({
    readStream,
    filename,
    key,
    bucket: env.BUCKET_NAME
  });

  const contentType = result.contentType || mimetype;
  const url = result.upload.Location;
  const typ = type || tags.type;

  const mimetypes = tags.mime
    ? tags.mime.trim().split(',').map(a => a.trim())
    : typ === 'image'
    ? ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']
    : [];

  const allowed = !mimetypes.length || mimetypes.includes(contentType);

  if (!allowed) {
    throw new Error(
      `Upload rejected: MIME type "${contentType}" is not allowed. Expected one of: ${mimetypes.join(', ')}.`
    );
  }

  switch (typ) {
    case 'image':
    case 'upload':
      return {
        filename,
        mime: contentType,
        url
      };
    case 'attachment':
    default:
      return url;
  }
}
