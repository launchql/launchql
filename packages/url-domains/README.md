# @launchql/url-domains

<p align="center" width="100%">
  <img height="120" src="https://github.com/launchql/pgsql-parser/assets/545047/6440fa7d-918b-4a3b-8d1b-755d85de8bea" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql-2.0/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql-2.0/blob/main/LICENSE-MIT"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/url-domains"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql-2.0?filename=packages%2Furl-domains%2Fpackage.json"/></a>
</p>

for use with express

## why?

Because, express requires that you do things like this when you need `req.subdomains` on `localhost`:

```js
  if (env.SERVER_HOST === 'localhost') {
    app.set('subdomain offset', 1);
  }
```

and I believe the developer experience shouldn't include any off-by-one errors imo if you forgot this or your environments are changing and/or dynamic.

So why not just make a `subdomains` object you can trust no matter what?

## install

```sh
yarn add @launchql/url-domains
```

### middleware

```js
  import {
    middleware as parseDomains
  } from '@launchql/url-domains';


  app.use(parseDomains());

  app.use(async (req, res, next) => {
    // have fun!
    await fn(req.urlDomains.domain, req.urlDomains.subdomains);
  });
```

### manual usage

```js
  import {
    parseReq
  } from '@launchql/url-domains';

  app.use(async (req, res, next) => {
    const {
        domain,
        subdomains
    } = parseReq(req);

    // cheers!!
    await fn(domain, subdomains);
  });
```