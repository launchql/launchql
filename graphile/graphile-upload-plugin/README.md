# graphile-upload-plugin

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/launchql/launchql/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/graphile-upload-plugin">
    <img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=graphile%2Fgraphile-upload-plugin%2Fpackage.json"/>
  </a>
</p>

PostGraphile plugin for handling file uploads via GraphQL. Adds `Upload` scalar type and upload field support for PostgreSQL columns.

## Install

```bash
pnpm add graphile-upload-plugin
```

## Usage

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

## Configuration

The plugin accepts `uploadFieldDefinitions` in `graphileBuildOptions`:

- **By type**: Match PostgreSQL types by `name` and `namespaceName`
- **By tag**: Match columns via smart comments (e.g., `@upload`)

Each definition requires a `resolve` function that processes the upload and returns the value to store in the database.

