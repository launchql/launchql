import metaObject from '../__fixtures__/meta-simple.json';
import apiMetaSchema from '../__fixtures__/api/meta-schema.json';
import { validateMetaObject, convertFromMetaSchema } from '../src/meta-object';

let meta;

describe('validateMetaObject()', () => {
  beforeEach(() => {
    meta = metaObject;
  });

  it('returns true for valid meta object', () => {
    expect(validateMetaObject(meta)).toBe(true);
  });

  it('returns errors for invalid meta object', () => {
    const invalidMeta = {
      tables: {
        name: 'User',
        fields: [
          {
            // Lacks a required attribute
            // name: 'id',
            type: 'uuid'
          },
          {
            name: 'full_name',
            type: 'varchar'
          },
          {
            name: 'created_at',
            type: 'timestamptz'
          },
          {
            name: 'country_code',
            type: 'int'
          }
        ],
        primaryConstraints: [
          {
            name: 'id',
            type: 'uuid'
          }
        ]
      }
    };

    expect(validateMetaObject(invalidMeta).errors).toBeTruthy();
  });
});

describe('convertFromMetaSchema()', () => {
  it('should convert from meta schema to meta object format', () => {
    const metaObj = convertFromMetaSchema(apiMetaSchema);
    const validate = validateMetaObject(metaObj);
    expect(validate).toBe(true);
  });

  it('matches snapshot', () => {
    expect(convertFromMetaSchema(apiMetaSchema)).toMatchSnapshot();
  });
});
