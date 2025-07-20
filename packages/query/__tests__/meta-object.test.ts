import apiMetaSchema from '../__fixtures__/api/meta-schema.json';
import { convertFromMetaSchema,validateMetaObject } from '../src/meta-object';

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
