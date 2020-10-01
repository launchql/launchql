# UUID Stream ![Build Status](https://travis-ci.org/pyramation/uuid-stream.svg?branch=master)

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
