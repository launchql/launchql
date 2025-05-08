import Streamer from '@launchql/s3-streamer';
import uploadNames from '@launchql/upload-names';
import { env } from '../env';
import type { GraphQLResolveInfo } from 'graphql';
import { ReadStream } from 'fs';

const {
  BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
  MINIO_ENDPOINT
} = env;

function ensureVar(v: any, name: string): void {
  if (v) return;
  throw new Error(`REQUIRES env var: ${name}`);
}

let streamer: Streamer;
function getUploader(): Streamer {
  if (streamer) return streamer;
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

interface Upload {
  createReadStream: () => NodeJS.ReadableStream;
  filename: string;
  mimetype: string;
  encoding: string;
}

interface UploadPluginInfo {
  tags: { [key: string]: any };
  type: string;
}

export default async function resolveUpload(
  upload: Upload,
  _args: any,
  _context: any,
  info: GraphQLResolveInfo & { uploadPlugin: UploadPluginInfo }
): Promise<any> {
  const {
    uploadPlugin: { tags, type }
  } = info;
  console.log({ tags });
  console.log({ upload });

  const streamer = getUploader();
  const readStream = upload.createReadStream() as unknown as ReadStream;
  const { filename, mimetype, encoding } = upload;

  const rand =
    Math.random().toString(36).substring(2, 7) +
    Math.random().toString(36).substring(2, 7);
  const key = rand + '-' + uploadNames(filename);

  const result = await streamer.upload({
    readStream,
    filename,
    key,
    bucket: BUCKET_NAME
  });

  const url = result.upload.Location;

  console.log({ mimetype, vs: result });

  const {
    contentType,
    magic: { charset }
  } = result;

  const typ = type || tags.type;

  const mim = tags.mime
    ? tags.mime
        .trim()
        .split(',')
        .map((a: string) => a.trim())
    : typ === 'image'
    ? ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']
    : [];

  let allowed = true;
  if (mim && mim.length) {
    allowed = mim.includes(contentType);
  }

  if (!allowed) {
    throw new Error(`UPLOAD_MIMETYPE ${mim.join(',')}`);
  }

  console.log({ type });

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
