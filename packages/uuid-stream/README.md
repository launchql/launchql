# UUID Stream

<p align="center" width="100%">
  <img height="120" src="https://github.com/launchql/pgsql-parser/assets/545047/6440fa7d-918b-4a3b-8d1b-755d85de8bea" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/uuid-stream"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fuuid-stream%2Fpackage.json"/></a>
</p>

A Transform stream that generates RFC-compliant UUID v5.

## Installation

```sh
npm install uuid-stream
```

## Usage

```js
const UuidStream = require('uuid-stream');
const stream = new UuidStream();
const readstream = getReadStreamSomehow();

let result = null;
stream
  .on('error', e => {
    reject(e);
  })
  .on('uuid', data => {
    result = data.toString();
  })
  .on('data', data => {
    // data passes through if you need to do more!
  })
  .on('finish', () => {
    resolve(result);
  });
readstream.pipe(stream);
```

Just like [node-uuid](https://github.com/kelektiv/node-uuid) for uuid v5, but removed the need to have all contents in-memory to be compatible with streams.
