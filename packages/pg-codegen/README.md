# pg-codegen

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/pg-codegen"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fcodegen%2Fpackage.json"/></a>
</p>

Generate fully-typed TypeScript classes and interfaces from a live PostgreSQL schema via introspection.

> Converts your PostgreSQL tables into idiomatic TypeScript code — fast, predictable, and schema-aware.

---

## ✨ Features

🧠 **Intelligent Introspection**
Pulls schema structure using native SQL introspection — no GraphQL required.

🧱 **Interface + Class Output**
Generates matching `interface` + `class` pairs for each table using PascalCase naming.

🧹 **Schema-Aware Output**
Writes files into `schemas/<schema>.ts`, grouped and re-exported from an `index.ts`.

🔗 **Type Mapping for Postgres Primitives**
Supports `UUID`, `Timestamp`, `Boolean`, `Text`, `Int`, and nullable detection.

🪴 **Auto Imports from \_common.ts**
Deduplicates and imports shared scalar types intelligently.

🧪 **Snapshot-Ready for Testing**
Babel AST-based output is stable and perfect for inline snapshot tests.

## 🛠️ Install

```bash
npm install pg-codegen
```

## 🚀 Usage

```ts
import { generateCodeTree } from 'pg-codegen';
import getIntrospectionRows from 'pg-codegen/introspect';

const rows = await getIntrospectionRows({
  client: pgClient,
  introspectionOptions: {
    pgLegacyFunctionsOnly: false,
    pgIgnoreRBAC: true
  },
  namespacesToIntrospect: ['my_schema'],
  includeExtensions: false
});

const output = generateCodeTree(rows, {
  includeUUID: true,
  includeTimestamps: true
});

// Example: write output['schemas/my_schema.ts'] to disk
```

## 📟 Example Output

```ts
// schemas/_common.ts
export type UUID = string;
export type Timestamp = string;

// schemas/my_schema.ts
import { UUID, Timestamp } from './_common';

export interface Users {
  id: UUID;
  email: string;
  created_at: Timestamp;
}

export class Users implements Users {
  id: UUID;
  email: string;
  created_at: Timestamp;

  constructor(data: Users) {
    this.id = data.id;
    this.email = data.email;
    this.created_at = data.created_at;
  }
}
```
