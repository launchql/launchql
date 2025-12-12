import { getConnections, PgTestClient } from 'pgsql-test';

const validUrls = [
  'http://foo.com/blah_blah',
  'http://foo.com/blah_blah/',
  'http://foo.com/blah_blah_(wikipedia)',
  'http://foo.com/blah_blah_(wikipedia)_(again)',
  'http://www.example.com/wpstyle/?p=364',
  'https://www.example.com/foo/?bar=baz&inga=42&quux',
  'http://✪df.ws/123',
  'http://foo.com/blah_(wikipedia)#cite-1',
  'http://foo.com/blah_(wikipedia)_blah#cite-1',
  'http://foo.com/(something)?after=parens',
  'http://code.google.com/events/#&product=browser',
  'http://j.mp',
  'http://foo.bar/?q=Test%20URL-encoded%20stuff',
  'http://مثال.إختبار',
  'http://例子.测试',
  'http://उदाहरण.परीक्षा',
  "http://-.~_!$&'()*+,;=:%40:80%2f::::::@example.com",
  'http://1337.net',
  'http://a.b-c.de',
  'https://foo_bar.example.com/'
];

const invalidUrls = [
  'http://##',
  'http://##/',
  'http://foo.bar?q=Spaces should be encoded',
  '//',
  '//a',
  '///a',
  '///',
  'http:///a',
  'foo.com',
  'rdar://1234',
  'h://test',
  'http:// shouldfail.com',
  ':// should fail',
  'http://foo.bar/foo(bar)baz quux',
  'ftps://foo.bar/',
  'http://.www.foo.bar/',
  'http://.www.foo.bar./'
];

const validAttachments = [
  'http://www.foo.bar/some.jpg',
  'https://foo.bar/some.PNG'
];

const invalidAttachments = [
  'hi there',
  'ftp://foo.bar/some.png',
  'https:///foo.bar/some.png'
];

const validImages = [
  { url: 'http://www.foo.bar/some.jpg', mime: 'image/jpg' },
  { url: 'https://foo.bar/some.PNG', mime: 'image/jpg' }
];

const invalidImages = [
  { url: 'hi there' },
  { url: 'https://foo.bar/some.png' }
];

const validUploads = [
  { url: 'http://www.foo.bar/some.jpg', mime: 'image/jpg' },
  { url: 'https://foo.bar/some.PNG', mime: 'image/png' }
];

const invalidUploads = [
  { url: 'hi there' },
  { url: 'https://foo.bar/some.png' },
  { url: 'ftp://foo.bar/some.png', mime: 'image/png' }
];

let pg: PgTestClient;
let teardown:  () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

beforeAll(async () => {
  await pg.any(`
CREATE TABLE customers (
  id serial,
  url url,
  image image,
  attachment attachment,
  domain hostname,
  email email,
  upload upload
);
  `);
});

beforeEach(async () => {
  await pg.beforeEach();
});

afterEach(async () => {
  await pg.afterEach();
});

afterAll(async () => {
  await teardown();
});

describe('types', () => {
  it('valid attachment and image', async () => {
    for (const attachment of validAttachments) {
      await pg.any(`INSERT INTO customers (attachment) VALUES ($1);`, [attachment]);
    }

    for (const image of validImages) {
      await pg.any(`INSERT INTO customers (image) VALUES ($1::json);`, [image]);
    }
  });

  it('invalid attachment and image', async () => {
    for (const attachment of invalidAttachments) {
      let failed = false;
      try {
        await pg.any(`INSERT INTO customers (attachment) VALUES ($1);`, [attachment]);
      } catch (e) {
        failed = true;
      }
      expect(failed).toBe(true);
    }

    for (const image of invalidImages) {
      let failed = false;
      try {
        await pg.any(`INSERT INTO customers (image) VALUES ($1::json);`, [image]);
      } catch (e) {
        failed = true;
      }
      expect(failed).toBe(true);
    }
  });

  it('valid upload', async () => {
    for (const upload of validUploads) {
      await pg.any(`INSERT INTO customers (upload) VALUES ($1::json);`, [upload]);
    }
  });

  it('invalid upload', async () => {
    for (const upload of invalidUploads) {
      let failed = false;
      try {
        await pg.any(`INSERT INTO customers (upload) VALUES ($1::json);`, [upload]);
      } catch (e) {
        failed = true;
      }
      expect(failed).toBe(true);
    }
  });

  it('valid url', async () => {
    for (const value of validUrls) {
      await pg.any(`INSERT INTO customers (url) VALUES ($1);`, [value]);
    }
  });

  it('invalid url', async () => {
    for (const value of invalidUrls) {
      let failed = false;
      try {
        await pg.any(`INSERT INTO customers (url) VALUES ($1);`, [value]);
      } catch (e) {
        failed = true;
      }
      expect(failed).toBe(true);
    }
  });

  it('email', async () => {
    await pg.any(`
    INSERT INTO customers (email) VALUES
    ('d@google.com'),
    ('d@google.in'),
    ('d@google.in'),
    ('d@www.google.in'),
    ('d@google.io'),
    ('dan@google.some.other.com')`);
  });

  it('not email', async () => {
    let failed = false;
    try {
      await pg.any(`
      INSERT INTO customers (email) VALUES
      ('http://google.some.other.com')`);
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it('hostname', async () => {
    await pg.any(`
    INSERT INTO customers (domain) VALUES
    ('google.com'),
    ('google.in'),
    ('google.in'),
    ('www.google.in'),
    ('google.io'),
    ('google.some.other.com')`);
  });

  it('not hostname', async () => {
    let failed = false;
    try {
      await pg.any(`
      INSERT INTO customers (domain) VALUES
      ('http://google.some.other.com')`);
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it('not hostname 2', async () => {
    let failed = false;
    try {
      await pg.any(`
      INSERT INTO customers (domain) VALUES
      ('google.some.other.com/a/b/d')`);
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });
});
