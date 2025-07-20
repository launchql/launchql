import Ajv from 'ajv';

import format from './format.json';

export function validateMetaObject(obj: any) {
  const ajv = new Ajv({ allErrors: true });
  const valid = ajv.validate(format, obj);

  if (valid) return true;

  return {
    errors: ajv.errors,
    message: ajv.errorsText(ajv.errors, { separator: '\n' })
  };
}
