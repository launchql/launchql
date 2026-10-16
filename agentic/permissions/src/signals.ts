/**
 * How each signal moves a decision, in one table so a new signal cannot be
 * left out: when it makes a call ask, and whether a grant may cover it. A
 * hard-deny or protected-write target is denied by its zone before this applies.
 */

import type { Signal } from './types';

interface SignalRule {
  /** `always`: in every mode, Full included. `unless-full`: in Ask and Workspace mode. `never`: it only informs the card. */
  asks: 'always' | 'unless-full' | 'never';
  /** A grant may cover a call that raised it; otherwise each such call needs its own yes. */
  grantable: boolean;
}

const ASKS: SignalRule = { asks: 'unless-full', grantable: true };

export const SIGNAL_RULES: Readonly<Record<Signal, SignalRule>> = {
  'secret-file': { asks: 'never', grantable: true },
  'outside-workspace': ASKS,
  'hard-deny': { asks: 'never', grantable: false },
  'protected-write': { asks: 'never', grantable: false },
  'ask-write': ASKS,
  'shell-dynamic': ASKS,
  sudo: ASKS,
  upload: ASKS,
  destructive: ASKS,
  'placeholder-in-command': { asks: 'always', grantable: false },
  'secret-into-plain-file': { asks: 'unless-full', grantable: false },
  'unresolvable-path': { asks: 'always', grantable: false },
  'stdin-operands': ASKS,
  persistence: ASKS,
  'network-exposure': ASKS,
  clipboard: ASKS,
  'secret-transform': ASKS,
  'secret-env-expansion': ASKS
};
