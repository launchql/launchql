# introspectron

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/introspectron"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fintrospectron%2Fpackage.json"/></a>
</p>

```sh
npm install introspectron
```

Thanks https://www.graphile.org/ for the original introspection query!


```js
import { introspect } from 'introspectron';

const result = await introspect(pgPool, {
   schemas: ['app_public']
});
```

output

```
 {
  "__pgVersion": 110003,
  "attribute": [
     {
      "aclInsertable": true,
      "aclSelectable": true,
      "aclUpdatable": true,
      "classId": "826",
      "columnLevelSelectGrant": false,
      "comment": null,
      "description": null,
      "hasDefault": false,
      "identity": "",
      "isNotNull": true,
      "kind": "attribute",
      "name": "defaclrole",
      "num": 1,
      "tags": Object {},
      "typeId": "26",
      "typeModifier": null,
    },
    ...

```

## testing

createdb testdb
psql testdb -f ./seed.sql