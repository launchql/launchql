# s3-streamer

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/s3-streamer"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fs3-streamer%2Fpackage.json"/></a>
</p>

```sh
npm install @launchql/s3-streamer
```

Stream uploads to s3

```js
import Streamer from '@launchql/s3-streamer';
const streamer = new Streamer(opts)
const readStream = createReadStream(filename);
const results = await streamer.upload({
    readStream,
    filename,
    bucket,
    key
});
```

and get detailed payload results

```js
{ upload:
{ ETag: '"952fd44d14cee87882239b707231609d"',
    Location: 'http://localhost:9000/launchql/db1/assets/.gitignore',
    key: 'db1/assets/.gitignore',
    Key: 'db1/assets/.gitignore',
    Bucket: 'launchql' },
magic: { type: 'text/plain', charset: 'us-ascii' },
contentType: 'text/plain',
contents:
{ uuid: '278aee01-1404-5725-8f0e-7044c9c16397',
    sha: '7d65523f2a5afb69d76824dd1dfa62a34faa3197',
    etag: '952fd44d14cee87882239b707231609d' } }
```

## functional utils

If you don't want to use the `Streamer` class you can use the utils directly:

```js
import { getClient, upload } from '@launchql/s3-streamer';
const client = getClient(opts)
const readStream = createReadStream(filename);
const results = await upload({
    client,
    readStream,
    filename,
    bucket,
    key
});
```

## variables

### production

```js
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
```

### using minio

```js
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
```

values:

`MINIO_ENDPOINT`=http://localhost:9000
`AWS_ACCESS_KEY`=minio-access
`AWS_SECRET_KEY`=minio-secret

