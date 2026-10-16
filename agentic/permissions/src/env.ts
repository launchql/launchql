/**
 * The environment a shell command gets. A host process inherits the user's
 * shell environment, with provider keys and tokens in it; a command that
 * expands one can send it out without the model ever seeing the value. The
 * host passes the environment of each command through `scrubEnv`.
 */

import { SECRET_KEY_PATTERN, TOKEN_SHAPE_RES } from './secrets';

/** A path is an address, not a secret (`SSH_AUTH_SOCK`, `*_KEY_FILE`). */
const isPath = (value: string): boolean => value.startsWith('/') && !/\s/.test(value);

/**
 * Variables that change how the shell itself behaves before the command runs:
 * a startup script it loads, or a search path that sends a relative `cd`
 * somewhere the analyzer cannot see.
 */
const SHELL_STARTUP = new Set(['BASH_ENV', 'ENV', 'CDPATH']);

/**
 * A copy of `env` without the variables that hold a secret: a name that looks
 * secret (the vault's key rule), whatever the value's length, unless the value
 * is a path; or a value with a token shape, a URL password included. The
 * shell startup variables go too.
 */
export function scrubEnv(env: Readonly<Record<string, string | undefined>>): Record<string, string> {
  const kept: Record<string, string> = {};
  for (const [name, value] of Object.entries(env)) {
    if (value === undefined || SHELL_STARTUP.has(name)) continue;
    if (SECRET_KEY_PATTERN.test(name) && !isPath(value)) continue;
    if (TOKEN_SHAPE_RES.some(({ re }) => re.test(value))) continue;
    kept[name] = value;
  }
  return kept;
}
