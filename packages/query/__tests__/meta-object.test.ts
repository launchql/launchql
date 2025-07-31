import apimythirdapp from '../__fixtures__/api/meta-schema.json';
import { convertFrommythirdapp,validateMetaObject } from '../src/meta-object';

describe('convertFrommythirdapp()', () => {
  it('should convert from meta schema to meta object format', () => {
    const metaObj = convertFrommythirdapp(apimythirdapp);
    const validate = validateMetaObject(metaObj);
    expect(validate).toBe(true);
  });

  it('matches snapshot', () => {
    expect(convertFrommythirdapp(apimythirdapp)).toMatchSnapshot();
  });
});
