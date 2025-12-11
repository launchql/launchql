# ETag Hash 

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/etag-hash"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fetag-hash%2Fpackage.json"/></a>
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
