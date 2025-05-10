# ETag Hash 

<p align="center" width="100%">
  <img height="120" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/etag-hash"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fetag-hash%2Fpackage.json"/></a>
</p>

Es6 class that generates ETag using the same algorithm as S3 via MD5 sum.

Useful for verifying Amazon S3 multi-part uploads.

## Installation

```sh
npm install etag-hash
```

## Usage

```js
const createHash = require('etag-hash').createHash;
const etag = createHash().update(contents).digest();
```

ETags compatible with s3, API similar to the crypto module to be compatible with streams. Thanks to the author of [this post](https://stackoverflow.com/questions/12186993/what-is-the-algorithm-to-compute-the-amazon-s3-etag-for-a-file-larger-than-5gb#answer-19896823) for the breakdown of the algorithm.
