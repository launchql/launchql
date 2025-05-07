# upload-names

```sh
npm install @launchql/upload-names
```

naming files for URLs

```js
const results = await getName(filename, options);
```

## options

### english (bool)

if you want super URL-friendly names, use

```
english: true
```

#### notes

* `english=true`, can end up stripping the entire string if it's not a good input, and it will throw an error.

* `english=false` allows languages like chinese and russian, however, they get converted into super ugly URLs because of web standards.

### lower (bool)

lowercase is ideal for URLs, but not necessary 

```
lower: true
```

### delimeter 

defaults to `-`
