import { cleanEnv, makeValidator } from 'envalid';

const commaSeparatedArray = makeValidator<string[]>((value) => {
  if (typeof value !== 'string') {
    throw new Error('Expected a comma separated string');
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
});

export const env = cleanEnv(process.env, {
  ACCEPTED_LANGUAGES: commaSeparatedArray({ default: ['en', 'es'] })
});

export type I18nEnv = typeof env;

export default env;
