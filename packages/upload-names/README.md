# @launchql/upload-names

<p align="center" width="100%">
  <img height="250" src="https://github.com/user-attachments/assets/d0456af5-b6e9-422e-a45d-2574d5be490f" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/upload-names"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Fupload-names%2Fpackage.json"/></a>
</p>

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
