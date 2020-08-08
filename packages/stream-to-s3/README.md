# stream-to-s3

Stream uploads to s3

```js
const readStream = createReadStream(filename);
const results = await asyncUpload({
    readStream,
    filename,
    bucket,
    key
});
```

and get detailed payload results

```js
{ upload:
{ ETag: '"952fd44d14cee87882239b707231609d"',
    Location: 'http://localhost:9000/launchql/db1/assets/.gitignore',
    key: 'db1/assets/.gitignore',
    Key: 'db1/assets/.gitignore',
    Bucket: 'launchql' },
magic: { type: 'text/plain', charset: 'us-ascii' },
contentType: 'text/plain',
contents:
{ uuid: '278aee01-1404-5725-8f0e-7044c9c16397',
    sha: '7d65523f2a5afb69d76824dd1dfa62a34faa3197',
    etag: '952fd44d14cee87882239b707231609d' } }
```