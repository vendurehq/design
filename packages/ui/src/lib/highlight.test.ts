import { describe, expect, test } from 'bun:test';

import {
  NOTATION_TRANSFORMER_LANGUAGES,
  normalizeLanguage,
  supportsNotationComments,
} from './highlight.ts';

describe('NOTATION_TRANSFORMER_LANGUAGES', () => {
  test('every language in the set has its own grammar loader', () => {
    for (const language of NOTATION_TRANSFORMER_LANGUAGES) {
      // normalizeLanguage falls back to 'ini' when no grammar is bundled, so a
      // drifted entry would not round-trip to itself.
      expect(normalizeLanguage(language)).toBe(language);
    }
  });

  test("the 'ini' fallback grammar never claims notation support", () => {
    expect(NOTATION_TRANSFORMER_LANGUAGES.has('ini')).toBe(false);
  });
});

describe('supportsNotationComments', () => {
  test('aliases qualify through their canonical grammar', () => {
    for (const alias of ['js', 'ts', 'py', 'sh', 'shell', 'yml']) {
      expect(supportsNotationComments(alias)).toBe(true);
    }
  });

  test('languages without a bundled grammar do not qualify', () => {
    // These previously claimed transformer support but fall back to the 'ini'
    // grammar, which would render `// [!code ...]` comments as literal text.
    const unsupported = [
      'java',
      'c',
      'cpp',
      'csharp',
      'go',
      'rust',
      'swift',
      'kotlin',
      'scala',
      'php',
      'ruby',
      'zsh',
    ];
    for (const language of unsupported) {
      expect(supportsNotationComments(language)).toBe(false);
    }
  });

  test('grammars without notation-comment syntax do not qualify', () => {
    for (const language of ['json', 'html', 'css', 'text', undefined]) {
      expect(supportsNotationComments(language)).toBe(false);
    }
  });
});
