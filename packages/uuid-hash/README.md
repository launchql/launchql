# UUID Hash

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/uuid-hash"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fuuid-hash%2Fpackage.json"/></a>
</p>

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
