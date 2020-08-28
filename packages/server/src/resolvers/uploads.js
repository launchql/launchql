import Streamer from '@pyramation/s3-streamer';
import uploadNames from '@pyramation/upload-names';
import env from '../env';

const {
  BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
  MINIO_ENDPOINT
} = env;

function ensureVar(v, name) {
  if (v) return;
  throw new Error(`REQUIRES env var: ${name}`);
}

let streamer;
function getUploader() {
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
export default async function resolveUpload(upload, _args, _context, info) {
  const {
    uploadPlugin: { tags }
  } = info;
  console.log({ tags });
  console.log({ upload });
  const streamer = getUploader();
  const readStream = upload.createReadStream();
  const { filename, mimetype, encoding } = upload;

  const rand =
    Math.random().toString(36).substring(2, 7) +
    Math.random().toString(36).substring(2, 7);
  const key = rand + '-' + uploadNames(filename);
  const result = await streamer.upload({
    readStream,
    filename,
    key,
    bucket: env.BUCKET_NAME
  });
  const url = result.upload.Location;

  console.log({ mimetype, vs: result });

  const {
    contentType,
    magic: { charset }
  } = result;

  // Return metadata to save it to Postgres
  const type = tags.type;
  switch (type) {
    case 'attachment':
      return {
        filename,
        mimetype: contentType,
        encoding,
        charset,
        url
      };
    default:
      return url;
  }
}
