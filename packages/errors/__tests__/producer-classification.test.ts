import { ConstructiveError, parse, toError } from '../src';

describe('producer class provenance', () => {
  const unknownCode = 'ERROR_PROVENANCE_TEST_UNREGISTERED';

  it('records valid DETAIL classes for unknown public and registered public codes overridden as internal', () => {
    const unknownPublic = parse({
      message: 'detail message',
      code: 'P0001',
      detail: JSON.stringify({
        code: unknownCode,
        context: { source: 'detail' },
        class: 'public',
      }),
    });
    const registeredInternal = parse({
      message: 'detail message',
      code: 'P0001',
      detail: JSON.stringify({
        code: 'ACCOUNT_EXISTS',
        context: { source: 'detail' },
        class: 'internal',
      }),
    });

    expect(unknownPublic).toMatchObject({
      code: unknownCode,
      context: { source: 'detail' },
      class: 'public',
      explicitClass: 'public',
      known: false,
    });
    expect(registeredInternal).toMatchObject({
      code: 'ACCOUNT_EXISTS',
      context: { source: 'detail' },
      class: 'internal',
      explicitClass: 'internal',
      known: true,
    });
  });

  it('falls back to registry or internal classification for invalid and missing DETAIL classes', () => {
    const cases = [
      {
        code: 'STORAGE_PROCESSING_CONFLICT',
        detail: { code: 'STORAGE_PROCESSING_CONFLICT', context: {}, class: 'invalid' },
        expectedClass: 'public',
        known: true,
      },
      {
        code: 'STORAGE_PROCESSING_CONFLICT',
        detail: { code: 'STORAGE_PROCESSING_CONFLICT', context: {} },
        expectedClass: 'public',
        known: true,
      },
      {
        code: unknownCode,
        detail: { code: unknownCode, context: {}, class: 'invalid' },
        expectedClass: 'internal',
        known: false,
      },
      {
        code: unknownCode,
        detail: { code: unknownCode, context: {} },
        expectedClass: 'internal',
        known: false,
      },
    ];

    for (const testCase of cases) {
      const result = parse({
        message: testCase.code,
        code: 'P0001',
        detail: JSON.stringify(testCase.detail),
      });

      expect(result.code).toBe(testCase.code);
      expect(result.class).toBe(testCase.expectedClass);
      expect(result.known).toBe(testCase.known);
      expect(result.explicitClass).toBeUndefined();
    }
  });

  it('records direct and wrapped GraphQL producer classes', () => {
    const direct = parse({
      message: 'graphql message',
      extensions: {
        code: 'ACCOUNT_EXISTS',
        context: { source: 'graphql' },
        class: 'internal',
      },
    });
    const wrapped = parse({
      errors: [
        {
          message: 'wrapped graphql message',
          extensions: {
            code: unknownCode,
            context: { source: 'wrapped' },
            class: 'public',
          },
        },
      ],
    });

    expect(direct).toMatchObject({
      code: 'ACCOUNT_EXISTS',
      context: { source: 'graphql' },
      class: 'internal',
      explicitClass: 'internal',
      known: true,
    });
    expect(wrapped).toMatchObject({
      code: unknownCode,
      context: { source: 'wrapped' },
      class: 'public',
      explicitClass: 'public',
      known: false,
    });
  });

  it('omits producer metadata when GraphQL class is missing or invalid', () => {
    for (const classification of [undefined, 'invalid']) {
      const result = parse({
        extensions: { code: 'STORAGE_PROCESSING_CONFLICT', class: classification },
      });
      expect(result.class).toBe('public');
      expect(result).not.toHaveProperty('explicitClass');
    }
  });

  it('keeps DETAIL precedence and does not borrow a GraphQL class when DETAIL omits one', () => {
    const detailWins = parse({
      message: 'detail wins',
      code: 'P0001',
      detail: JSON.stringify({
        code: unknownCode,
        context: { selected: 'detail' },
        class: 'public',
      }),
      extensions: {
        code: 'ACCOUNT_EXISTS',
        context: { selected: 'graphql' },
        class: 'internal',
      },
    });
    const registryFallback = parse({
      message: 'detail class is absent',
      code: 'P0001',
      detail: JSON.stringify({
        code: 'STORAGE_PROCESSING_CONFLICT',
        context: { selected: 'detail' },
      }),
      extensions: {
        code: 'ACCOUNT_EXISTS',
        context: { selected: 'graphql' },
        class: 'internal',
      },
    });

    expect(detailWins).toMatchObject({
      code: unknownCode,
      context: { selected: 'detail' },
      class: 'public',
      explicitClass: 'public',
      known: false,
    });
    expect(registryFallback).toMatchObject({
      code: 'STORAGE_PROCESSING_CONFLICT',
      context: { selected: 'detail' },
      class: 'public',
      known: true,
    });
    expect(registryFallback.explicitClass).toBeUndefined();
  });

  it('treats a canonical instance as the immediate classified producer', () => {
    const canonical = new ConstructiveError({
      code: 'ACCOUNT_EXISTS',
      message: 'canonical message',
      errorClass: 'internal',
      http: 500,
      context: { source: 'canonical' },
    });

    const result = parse(canonical);

    expect(result).toMatchObject({
      code: 'ACCOUNT_EXISTS',
      context: { source: 'canonical' },
      class: 'internal',
      explicitClass: 'internal',
      known: true,
      rawMessage: 'canonical message',
      originalError: canonical,
    });
  });

  it('marks toError output with its own immediate class metadata', () => {
    const raw = {
      message: 'raw producer message',
      code: 'P0001',
      detail: JSON.stringify({ code: 'STORAGE_PROCESSING_CONFLICT', context: { source: 'raw' } }),
    };
    const rawParsed = parse(raw);
    const normalized = toError(raw);
    const normalizedParsed = parse(normalized);

    expect(rawParsed.class).toBe('public');
    expect(rawParsed.explicitClass).toBeUndefined();
    expect(normalizedParsed).toMatchObject({
      code: 'STORAGE_PROCESSING_CONFLICT',
      context: { source: 'raw' },
      class: 'public',
      explicitClass: 'public',
      known: true,
      originalError: normalized,
    });
  });
});
