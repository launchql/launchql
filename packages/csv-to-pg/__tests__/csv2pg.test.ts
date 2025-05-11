// @ts-nocheck
import { parse, parseTypes } from '../src';
import { resolve } from 'path';
import { deparse } from 'pgsql-deparser';
import { InsertOne, InsertMany } from '../src/utils';
import cases from 'jest-in-case';
import * as ast from 'pg-ast';

const zips = resolve(__dirname + '/../__fixtures__/zip.csv');
const withHeaders = resolve(__dirname + '/../__fixtures__/headers.csv');
const withDelimeter = resolve(__dirname + '/../__fixtures__/delimeter.csv');
const forParse = resolve(__dirname + '/../__fixtures__/parse.csv');
const testCase = resolve(__dirname + '/../__fixtures__/test-case.csv');

it('Insert Many', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    headers: ['zip', 'lat', 'lon', 'box'],
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'box'
      },
      location: {
        type: 'location',
        from: ['lon', 'lat']
      }
    }
  };

  const records = await parse(zips, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records
  });

  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert Many Parse', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    headers: ['username', 'profile_pic'],
    fields: {
      username: {
        type: 'text',
        from: 'username'
      },
      profile_pic: {
        type: 'text',
        from: 'profile_pic',
        cast: 'jsonb',
        parse: (text) => {
          if (!text || !/\(([^)]+)\)/.test(text)) return '';
          const url = text.match(/\(([^)]+)\)/)[1];
          const obj = {
            url,
            mime: url.endsWith('png') ? 'image/png' : 'image/jpg'
          };
          return JSON.stringify(obj);
        }
      }
    }
  };

  const records = await parse(forParse, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records
  });

  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert Many Conflict', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    headers: ['zip', 'lat', 'lon', 'box'],
    conflict: ['zip'],
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'box'
      },
      location: {
        type: 'location',
        from: ['lon', 'lat']
      }
    }
  };

  const records = await parse(zips, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records,
    conflict: config.conflict
  });

  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert Many (headers)', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'bbox'
      },
      location: {
        type: 'location',
        from: ['longitude', 'latitude']
      }
    }
  };

  const records = await parse(withHeaders);
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records
  });
  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert Many (delimeter)', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    delimeter: '@',
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'bbox'
      },
      location: {
        type: 'location',
        from: ['longitude', 'latitude']
      }
    }
  };

  const records = await parse(withDelimeter, { separator: config.delimeter });
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records
  });
  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert One', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    headers: ['zip', 'lat', 'lon', 'box'],
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'box'
      },
      location: {
        type: 'location',
        from: ['lon', 'lat']
      }
    }
  };
  const records = await parse(zips, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertOne({
    schema: config.schema,
    table: config.table,
    types,
    record: records[0]
  });

  expect(deparse([stmt])).toMatchSnapshot();
});

it('Insert One Conflict', async () => {
  const config = {
    schema: 'my-schema',
    table: 'my-table',
    headers: ['zip', 'lat', 'lon', 'box'],
    conflict: ['zip'],
    fields: {
      zip: 'int',
      bbox: {
        type: 'bbox',
        from: 'box',
        cast: 'castme'
      },
      location: {
        type: 'location',
        from: ['lon', 'lat']
      }
    }
  };
  const records = await parse(zips, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertOne({
    schema: config.schema,
    table: config.table,
    types,
    record: records[0],
    conflict: config.conflict
  });

  expect(deparse([stmt])).toMatchSnapshot();
});

cases(
  'related',
  async (opts) => {
    const config = {
      schema: 'my-schema',
      table: 'my-table',
      headers: ['zip', 'lat', 'lon', 'box'],
      fields: {
        zip_id: {
          schema: 'schemaa',
          table: 'tablea',
          type: 'related',
          refType: opts.type,
          from: 'zip',
          refKey: 'id',
          refField: 'slug',
          ...opts.extras
        },
        lng: {
          type: 'float',
          from: ['lon']
        },
        lat: {
          type: 'float',
          from: ['lat']
        }
      }
    };
    const records = await parse(zips, { headers: config.headers });
    const types = parseTypes(config);
    const stmt = InsertOne({
      schema: config.schema,
      table: config.table,
      types,
      record: records[0]
    });

    expect(deparse([stmt])).toMatchSnapshot();
  },
  [
    { type: 'int', name: 'int' },
    { type: 'float', name: 'float' },
    { type: 'text', name: 'text' },
    { type: 'citext', name: 'citext' },
    {
      type: 'text',
      name: 'text',
      extras: {
        wrap: ['inflection', 'slugify'],
        cast: 'uuid'
      }
    },
    {
      type: 'int',
      name: 'int',
      extras: {
        wrap: ['mymath', 'round']
      }
    }
  ]
);

cases(
  'wraps',
  async (opts) => {
    const config = {
      schema: 'my-schema',
      table: 'my-table',
      headers: ['zip', 'lat', 'lon', 'box'],
      fields: {
        lng: {
          type: 'float',
          from: ['lon'],
          ...opts.extras
        },
        lat: {
          type: 'float',
          from: ['lat']
        }
      }
    };
    const records = await parse(zips, { headers: config.headers });
    const types = parseTypes(config);
    const stmt = InsertOne({
      schema: config.schema,
      table: config.table,
      types,
      record: records[0]
    });

    expect(deparse([stmt])).toMatchSnapshot();
  },
  [
    {
      extras: {
        wrap: ['inflection', 'slugify']
      }
    },
    {
      extras: {
        wrap: ['modules', 'round'],
        cast: 'real'
      }
    },
    {
      extras: {
        wrapAst: (val) => {
          return ast.FuncCall({
            funcname: [ast.String({ str: 'myfunc' })],
            args: [
              ast.A_Const({ val: ast.String({ str: 'anything' }) }),
              val,
              ast.A_Const({ val: ast.Integer({ ival: '2' }) })
            ]
          });
        }
      }
    }
  ]
);

cases(
  'noschema',
  async (opts) => {
    const config = {
      table: 'my-table',
      headers: ['zip', 'lat', 'lon', 'box'],
      fields: {
        lng: {
          type: 'float',
          from: ['lon'],
          ...opts.extras
        },
        lat: {
          type: 'float',
          from: ['lat']
        }
      }
    };
    const records = await parse(zips, { headers: config.headers });
    const types = parseTypes(config);
    const stmt = InsertOne({
      table: config.table,
      types,
      record: records[0]
    });

    expect(deparse([stmt])).toMatchSnapshot();
  },
  [
    {
      extras: {
        wrap: ['inflection', 'slugify']
      }
    },
    {
      extras: {
        wrap: ['modules', 'round'],
        cast: 'real'
      }
    },
    {
      extras: {
        wrapAst: (val) => {
          return ast.FuncCall({
            funcname: [ast.String({ str: 'myfunc' })],
            args: [
              ast.A_Const({ val: ast.String({ str: 'anything' }) }),
              val,
              ast.A_Const({ val: ast.Integer({ ival: '2' }) })
            ]
          });
        }
      }
    }
  ]
);
