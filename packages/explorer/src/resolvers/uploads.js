import uploadAsyncS3 from '@pyramation/stream-to-s3';
import uploadNames from '@pyramation/upload-names';
import env from '../env';

export default async function resolveUpload(upload, _args, _context, info) {
    const { uploadPlugin: { tags } } = info;
    console.log({ tags })
    console.log({ upload })
    const readStream = upload.createReadStream();
    const {
        filename,
        mimetype,
        encoding
    } = upload;

    const rand = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
    const key = rand + '-' + uploadNames(filename)
    const result = await uploadAsyncS3({ readStream, filename, key, bucket: env.BUCKET_NAME });
    const url = result.upload.Location;

    console.log({ mimetype, 'vs': result })

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
            }
        default:
            return url;
    }
}
