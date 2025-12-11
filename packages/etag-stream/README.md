# ETag Stream 

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/etag-stream"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fetag-stream%2Fpackage.json"/></a>
</p>


A Transform stream that calculates Etag/S3 MD5 sum. Uses the same algorithm that S3 uses to calculate the `ETag`.

This is especially useful for verifying large files uploaded using multipart S3 API, enabling use of `createReadStream` to keep memory usage low.

## Installation

```sh
npm install etag-stream
```

## Usage

```js
const ETagStream = require('etag-stream');
const stream = new ETagStream();

let result = null;
stream
  .on('error', e => {
    reject(e);
  })
  .on('etag', data => {
    result = data.toString();
  })
  .on('data', data => {
    // data passes through if you need to do more!
  })
  .on('finish', () => {
    resolve(result);
  });
createReadStream(local).pipe(stream);
```

ETags compatible with s3, thanks to the author of [this post](https://stackoverflow.com/questions/12186993/what-is-the-algorithm-to-compute-the-amazon-s3-etag-for-a-file-larger-than-5gb#answer-19896823) for the breakdown of the algorithm.
