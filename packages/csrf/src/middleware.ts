import { generateToken, verifyToken } from './token';
import { CookieOptions, createCsrfError,CsrfConfig } from './types';

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const DEFAULT_CONFIG: Required<CsrfConfig> = {
  cookieName: 'csrf_token',
  headerName: 'x-csrf-token',
  fieldName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: DEFAULT_MAX_AGE_MS,
    path: '/',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  tokenLength: 32,
};

export interface CsrfRequest {
  method: string;
  cookies: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
}

export interface CsrfResponse {
  cookie: (name: string, value: string, options: CookieOptions) => void;
  status: (code: number) => { json: (data: unknown) => void };
}

export interface CsrfMiddlewareResult {
  protect: (
    req: CsrfRequest,
    res: CsrfResponse,
    next: (err?: Error) => void
  ) => void;
  setToken: (
    req: CsrfRequest,
    res: CsrfResponse,
    next: (err?: Error) => void
  ) => void;
  getToken: (req: CsrfRequest) => string | undefined;
  generateToken: () => string;
  verifyToken: (expected: string | undefined, actual: string | undefined) => boolean;
}

export function createCsrfMiddleware(config: CsrfConfig = {}): CsrfMiddlewareResult {
  const cfg: Required<CsrfConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    cookieOptions: {
      ...DEFAULT_CONFIG.cookieOptions,
      ...config.cookieOptions,
    },
  };

  const setToken = (
    req: CsrfRequest,
    res: CsrfResponse,
    next: (err?: Error) => void
  ): void => {
    const existingToken = req.cookies[cfg.cookieName];
    if (!existingToken) {
      const token = generateToken(cfg.tokenLength);
      res.cookie(cfg.cookieName, token, cfg.cookieOptions);
    }
    next();
  };

  const getToken = (req: CsrfRequest): string | undefined => {
    return req.cookies[cfg.cookieName];
  };

  const protect = (
    req: CsrfRequest,
    res: CsrfResponse,
    next: (err?: Error) => void
  ): void => {
    if (cfg.ignoreMethods.includes(req.method.toUpperCase())) {
      return next();
    }

    const cookieToken = req.cookies[cfg.cookieName];
    if (!cookieToken) {
      const error = createCsrfError('CSRF token missing from cookie', 'CSRF_TOKEN_MISSING');
      return next(error);
    }

    const headerToken = req.headers[cfg.headerName.toLowerCase()];
    const bodyToken = req.body?.[cfg.fieldName] as string | undefined;
    const submittedToken = (typeof headerToken === 'string' ? headerToken : undefined) || bodyToken;

    if (!verifyToken(cookieToken, submittedToken)) {
      const error = createCsrfError('CSRF token validation failed', 'CSRF_TOKEN_INVALID');
      return next(error);
    }

    next();
  };

  return {
    protect,
    setToken,
    getToken,
    generateToken: () => generateToken(cfg.tokenLength),
    verifyToken,
  };
}

export function csrfErrorHandler(
  err: Error,
  _req: unknown,
  res: CsrfResponse,
  next: (err?: Error) => void
): void {
  const csrfErr = err as unknown as { code?: string };
  if (csrfErr.code?.startsWith('CSRF_')) {
    res.status(403).json({
      error: 'csrf_error',
      message: err.message,
      code: csrfErr.code,
    });
    return;
  }
  next(err);
}
