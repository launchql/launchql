import { parseReq, middleware as parseMiddleware } from '../src';
import cases from 'jest-in-case';

const fixtures = [
  {
    protocol: 'http',
    host: 'www.admin.localhost:8888',
    originalUrl: '/'
  },
  { protocol: 'http', host: 'admin.localhost:8888', originalUrl: '/' },
  { protocol: 'http', host: 'localhost:8888', originalUrl: '/' },
  {
    protocol: 'http',
    host: 'admin.basecrypt.com:8888',
    originalUrl: '/'
  },
  {
    protocol: 'http',
    host: 'admin.web.basecrypt.com:8888',
    originalUrl: '/'
  },
  {
    protocol: 'http',
    host: '127.0.0.1:8888',
    originalUrl: '/graphiql?yo=1'
  },
  {
    protocol: 'http',
    host: 'coolio.webby.localhost:8888',
    originalUrl: '/graphiql?yo=1'
  }
];

cases(
  'parses URLs',
  options => {
    const req = {
      ...options,
      get: () => {
        return options.host;
      }
    };
    // @ts-ignore
    expect(parseReq(req)).toMatchSnapshot();
  },
  fixtures.map(fix => {
    return { ...fix, name: fix.host };
  })
);

cases(
  'parses reqs',
  async options => {
    const req = {
      ...options,
      get: () => {
        return options.host;
      }
    };
    // @ts-ignore
    await parseMiddleware()(req, null, () => {});
    expect(req).toMatchSnapshot();
  },
  fixtures.map(fix => {
    return { ...fix, name: fix.host };
  })
);