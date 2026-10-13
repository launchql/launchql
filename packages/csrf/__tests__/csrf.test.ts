import { createCsrfMiddleware,generateToken, verifyToken } from '../src';

describe('token utilities', () => {
  describe('generateToken', () => {
    it('should generate random token of default length', () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
    });

    it('should generate random token of custom length', () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32);
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should return true for matching tokens', () => {
      const token = generateToken();
      expect(verifyToken(token, token)).toBe(true);
    });

    it('should return false for non-matching tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(verifyToken(token1, token2)).toBe(false);
    });

    it('should return false for undefined expected token', () => {
      expect(verifyToken(undefined, 'some-token')).toBe(false);
    });

    it('should return false for undefined actual token', () => {
      expect(verifyToken('some-token', undefined)).toBe(false);
    });

    it('should return false for different length tokens', () => {
      expect(verifyToken('short', 'much-longer-token')).toBe(false);
    });
  });
});

describe('createCsrfMiddleware', () => {
  const createMockReq = (overrides = {}) => ({
    method: 'GET',
    cookies: {},
    headers: {},
    body: {},
    ...overrides,
  });

  const createMockRes = () => {
    const cookies: Record<string, { value: string; options: unknown }> = {};
    return {
      cookie: jest.fn((name: string, value: string, options: unknown) => {
        cookies[name] = { value, options };
      }),
      status: jest.fn(() => ({
        json: jest.fn(),
      })),
      _cookies: cookies,
    };
  };

  describe('setToken', () => {
    it('should set token cookie if not present', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      csrf.setToken(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('should default maxAge to one day in milliseconds', () => {
      const csrf = createCsrfMiddleware();
      const res = createMockRes();

      csrf.setToken(createMockReq(), res, jest.fn());

      expect(res.cookie).toHaveBeenCalledWith(
        'csrf_token',
        expect.any(String),
        expect.objectContaining({ maxAge: 86400 * 1000 })
      );
    });

    it('should not set token cookie if already present', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ cookies: { csrf_token: 'existing-token' } });
      const res = createMockRes();
      const next = jest.fn();

      csrf.setToken(req, res, next);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should use custom cookie name', () => {
      const csrf = createCsrfMiddleware({ cookieName: 'my_csrf' });
      const req = createMockReq();
      const res = createMockRes();
      const next = jest.fn();

      csrf.setToken(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'my_csrf',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('protect', () => {
    it('should skip GET requests', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ method: 'GET' });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should skip HEAD requests', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ method: 'HEAD' });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should skip OPTIONS requests', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ method: 'OPTIONS' });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail if no cookie token', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ method: 'POST' });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CSRF_TOKEN_MISSING',
        })
      );
    });

    it('should fail if token mismatch', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({
        method: 'POST',
        cookies: { csrf_token: 'cookie-token' },
        headers: { 'x-csrf-token': 'wrong-token' },
      });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CSRF_TOKEN_INVALID',
        })
      );
    });

    it('should pass if header token matches', () => {
      const csrf = createCsrfMiddleware();
      const token = csrf.generateToken();
      const req = createMockReq({
        method: 'POST',
        cookies: { csrf_token: token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass if body token matches', () => {
      const csrf = createCsrfMiddleware();
      const token = csrf.generateToken();
      const req = createMockReq({
        method: 'POST',
        cookies: { csrf_token: token },
        body: { _csrf: token },
      });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should use custom header name', () => {
      const csrf = createCsrfMiddleware({ headerName: 'X-My-Token' });
      const token = csrf.generateToken();
      const req = createMockReq({
        method: 'POST',
        cookies: { csrf_token: token },
        headers: { 'x-my-token': token },
      });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should use custom field name', () => {
      const csrf = createCsrfMiddleware({ fieldName: 'csrfToken' });
      const token = csrf.generateToken();
      const req = createMockReq({
        method: 'POST',
        cookies: { csrf_token: token },
        body: { csrfToken: token },
      });
      const res = createMockRes();
      const next = jest.fn();

      csrf.protect(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('getToken', () => {
    it('should return token from cookie', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq({ cookies: { csrf_token: 'my-token' } });

      expect(csrf.getToken(req)).toBe('my-token');
    });

    it('should return undefined if no cookie', () => {
      const csrf = createCsrfMiddleware();
      const req = createMockReq();

      expect(csrf.getToken(req)).toBeUndefined();
    });
  });
});
