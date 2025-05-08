import { getConnections } from './utils';

let db, dbs, teardown;
const objs = {
  tables: {}
};

beforeAll(async () => {
  ({ db, teardown } = await getConnections());
  dbs = db.helper('faker');
});

afterAll(async () => {
  try {
    //try catch here allows us to see the sql parsing issues!
    // await teardown();
  } catch (e) {
    // noop
  }
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

it('gets random words', async () => {
  const obj = {};
  const types = [
    // 'word',
    // 'sentence',
    // 'paragraph',
    // 'email',
    // 'integer',
    // 'float',
    // 'timestamptz',
    // 'date',
    // 'interval',
    // 'image',
    // 'image_mime',
    // 'mime',
    // 'uuid',
    // 'token',
    // 'password',
    // 'hostname',
    // 'upload',
    // 'username',
    // 'gender',
    // 'name',
    // 'surname',
    // 'fullname',
    // 'phone',
    // 'street',
    'lnglat',
    'address',
    'state',
    'city',
    'file',
    'tags',
    'attachment',
    'birthdate',
    'profilepic'
    // 'ext',
    // 'ip',
    // 'business'
  ];
  for (const t of types) {
    obj[t] = await dbs.callOne(t);
  }
  console.log(obj);
});

it('lnglat', async () => {
  const obj = {};
  obj['lnglat'] = await dbs.callOne('lnglat', {});
  obj['bbox'] = await dbs.callOne(
    'lnglat',
    {
      x1: -118.561721,
      y1: 33.59,
      x2: -117.646374,
      y2: 34.23302 // tighter to LA (from north towards LA)
      // y2: 34.823302 // goes further north
    },
    {
      x1: 'float',
      y1: 'float',
      x2: 'float',
      y2: 'float'
    }
  );
  console.log(obj);
  console.log(obj.bbox.y, ',', obj.bbox.x);
});
it('tags', async () => {
  const obj = {};
  obj['tags'] = await dbs.callOne('tags', {});
  obj['tag with min'] = await dbs.callOne('tags', {
    min: 5,
    max: 10,
    dict: 'tag'
  });
  obj['face'] = await dbs.callOne('tags', {
    min: 5,
    max: 10,
    dict: 'face'
  });
  console.log(obj);
});
it('addresses', async () => {
  const obj = {};
  obj['any'] = await dbs.callOne('address', {});
  obj['CA'] = await dbs.callOne('address', {
    state: 'CA'
  });
  obj['MI'] = await dbs.callOne('address', {
    state: 'MI'
  });
  obj['Los Angeles'] = await dbs.callOne('address', {
    state: 'CA',
    city: 'Los Angeles'
  });
  console.log(obj);
});
xit('mixed words and args', async () => {
  const obj = {};
  obj['english-words'] = await dbs.callOne('sentence', {
    unit: 'word',
    min: 7,
    max: 20,
    cat: ['colors']
  });
  obj['mixed-words'] = await dbs.callOne('sentence', {
    unit: 'word',
    min: 7,
    max: 20,
    cat: ['colors', 'adjectives', 'surname', 'animals', 'stop', 'stop', 'stop']
  });
  obj['sentence-words'] = await dbs.callOne('sentence', {
    unit: 'word',
    min: 7,
    max: 20,
    cat: ['lorem']
  });
  obj['sentence-chars'] = await dbs.callOne('sentence', {
    unit: 'char',
    min: 100,
    max: 140,
    cat: ['lorem']
  });
  obj['paragraph-chars'] = await dbs.callOne('paragraph', {
    unit: 'char',
    min: 300,
    max: 500,
    cat: ['lorem']
  });
  obj['integer-chars'] = await dbs.callOne('integer', {
    min: 300,
    max: 500
  });
  obj['xenial'] = await dbs.callOne('birthdate', {
    min: 34,
    max: 39
  });
  console.log(obj);
});

// it('businesses', async () => {
//   for (let i = 0; i < 20; i++) {
//     const biz = await dbs.callOne('business');
//     console.log(biz);
//   }
// });

// it('cities', async () => {
//   for (let i = 0; i < 20; i++) {
//     const city = await dbs.callOne('city');
//     console.log(city);
//     const city2 = await dbs.callOne('city', {
//       state: 'MI'
//     });
//     console.log(city2);
//     const zip = await dbs.callOne('zip');
//     console.log(zip);
//     const zip2 = await dbs.callOne('zip', {
//       city: 'Los Angeles'
//     });
//     console.log(zip2);
//   }
// });
