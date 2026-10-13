export interface CsrfConfig {
  cookieName?: string;
  headerName?: string;
  fieldName?: string;
  cookieOptions?: CookieOptions;
  ignoreMethods?: string[];
  tokenLength?: number;
}

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  /** Cookie lifetime in milliseconds (passed to Express `res.cookie`, which emits `Max-Age` in seconds). */
  maxAge?: number;
  path?: string;
  domain?: string;
}

export interface CsrfError extends Error {
  code: string;
  statusCode: number;
}

export function createCsrfError(message: string, code: string): CsrfError {
  const error = new Error(message) as CsrfError;
  error.code = code;
  error.statusCode = 403;
  return error;
}
