# Stream to ETag

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/stream-to-etag"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fstream-to-etag%2Fpackage.json"/></a>
</p>

Calculates Etag/S3 MD5 sum given a readable stream. Uses the same algorithm that S3 uses to calculate the `ETag`.

This is especially useful for verifying large files uploaded using multipart S3 API, enabling use of `createReadStream` to keep memory usage low.

## Installation

```sh
npm install stream-to-etag
```

## Usage

```js
    const etag = await stream2etag(createReadStream(file));
```

ETags compatible with s3, thanks to the author of [this post](https://stackoverflow.com/questions/12186993/what-is-the-algorithm-to-compute-the-amazon-s3-etag-for-a-file-larger-than-5gb#answer-19896823) for the breakdown of the algorithm.
