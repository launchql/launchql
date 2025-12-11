# graphile-upload-plugin

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-upload-plugin">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-upload-plugin%2Fpackage.json"/>
  </a>
</p>

**`graphile-upload-plugin`** adds an `Upload` scalar and upload field resolvers for PostGraphile, letting you store uploaded metadata in PostgreSQL columns.

## 🚀 Installation

```bash
pnpm add graphile-upload-plugin
```

## ✨ Features

- Adds the `Upload` scalar to PostGraphile
- Supports upload resolvers by type or smart comment tag
- Flexible resolver hook to store files anywhere (S3, local, etc.)

## 📦 Usage

```ts
import express from 'express';
import { postgraphile } from 'postgraphile';
import UploadPostGraphilePlugin from 'graphile-upload-plugin';

const app = express();
app.use(
  postgraphile(process.env.DATABASE_URL, ['app_public'], {
    appendPlugins: [UploadPostGraphilePlugin],
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          name: 'upload',
          namespaceName: 'public',
          type: 'JSON',
          resolve: async (upload, args, context, info) => {
            // Handle upload
            return { url: '...', size: upload.size };
          },
        },
        {
          tag: 'upload',
          resolve: async (upload, args, context, info) => {
            // Handle upload by tag
            return { url: '...' };
          },
        },
      ],
    },
  })
);
```

## 🔧 Configuration

The plugin accepts `uploadFieldDefinitions` in `graphileBuildOptions`:

- **By type**: Match PostgreSQL types by `name` and `namespaceName`
- **By tag**: Match columns via smart comments (e.g., `@upload`)

Each definition requires a `resolve` function that processes the upload and returns the value to store in the database.

## 🧪 Testing

```sh
# requires a local Postgres available (defaults to postgres/password@localhost:5432)
pnpm --filter graphile-upload-plugin test
```
