import { allCodes, classify, ConstructiveError, errors, format, parse, registerCatalog, toError } from '../src';
import {
  GENERATED_CODE_COUNT,
  GENERATED_CODE_META,
  generatedRegistry
} from '../src/generated/registry.generated';

describe('parse', () => {
  it('parses a bare ALL_CAPS DB message (legacy RAISE)', () => {
    const result = parse({ message: 'ACCOUNT_EXISTS', code: 'P0001' });
    expect(result.code).toBe('ACCOUNT_EXISTS');
    expect(result.class).toBe('public');
    expect(result.known).toBe(true);
  });

  it('recovers positional args from a dynamic DB message', () => {
    const result = parse({ message: 'LIMIT_REACHED (api_keys, 5)', code: 'P0001' });
    expect(result.code).toBe('LIMIT_REACHED');
    expect(result.context).toEqual({ resource: 'api_keys', limit: 5 });
  });

  it('prefers structured DETAIL json over the message', () => {
    const result = parse({
      message: 'ACCOUNT_EXISTS',
      code: 'CX001',
      detail: '{"code":"ACCOUNT_EXISTS","context":{"email":"a@b.com"}}'
    });
    expect(result.code).toBe('ACCOUNT_EXISTS');
    expect(result.context).toEqual({ email: 'a@b.com' });
  });

  it('reads GraphQL extensions.code', () => {
    const result = parse({ message: 'nope', extensions: { code: 'FORBIDDEN' } });
    expect(result.code).toBe('FORBIDDEN');
    expect(result.class).toBe('public');
  });

  it('unwraps a GraphQL { errors: [...] } request wrapper', () => {
    const result = parse({ errors: [{ message: 'ACCOUNT_EXISTS' }] });
    expect(result.code).toBe('ACCOUNT_EXISTS');
  });

  it('maps native SQLSTATE constraint violations', () => {
    const result = parse({ message: 'duplicate key', code: '23505', constraint: 'users_email_key' });
    expect(result.code).toBe('UNIQUE_VIOLATION');
    expect(result.context.constraint).toBe('users_email_key');
  });

  it('maps an insufficient-privilege SQLSTATE to FORBIDDEN', () => {
    const result = parse({ message: 'permission denied for table agent_thread', code: '42501', table: 'agent_thread' });
    expect(result.code).toBe('FORBIDDEN');
    expect(result.class).toBe('public');
    expect(result.context.table).toBe('agent_thread');
  });

  it('classifies unknown codes as internal', () => {
    const result = parse({ message: 'DATA_INVARIANT_BROKEN', code: 'P0001' });
    expect(result.code).toBe('DATA_INVARIANT_BROKEN');
    expect(result.known).toBe(false);
    expect(result.class).toBe('internal');
  });

  it('treats a bare P0001 with no semantic token as unknown', () => {
    const result = parse({ message: 'some free text', code: 'P0001' });
    expect(result.code).toBeNull();
    expect(result.class).toBe('internal');
  });

  it('round-trips a ConstructiveError', () => {
    const err = errors.ACCOUNT_EXISTS();
    const result = parse(err);
    expect(result.code).toBe('ACCOUNT_EXISTS');
    expect(result.class).toBe('public');
  });

  it('trusts an explicit DETAIL.class over the registry (unregistered code)', () => {
    // A brand-new code the registry has never seen, marked public by the DB.
    const result = parse({
      message: 'SHINY_NEW_CODE',
      code: 'P0001',
      detail: '{"code":"SHINY_NEW_CODE","context":{},"class":"public"}'
    });
    expect(result.code).toBe('SHINY_NEW_CODE');
    expect(result.known).toBe(false);
    // registry alone would fail-safe to internal; the DB's class wins.
    expect(result.class).toBe('public');
  });

  it('trusts DETAIL.class=internal even for a registry-public code', () => {
    const result = parse({
      message: 'ACCOUNT_EXISTS',
      code: 'P0001',
      detail: '{"code":"ACCOUNT_EXISTS","context":{},"class":"internal"}'
    });
    expect(result.code).toBe('ACCOUNT_EXISTS');
    expect(result.class).toBe('internal');
  });

  it('trusts GraphQL extensions.class when present', () => {
    const result = parse({
      message: 'nope',
      extensions: { code: 'SOME_UNKNOWN_CODE', class: 'public' }
    });
    expect(result.code).toBe('SOME_UNKNOWN_CODE');
    expect(result.class).toBe('public');
  });

  it('ignores an invalid class value and falls back to the registry', () => {
    const result = parse({
      message: 'ACCOUNT_EXISTS',
      code: 'P0001',
      detail: '{"code":"ACCOUNT_EXISTS","context":{},"class":"bogus"}'
    });
    expect(result.class).toBe('public');
  });
});

describe('toError', () => {
  it('normalizes a DB error into a ConstructiveError with formatted copy', () => {
    const err = toError({
      message: 'ACCOUNT_EXISTS',
      code: 'P0001',
      detail: '{"code":"ACCOUNT_EXISTS","context":{"email":"a@b.com"}}'
    });
    expect(err).toBeInstanceOf(ConstructiveError);
    expect(err.code).toBe('ACCOUNT_EXISTS');
    expect(err.errorClass).toBe('public');
    expect(err.http).toBe(409);
    expect(err.context).toEqual({ email: 'a@b.com' });
    expect(err.message).toBe(
      'An account with this email already exists. Please sign in or use a different email.'
    );
  });

  it('falls back to UNKNOWN_ERROR and the raw message for unresolved errors', () => {
    const err = toError(new Error('totally opaque failure'));
    expect(err.code).toBe('UNKNOWN_ERROR');
    expect(err.errorClass).toBe('internal');
    expect(err.message).toBe('totally opaque failure');
  });

  it('returns a ConstructiveError unchanged', () => {
    const original = errors.ACCOUNT_EXISTS();
    expect(toError(original)).toBe(original);
  });
});

describe('classify', () => {
  it('is internal for null/unknown', () => {
    expect(classify(null)).toBe('internal');
    expect(classify('NOT_A_REAL_CODE')).toBe('internal');
  });
});

describe('errors factory', () => {
  it('builds a typed ConstructiveError', () => {
    const err = errors.MODULE_NOT_FOUND({ name: 'auth' });
    expect(err).toBeInstanceOf(ConstructiveError);
    expect(err.code).toBe('MODULE_NOT_FOUND');
    expect(err.message).toBe('Module "auth" not found in modules list.');
    expect(err.http).toBe(404);
  });

  it('supports an override message', () => {
    const err = errors.MODULE_NOT_FOUND({ name: 'auth' }, 'custom');
    expect(err.message).toBe('custom');
  });

  it('exposes GraphQL extensions', () => {
    const err = errors.LIMIT_REACHED({ resource: 'api_keys', limit: 5 });
    expect(err.toExtensions()).toMatchObject({
      code: 'LIMIT_REACHED',
      class: 'public',
      context: { resource: 'api_keys', limit: 5 }
    });
  });
});

describe('format / i18n', () => {
  it('interpolates templates', () => {
    expect(format('MODULE_NOT_FOUND', { name: 'auth' })).toBe('Module "auth" not found in modules list.');
  });

  it('uses a registered locale overlay, falling back to the registry default', () => {
    registerCatalog('es', { ACCOUNT_EXISTS: 'Ya existe una cuenta con este correo.' });
    expect(format('ACCOUNT_EXISTS', {}, 'es')).toBe('Ya existe una cuenta con este correo.');
    // codes without an overlay entry fall back to the untagged registry default
    expect(format('FORBIDDEN', {}, 'es')).toBe('You do not have permission to do that.');
  });

  it('renders the registry default when no locale is given', () => {
    expect(format('FORBIDDEN')).toBe('You do not have permission to do that.');
  });

  it('humanizes unknown codes as a last resort', () => {
    expect(format('SOME_UNKNOWN_CODE')).toBe('Some unknown code');
  });
});

describe('generated registry (full constructive-db audit)', () => {
  it('collects every audited constructive-db code', () => {
    expect(Object.keys(generatedRegistry)).toHaveLength(GENERATED_CODE_COUNT);
    // curated + generated codes are all reachable
    expect(allCodes().length).toBeGreaterThanOrEqual(GENERATED_CODE_COUNT);
  });

  it('classifies a generator-only auth code as public', () => {
    // SIGN_UP_DISABLED is emitted only by DB generators (no hand-written source)
    expect(GENERATED_CODE_META.SIGN_UP_DISABLED.generatedOnly).toBe(true);
    expect(classify('SIGN_UP_DISABLED')).toBe('public');
  });

  it('classifies internal invariant codes as internal (masked)', () => {
    expect(classify('DATA_ID')).toBe('internal');
    expect(classify('APPLY_RLS')).toBe('internal');
    expect(classify('ALTER_TABLE_ADD_COLUMN')).toBe('internal');
  });

  it('parses a generated public code end-to-end', () => {
    const result = parse({ message: 'API_KEY_LIMIT_REACHED', code: 'P0001' });
    expect(result.code).toBe('API_KEY_LIMIT_REACHED');
    expect(result.class).toBe('public');
    expect(result.known).toBe(true);
  });

  it('exposes generated codes on the errors factory', () => {
    const err = errors.SIGN_UP_DISABLED();
    expect(err.code).toBe('SIGN_UP_DISABLED');
    expect(err.isPublic).toBe(true);
  });

  it('carries every step-up factor a guard can demand', () => {
    // require_step_up() raises one code per factor so the client knows which
    // re-verification to prompt for; a humanized code would prompt for the
    // wrong one, so each needs its own copy.
    const factors = [
      'STEP_UP_REQUIRED_PASSWORD',
      'STEP_UP_REQUIRED_MFA',
      'STEP_UP_REQUIRED_PASSWORD_OR_MFA',
      'STEP_UP_REQUIRED_FRESH_AUTH'
    ];
    for (const code of factors) {
      expect(classify(code)).toBe('public');
      expect(generatedRegistry[code].http).toBe(403);
      expect(format(code)).not.toMatch(/^Step up required/);
    }
    expect(new Set(factors.map((code) => format(code))).size).toBe(
      factors.length
    );
    // An unrecognized posture fails closed rather than passing the mutation.
    expect(classify('STEP_UP_INVALID_TYPE')).toBe('public');
  });
});
