import type { NextFunction, Request, Response } from 'express';

import { InvalidSessionCookieHeaderError } from '../errors/api-errors';
import type { AuthSettings } from '../types';

export const SESSION_COOKIE_NAME = 'constructive_session';
export const DEVICE_TOKEN_COOKIE_NAME = 'constructive_device_token';

/**
 * Request header a non-browser client (native app, CLI, server) sends to opt
 * out of auth cookies: sign-in mutations then return the access token in the
 * response body only and set neither the session nor the device-token cookie.
 */
export const SESSION_COOKIE_HEADER = 'X-Constructive-Session-Cookie';
export const SESSION_COOKIE_OMIT = 'omit';

const DEVICE_TOKEN_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

export interface CookieConfig {
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  httpOnly: boolean;
  maxAge: number;
  path: string;
}

/**
 * Build cookie config from AuthSettings with optional remember_me override.
 */
export const getSessionCookieConfig = (
  authSettings?: AuthSettings,
  rememberMe = false
): CookieConfig => {
  const DEFAULT_MAX_AGE = 86400; // 24 hours
  let maxAge = DEFAULT_MAX_AGE;
  if (rememberMe && authSettings?.rememberMeDuration) {
    const parsed = parseInt(authSettings.rememberMeDuration, 10);
    if (!isNaN(parsed)) maxAge = parsed;
  } else if (authSettings?.cookieMaxAge) {
    const parsed = parseInt(authSettings.cookieMaxAge, 10);
    if (!isNaN(parsed)) maxAge = parsed;
  }

  return {
    secure: authSettings?.cookieSecure ?? process.env.NODE_ENV === 'production',
    sameSite: (authSettings?.cookieSamesite as 'strict' | 'lax' | 'none') ?? 'lax',
    domain: authSettings?.cookieDomain ?? undefined,
    httpOnly: authSettings?.cookieHttponly ?? true,
    maxAge,
    path: authSettings?.cookiePath ?? '/',
  };
};

/**
 * Build cookie config for device token (long-lived, 90 days).
 */
export const getDeviceTokenCookieConfig = (authSettings?: AuthSettings): CookieConfig => {
  return {
    secure: authSettings?.cookieSecure ?? process.env.NODE_ENV === 'production',
    sameSite: (authSettings?.cookieSamesite as 'strict' | 'lax' | 'none') ?? 'lax',
    domain: authSettings?.cookieDomain ?? undefined,
    httpOnly: true,
    maxAge: DEVICE_TOKEN_MAX_AGE,
    path: authSettings?.cookiePath ?? '/',
  };
};

/**
 * Set the session cookie with the access token.
 */
export const setSessionCookie = (
  res: Response,
  accessToken: string,
  config: CookieConfig
): void => {
  res.cookie(SESSION_COOKIE_NAME, accessToken, {
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    httpOnly: config.httpOnly,
    maxAge: config.maxAge * 1000, // Express expects milliseconds
    path: config.path,
  });
};

/**
 * Clear the session cookie.
 */
export const clearSessionCookie = (res: Response, config: CookieConfig): void => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    httpOnly: config.httpOnly,
    path: config.path,
  });
};

/**
 * Set the device token cookie (long-lived for trusted device tracking).
 */
export const setDeviceTokenCookie = (
  res: Response,
  deviceToken: string,
  config: CookieConfig
): void => {
  res.cookie(DEVICE_TOKEN_COOKIE_NAME, deviceToken, {
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    httpOnly: config.httpOnly,
    maxAge: config.maxAge * 1000,
    path: config.path,
  });
};

/**
 * Clear the device token cookie.
 */
export const clearDeviceTokenCookie = (res: Response, config: CookieConfig): void => {
  res.clearCookie(DEVICE_TOKEN_COOKIE_NAME, {
    secure: config.secure,
    sameSite: config.sameSite,
    domain: config.domain,
    httpOnly: config.httpOnly,
    path: config.path,
  });
};

/**
 * True when the request opted out of auth cookies via `SESSION_COOKIE_HEADER`.
 */
export const isSessionCookieOmitted = (req: Request): boolean =>
  req.get(SESSION_COOKIE_HEADER) === SESSION_COOKIE_OMIT;

/**
 * Reject a `SESSION_COOKIE_HEADER` with any value but `omit`, before the
 * request executes, so a misspelt opt-out fails loudly instead of setting the
 * cookie the client asked not to receive.
 */
export const rejectInvalidSessionCookieHeader = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const value = req.get(SESSION_COOKIE_HEADER);
  if (value !== undefined && value !== SESSION_COOKIE_OMIT) {
    return next(new InvalidSessionCookieHeaderError(SESSION_COOKIE_HEADER, value, SESSION_COOKIE_OMIT));
  }
  next();
};

/**
 * Parse a cookie value from the raw Cookie header.
 * Avoids pulling in cookie-parser as a dependency.
 */
export const parseCookieValue = (req: Request, cookieName: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const match = header.split(';').find((c) => c.trim().startsWith(`${cookieName}=`));
  return match ? decodeURIComponent(match.split('=')[1].trim()) : undefined;
};

/**
 * Get the device token from the request cookie.
 */
export const getDeviceTokenFromRequest = (req: Request): string | undefined => {
  return parseCookieValue(req, DEVICE_TOKEN_COOKIE_NAME);
};

/**
 * Get the session token from the request cookie.
 */
export const getSessionTokenFromRequest = (req: Request): string | undefined => {
  return parseCookieValue(req, SESSION_COOKIE_NAME);
};
