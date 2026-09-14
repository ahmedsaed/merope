/**
 * Typographic punctuation for text that never reaches the MDX pipeline.
 *
 * Note bodies go through `remark-smartypants`, so their quotes and dashes come
 * out right. Frontmatter does not — and frontmatter is where the title, the
 * standfirst, every catalogue summary and every meta description live. The
 * result was a page whose body had real apostrophes and whose standfirst,
 * directly above it, had typewriter ones.
 *
 * This is deliberately much smaller than smartypants. It handles the four
 * substitutions that actually occur in a sentence of English prose and leaves
 * everything else alone, because frontmatter is one line of prose rather than a
 * document, and a clever transform has more ways to be wrong than right.
 *
 * Applied in `content/schema.ts`, so no surface has to remember to call it.
 */

/** A character that can precede an opening quote. */
const OPENS_AFTER = /[\s([{—–-]/;

export function typeset(input: string): string {
  let out = '';

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const prev = i === 0 ? '' : input[i - 1];

    if (char === "'") {
      // An apostrophe is overwhelmingly the common case in a title, so the
      // opening single quote has to be the one that argues for itself: it can
      // only appear at the very start or after a space or an opening bracket.
      out += i === 0 || OPENS_AFTER.test(prev) ? '‘' : '’';
      continue;
    }

    if (char === '"') {
      out += i === 0 || OPENS_AFTER.test(prev) ? '“' : '”';
      continue;
    }

    if (char === '.' && input.startsWith('...', i)) {
      out += '…';
      i += 2;
      continue;
    }

    if (char === '-' && input.startsWith('---', i)) {
      out += '—';
      i += 2;
      continue;
    }

    if (char === '-' && input.startsWith('--', i)) {
      out += '–';
      i += 1;
      continue;
    }

    out += char;
  }

  return out;
}
