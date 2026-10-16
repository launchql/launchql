import type { Signal } from './types';

/** The signals raised for one call, keeping the first and most specific sentence for each. */
export class Findings {
  readonly signals = new Set<Signal>();
  readonly reasons: Partial<Record<Signal, string>> = {};

  flag(signal: Signal, reason: string): void {
    this.signals.add(signal);
    this.reasons[signal] ??= reason;
  }
}
