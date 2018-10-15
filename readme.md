# UUID Hash

Es6 class that generates RFC-compliant UUID v5.

## Installation

```sh
npm install uuid-hash
```

## Usage

```js
const uuid = require('uuid-hash');
const identifier = uuid.createHash().update(contents).digest();
```

Just like [node-uuid](https://github.com/kelektiv/node-uuid) for uuid v5, but removed the need to have all contents in-memory to be compatible with streams. API similar to the crypto module.