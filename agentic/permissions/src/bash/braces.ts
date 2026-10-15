/** Brace expansion (`{a,b}`, `{1..3}`) on the unquoted parts of a word. */

const MAX_BRACE_RESULTS = 256;

/** Expand `{a,b}` and `{1..3}` in the unquoted parts of a word. */
export function expandBraces(text: string, mask: boolean[], out: { text: string; mask: boolean[] }[]): void {
  if (out.length >= MAX_BRACE_RESULTS) return;
  for (let open = 0; open < text.length; open++) {
    if (text[open] !== '{' || !mask[open]) continue;
    let depth = 0;
    const commas: number[] = [];
    let close = -1;
    for (let j = open; j < text.length; j++) {
      if (!mask[j]) continue;
      if (text[j] === '{') depth++;
      else if (text[j] === '}') {
        depth--;
        if (depth === 0) {
          close = j;
          break;
        }
      } else if (text[j] === ',' && depth === 1) commas.push(j);
    }
    if (close < 0) return void out.push({ text, mask });
    const pre = text.slice(0, open);
    const preMask = mask.slice(0, open);
    const post = text.slice(close + 1);
    const postMask = mask.slice(close + 1);
    let alternatives: { text: string; mask: boolean[] }[] = [];
    if (commas.length > 0) {
      const bounds = [open, ...commas, close];
      for (let k = 0; k < bounds.length - 1; k++) {
        alternatives.push({
          text: text.slice(bounds[k] + 1, bounds[k + 1]),
          mask: mask.slice(bounds[k] + 1, bounds[k + 1])
        });
      }
    } else {
      const seq = /^(-?\d+|[A-Za-z])\.\.(-?\d+|[A-Za-z])(?:\.\.(-?\d+))?$/.exec(text.slice(open + 1, close));
      if (!seq) continue;
      alternatives = sequence(seq[1], seq[2], seq[3]).map((t) => ({ text: t, mask: [...t].map(() => true) }));
    }
    for (const alt of alternatives) {
      expandBraces(pre + alt.text + post, [...preMask, ...alt.mask, ...postMask], out);
    }
    return;
  }
  out.push({ text, mask });
}

function sequence(from: string, to: string, step?: string): string[] {
  const numeric = /^-?\d+$/.test(from) && /^-?\d+$/.test(to);
  const a = numeric ? Number(from) : from.charCodeAt(0);
  const b = numeric ? Number(to) : to.charCodeAt(0);
  const inc = Math.max(1, Math.abs(Number(step ?? 1)));
  const out: string[] = [];
  for (let v = a; a <= b ? v <= b : v >= b; v += a <= b ? inc : -inc) {
    out.push(numeric ? String(v) : String.fromCharCode(v));
    if (out.length >= MAX_BRACE_RESULTS) break;
  }
  return out;
}
