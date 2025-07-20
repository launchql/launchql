import Streamer from '@launchql/s3-streamer';
import uploadNames from '@launchql/upload-names';
import { ReadStream } from 'fs';
import type { GraphQLResolveInfo } from 'graphql';

interface UploaderOptions {
  bucketName: string;
  awsRegion: string;
  awsSecretKey: string;
  awsAccessKey: string;
  minioEndpoint?: string;
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

export class UploadHandler {
  private streamer: Streamer;

  constructor(private options: UploaderOptions) {
    this.streamer = new Streamer({
      defaultBucket: options.bucketName,
      awsRegion: options.awsRegion,
      awsSecretKey: options.awsSecretKey,
      awsAccessKey: options.awsAccessKey,
      minioEndpoint: options.minioEndpoint
    });
  }

  async handleUpload(
    upload: Upload,
    _args: any,
    _context: any,
    info: GraphQLResolveInfo & { uploadPlugin: UploadPluginInfo }
  ): Promise<any> {
    const {
      uploadPlugin: { tags, type }
    } = info;

    const readStream = upload.createReadStream() as ReadStream;
    const { filename, mimetype } = upload;

    const rand =
      Math.random().toString(36).substring(2, 7) +
      Math.random().toString(36).substring(2, 7);
    const key = rand + '-' + uploadNames(filename);

    const result = await this.streamer.upload({
      readStream,
      filename,
      key,
      bucket: this.options.bucketName
    });

    const url = result.upload.Location;
    const {
      contentType,
      magic: { charset }
    } = result;

    const typ = type || tags.type;

    const mim = tags.mime
      ? tags.mime.trim().split(',').map((a: string) => a.trim())
      : typ === 'image'
        ? ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml']
        : [];

    if (mim.length && !mim.includes(contentType)) {
      throw new Error(`UPLOAD_MIMETYPE ${mim.join(',')}`);
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
}
