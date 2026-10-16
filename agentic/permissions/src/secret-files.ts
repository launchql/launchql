/**
 * Files that hold credentials, by name (from the oh-my-pi jfind list). Reading
 * one is allowed, because the output is redacted; writing one gets the real
 * values restored; and their values feed the secret vault.
 */

import * as path from 'node:path';

export const SECRET_FILE_NAMES: readonly string[] = [
  '.env',
  '.envrc',
  '.netrc',
  '.npmrc',
  '.pypirc',
  '.pgpass',
  '.boto',
  '.s3cfg',
  '.dockercfg',
  '.git-credentials',
  '.htpasswd',
  'credentials',
  'credentials.json',
  'client_secret.json',
  'service-account.json',
  'id_rsa',
  'id_dsa',
  'id_ecdsa',
  'id_ed25519'
];

/** Committed `.env` templates: not secret. */
export const ENV_TEMPLATE_NAMES: readonly string[] = ['.env.example', '.env.sample', '.env.template', '.env.dist'];

export const SECRET_FILE_EXTENSIONS: readonly string[] = [
  'pem',
  'key',
  'p12',
  'pfx',
  'jks',
  'keystore',
  'bks',
  'ppk',
  'kdbx',
  'gpg',
  'pgp',
  'asc',
  'tfvars',
  'tfvars.json',
  'tfstate',
  'tfstate.backup'
];

const NAMES = new Set(SECRET_FILE_NAMES);
const TEMPLATES = new Set(ENV_TEMPLATE_NAMES);

/** The base name is a secret file. Case-insensitive (`.ENV` opens `.env` on macOS). */
export function isSecretFileName(name: string): boolean {
  const lower = name.toLowerCase();
  if (NAMES.has(lower)) return true;
  if (lower.startsWith('.env.')) return !TEMPLATES.has(lower);
  return SECRET_FILE_EXTENSIONS.some((ext) => lower.length > ext.length + 1 && lower.endsWith(`.${ext}`));
}

export function isSecretFile(p: string): boolean {
  return isSecretFileName(path.basename(p));
}

/** `.env`, `.env.*` (not a template) or `.envrc`: parsed as dotenv for the vault. */
export function isEnvFileName(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === '.env' || lower === '.envrc') return true;
  return lower.startsWith('.env.') && !TEMPLATES.has(lower);
}

/** A glob (grep `glob`, find `pattern`) that names secret files: `.env*`, `*.pem`. */
export function globNamesSecretFiles(glob: string): boolean {
  const names = glob
    .split(/[{},/]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return names.some((name) => {
    const lower = name.toLowerCase();
    if (lower === '*' || lower === '**') return false;
    if (/^\.env(\*|\..*)?$/.test(lower) && !TEMPLATES.has(lower)) return true;
    const literal = lower.replace(/\*/g, 'x');
    return isSecretFileName(literal);
  });
}
