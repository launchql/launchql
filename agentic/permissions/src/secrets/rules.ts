/**
 * Which values are secret: the key-name rule, the vendor token shapes, and the
 * local-dev defaults that are not worth hiding.
 */

export const MIN_SECRET_LENGTH = 8;

/** Env keys whose values are secret. `DATABASE_ID`, `OWNER_ID` do not match. */
export const SECRET_KEY_PATTERN = /(KEY|SECRET|TOKEN|PASSWORD|PASS|AUTH|CREDENTIAL|PRIVATE|DSN|DATABASE_URL)(_|$)/i;

const B = '(?<![A-Za-z0-9_-])';
const E = '(?![A-Za-z0-9_-])';

/**
 * Vendor token shapes (oh-my-pi `secrets/patterns.ts`). Group 1, when present,
 * is the secret part. `hints`: lowercase text one of which every match holds,
 * so a scan skips a shape whose hints are not in the text.
 */
export const TOKEN_SHAPES: readonly { name: string; source: string; flags?: string; hints: readonly string[] }[] = [
  {
    name: 'Credential',
    source:
      '(?<![a-zA-Z0-9_*-])(gh[opusr]_[a-zA-Z0-9_]{36,}|github_pat_[a-zA-Z0-9_]{36,}|glpat-[a-zA-Z0-9_-]{20,}|sk-proj-[a-zA-Z0-9_-]{36,}|sk-ant-[a-zA-Z0-9_-]{36,}|sk-[a-zA-Z0-9_-]{48,})(?![a-zA-Z0-9_*-])',
    hints: ['gh', 'glpat-', 'sk-']
  },
  { name: 'AWSAccessKey', source: `${B}(?:AKIA|ASIA)[A-Z0-9]{16}${E}`, hints: ['akia', 'asia'] },
  { name: 'GoogleAPIKey', source: `${B}AIza[A-Za-z0-9_-]{30,}${E}`, hints: ['aiza'] },
  { name: 'SlackToken', source: `${B}xox[abprs]-[A-Za-z0-9-]{10,}${E}`, hints: ['xox'] },
  { name: 'NpmToken', source: `${B}npm_[A-Za-z0-9]{30,}${E}`, hints: ['npm_'] },
  { name: 'StripeKey', source: `${B}(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}${E}`, hints: ['_live_', '_test_'] },
  { name: 'StripeWebhookSecret', source: `${B}whsec_[A-Za-z0-9]{20,}${E}`, hints: ['whsec_'] },
  { name: 'HuggingFaceToken', source: `${B}hf_[A-Za-z0-9]{30,}${E}`, hints: ['hf_'] },
  { name: 'SendGridKey', source: `${B}SG\\.[A-Za-z0-9_-]{22}\\.[A-Za-z0-9_-]{43}${E}`, hints: ['sg.'] },
  { name: 'JWT', source: `${B}eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}${E}`, hints: ['eyj'] },
  { name: 'BearerToken', source: '\\bBearer ([A-Za-z0-9._~+/=-]{20,})(?![A-Za-z0-9_-])', flags: 'i', hints: ['bearer '] },
  {
    name: 'PrivateKey',
    source: '-----BEGIN [A-Z ]*PRIVATE KEY-----[\\s\\S]*?-----END [A-Z ]*PRIVATE KEY-----',
    hints: ['-----begin']
  },
  { name: 'UrlPassword', source: '\\b[a-z][a-z0-9+.-]*://[^\\s/:@?#]*:([^\\s/@?#]+)@', flags: 'i', hints: ['://'] }
];

/** The shapes compiled once, to test a whole value. */
export const TOKEN_SHAPE_RES: readonly { name: string; re: RegExp }[] = TOKEN_SHAPES.map((shape) => ({
  name: shape.name,
  re: new RegExp(shape.source, shape.flags)
}));

/** The shapes compiled once to scan a text. `matchAll` copies a global regex, so no `lastIndex` state leaks. */
export const TOKEN_SHAPE_SCANNERS: readonly { name: string; re: RegExp; hints: readonly string[] }[] = TOKEN_SHAPES.map(
  (shape) => ({ name: shape.name, re: new RegExp(shape.source, `${shape.flags ?? ''}g`), hints: shape.hints })
);

/** A value that is a URL with a password (`postgres://app:pw@host`); group 1 is the password. */
const URL_WITH_PASSWORD = /^[a-z][a-z0-9+.-]*:\/\/[^\s/:@?#]*:([^\s/@?#]+)@/i;

/** The password of a URL value, if it has one. */
export function urlPasswordOf(value: string): string | undefined {
  return URL_WITH_PASSWORD.exec(value)?.[1];
}

/** Common local-dev defaults: redacting them would garble ordinary source text. */
const TRIVIAL_VALUES = new Set([
  'password',
  'postgres',
  'changeme',
  'change_me',
  'change-me',
  'development',
  'production',
  'localhost',
  'undefined',
  'placeholder',
  'username',
  'example',
  'testtest',
  'password1',
  'secret123',
  'mysecret',
  'supersecret'
]);

export function isTrivial(value: string): boolean {
  const v = value.trim();
  if (v.length < MIN_SECRET_LENGTH) return true;
  if (TRIVIAL_VALUES.has(v.toLowerCase())) return true;
  if (/^(.)\1*$/.test(v)) return true;
  if (/^\$\{[^}]*\}$|^<[^>]*>$|^your[-_]/i.test(v)) return true;
  if (/^(true|false|\d+)$/i.test(v)) return true;
  return false;
}

function matchesTokenShape(value: string): boolean {
  return TOKEN_SHAPE_RES.some(({ name, re }) => name !== 'UrlPassword' && re.test(value));
}

/** A URL with no password in it is an address, not a secret. */
function isPlainUrl(value: string): boolean {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) && urlPasswordOf(value) === undefined;
}

/** The vault rule for one `KEY=value` pair. */
export function isSecretEntry(key: string, value: string): boolean {
  if (value.trim().length < MIN_SECRET_LENGTH) return false;
  if (matchesTokenShape(value)) return true;
  if (!SECRET_KEY_PATTERN.test(key)) return false;
  return !isTrivial(value) && !isPlainUrl(value);
}
