# url domains

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