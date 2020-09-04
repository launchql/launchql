# introspectron

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