# content-type-stream

In my life I've always found that `content-type`s or mimetypes to be totally hacky and different across operating systems, browsers, knowing when to use the magic bytes compared to how we actually use files based on their extensions... so this is aimed to make all that simple :)



## content-type info

get proper content-type information via streams without ever reading to disk

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

