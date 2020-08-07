import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import path from 'path';
import env from '../env';
import { rejects } from 'assert';
const UPLOAD_DIR_NAME = 'uploads';
const stream = require('stream');

const s3 = new S3({
    region: 'us-east-1',
    apiVersion: '2006-03-01'
});


// ths could go in resolver if needed...
s3.config.update({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY
    }
});

const uploadMethod1 = async ({ upload }) => {
    return new Promise((resolve, reject) => {

        const readStream = upload.createReadStream();
        const Body = new stream.PassThrough();

        s3.upload({
            Body,
            Key: upload.filename,
            Bucket: env.BUCKET_NAME
        })
            .on('httpUploadProgress', progress => {
                console.log('progress', progress);
            })
            .send((err, data) => {
                if (err) {
                    Body.destroy(err);
                    reject(err);
                } else {
                    console.log(`File uploaded and available at ${data.Location}`);
                    Body.destroy();
                    resolve(data);
                }
            });

        // return Body;
        const pipeline = readStream.pipe(Body);

        pipeline.on('close', () => {
            console.log('upload finished, do something else');
        })
        pipeline.on('error', () => {
            console.log('upload wasn\'t successful. Handle it');
        })
    });
}

const uploadAsyncS3 = async ({ upload }) => {
    const readStream = upload.createReadStream();
    if (upload.filename.match(/\.svg$/)) {
        upload.mimetype = 'image/svg+xml';
    }
    return s3.upload({
        Body: readStream,
        Key: upload.filename,
        ContentType: upload.mimetype,
        Bucket: env.BUCKET_NAME
    })
        .on('httpUploadProgress', progress => {
            console.log('progress', progress);
        })
        .promise();
};



// TODO use https://github.com/minio/minio-js
export default async function resolveUpload(upload, _args, _context, info) {
    const {uploadPlugin: { tags }} = info;
    console.log({ tags })
    console.log({ upload })

    const result = await uploadAsyncS3({ upload });
    console.log({ result })
    const url = result.Location;

    const {
        filename,
        mimetype,
        encoding
    } = upload;

    // Return metadata to save it to Postgres
    const type = tags.type;
    switch (type) {
        case 'attachment':
            return {
                filename,
                mimetype,
                encoding,
                url
            }
        default:
            return url;
    }
}
