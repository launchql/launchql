# @launchql/content-type-stream

<p align="center" width="100%">
  <img height="200" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/content-type-stream"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fcontent-type-stream%2Fpackage.json"/></a>
</p>

```sh
npm install @launchql/content-type-stream
```

In my life I've always found that `content-type`s or mimetypes to be totally hacky and different across operating systems and browsers. Also, knowing when to use the magic bytes compared to how we actually use files based on their extensions is never consistent... so this is aimed to make all that simple :)

## content-type info

get proper content-type information via streams without ever writing to disk

```js
const readStream = createReadStream(filename);
const { stream, magic, contentType } = await streamContentType({
   readStream,
   filename
});
```

## using steams

the `stream` it returns can then be used, for example

```js
  const { stream, contentType } = await streamContentType({
    readStream,
    filename
  });
  return await asyncUpload({
    key,
    contentType,
    readStream: stream,
    bucket
  });
```

## contents hash stream

if you want more info with your upload, with `ContentStream` you can get nice hashes

* `uuid`: RFC-compliant UUID v5.
* `etag`: Etag/S3 MD5 sum
* `sha`: A sha sum

```js
    const contentStream = new ContentStream();
// ...
    readStream.pipe(contentStream);
    contentStream.pipe(uploadStream);
```

```js
   { 
        uuid: '78160718-8dfa-5cb4-bb50-e479c8c58383',
        sha: 'e6c7c64d292a414941d239c57117b36f24c9f829',
        etag: '64dcb5b3b291074d02c80f600fda3f6e'
    }
```

