import Ajv from 'ajv';
import format from './format.json';

export function validateMetaObject(obj) {
  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(format, obj);
  if (valid) return valid;

  return {
    errors: ajv.errors
  };
}
