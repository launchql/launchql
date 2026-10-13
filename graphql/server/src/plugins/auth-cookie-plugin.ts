import '../middleware/types';

import { Logger } from '@pgpmjs/logger';
import type { Request } from 'express';
import type { BufferResult } from 'grafserv';
import type { GraphileConfig } from 'graphile-config';
import type { DocumentNode } from 'graphql';
import { getOperationAST, Kind, parse } from 'graphql';

import {
  CookieConfig,
  DEVICE_TOKEN_COOKIE_NAME,
  getDeviceTokenCookieConfig,
  getSessionCookieConfig,
  isSessionCookieOmitted,
  SESSION_COOKIE_NAME,
} from '../middleware/cookie';

const log = new Logger('auth-cookie');

/**
 * Serialize a cookie to a Set-Cookie header value.
 */
const serializeCookie = (name: string, value: string, config: CookieConfig): string => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (config.maxAge !== undefined) {
    parts.push(`Max-Age=${config.maxAge}`);
  }
  if (config.domain) {
    parts.push(`Domain=${config.domain}`);
  }
  if (config.path) {
    parts.push(`Path=${config.path}`);
  }
  if (config.secure) {
    parts.push('Secure');
  }
  if (config.httpOnly) {
    parts.push('HttpOnly');
  }
  if (config.sameSite) {
    parts.push(`SameSite=${config.sameSite.charAt(0).toUpperCase() + config.sameSite.slice(1)}`);
  }

  return parts.join('; ');
};

/**
 * Serialize a cookie for clearing (expired).
 */
const serializeClearCookie = (name: string, config: CookieConfig): string => {
  const parts = [`${encodeURIComponent(name)}=`];
  parts.push('Max-Age=0');
  if (config.domain) {
    parts.push(`Domain=${config.domain}`);
  }
  if (config.path) {
    parts.push(`Path=${config.path}`);
  }
  if (config.secure) {
    parts.push('Secure');
  }
  if (config.httpOnly) {
    parts.push('HttpOnly');
  }
  if (config.sameSite) {
    parts.push(`SameSite=${config.sameSite.charAt(0).toUpperCase() + config.sameSite.slice(1)}`);
  }
  return parts.join('; ');
};

/**
 * Auth mutations that should set session cookie on success.
 */
const SIGN_IN_MUTATIONS = new Set([
  'signIn',
  'signUp',
  'signInSso',
  'signUpSso',
  'signInMagicLink',
  'signUpMagicLink',
  'signInEmailOtp',
  'signInSmsOtp',
  'signUpSms',
  'completeMfaChallenge',
  'signInOneTimeToken',
  'signInCrossOrigin',
  'webauthnSignInFinish',
]);

/**
 * Auth mutations that should clear the session cookie.
 */
const SIGN_OUT_MUTATIONS = new Set([
  'signOut',
  'revokeSession',
  'revokeAllSessions',
]);

interface GraphQLRequestBody {
  query?: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}

interface GraphQLResponse {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

/**
 * Top-level field names of the mutation that will execute: the operation
 * picked by `operationName`, so other operations in the document never count.
 */
const extractMutationNames = (query: string, operationName?: string): string[] => {
  let document: DocumentNode;
  try {
    document = parse(query);
  } catch {
    return [];
  }
  const operation = getOperationAST(document, operationName);
  if (operation?.operation !== 'mutation') return [];
  return operation.selectionSet.selections.flatMap((selection) =>
    selection.kind === Kind.FIELD ? [selection.name.value] : []
  );
};

/**
 * Extract access token from mutation response.
 */
const extractAccessToken = (
  data: Record<string, unknown>,
  mutationName: string
): string | undefined => {
  const result = data[mutationName] as Record<string, unknown> | undefined;
  if (!result) return undefined;

  // Check for non-empty string tokens
  if (typeof result.accessToken === 'string' && result.accessToken) return result.accessToken;
  if (typeof result.access_token === 'string' && result.access_token) return result.access_token;

  const nested = result.result as Record<string, unknown> | undefined;
  if (nested) {
    if (typeof nested.accessToken === 'string' && nested.accessToken) return nested.accessToken;
    if (typeof nested.access_token === 'string' && nested.access_token) return nested.access_token;
  }

  return undefined;
};

/**
 * Extract device ID from mutation response.
 */
const extractDeviceId = (
  data: Record<string, unknown>,
  mutationName: string
): string | undefined => {
  const result = data[mutationName] as Record<string, unknown> | undefined;
  if (!result) return undefined;

  if (typeof result.deviceId === 'string') return result.deviceId;
  if (typeof result.device_id === 'string') return result.device_id;

  const nested = result.result as Record<string, unknown> | undefined;
  if (nested) {
    if (typeof nested.deviceId === 'string') return nested.deviceId;
    if (typeof nested.device_id === 'string') return nested.device_id;
  }

  return undefined;
};

/**
 * Check if request includes remember_me flag.
 */
const hasRememberMe = (variables?: Record<string, unknown>): boolean => {
  if (!variables) return false;
  return variables.rememberMe === true || variables.remember_me === true;
};

/**
 * Get Express request from grafserv request context.
 */
const getExpressRequest = (requestContext: Partial<Grafast.RequestContext>): Request | undefined => {
  return (requestContext as { expressv4?: { req?: Request } })?.expressv4?.req;
};

/**
 * AuthCookiePlugin - grafserv middleware plugin that handles auth cookie lifecycle.
 *
 * This plugin intercepts GraphQL responses and:
 * - Sets session cookies on successful sign-in mutations
 * - Clears session cookies on sign-out mutations
 * - Handles device token cookies for trusted device tracking
 */
export const AuthCookiePlugin: GraphileConfig.Plugin = {
  name: 'AuthCookiePlugin',
  version: '1.0.0',
  grafserv: {
    middleware: {
      processRequest: {
        callback: async (next, event) => {
          const result = await next();

          // Only process buffer results (JSON responses)
          if (!result || result.type !== 'buffer') {
            return result;
          }

          const bufferResult = result as BufferResult;
          const req = getExpressRequest(event.requestDigest.requestContext);

          // Skip if no Express request or not a POST
          if (!req || event.requestDigest.method !== 'POST') {
            return result;
          }

          // Get request body for mutation detection
          // grafserv provides getBody() which returns { type: 'buffer', buffer: Buffer }
          let body: GraphQLRequestBody | undefined;
          if (typeof event.requestDigest.getBody === 'function') {
            try {
              const rawBody = await event.requestDigest.getBody() as { type?: string; buffer?: Buffer };
              if (rawBody?.type === 'buffer' && rawBody.buffer) {
                const jsonStr = rawBody.buffer.toString('utf8');
                body = JSON.parse(jsonStr) as GraphQLRequestBody;
              }
            } catch (e) {
              log.debug('[auth-cookie] Failed to parse body from requestDigest');
            }
          }
          body = body || (req.body as GraphQLRequestBody);
          if (!body?.query) {
            return result;
          }

          // Extract mutation names
          const mutationNames = extractMutationNames(body.query, body.operationName);
          if (mutationNames.length === 0) {
            return result;
          }

          // Check for auth mutations
          const signInMutation = mutationNames.find((m) => SIGN_IN_MUTATIONS.has(m));
          const signOutMutation = mutationNames.find((m) => SIGN_OUT_MUTATIONS.has(m));

          if (!signInMutation && !signOutMutation) {
            return result;
          }

          log.debug(`[auth-cookie] Detected auth mutation: ${signInMutation || signOutMutation}`);

          try {
            // Parse response body
            const payload = bufferResult.buffer.toString('utf8');
            const graphqlResponse = JSON.parse(payload) as GraphQLResponse;

            const succeeded = !graphqlResponse.errors?.length && Boolean(graphqlResponse.data);
            const data = graphqlResponse.data ?? {};
            const authSettings = req.api?.authSettings;
            const cookiesToSet: string[] = [];

            // signOut always clears the cookies, whatever the mutation returned
            // and however the request authenticated: a Bearer client that was
            // once handed a session cookie must not keep sending it afterwards.
            // revokeSession/revokeAllSessions clear them only on success.
            if (signOutMutation === 'signOut' || (signOutMutation && succeeded && data[signOutMutation])) {
              log.info(`[auth-cookie] ${signOutMutation}: clearing session cookie`);
              const config = getSessionCookieConfig(authSettings);
              cookiesToSet.push(serializeClearCookie(SESSION_COOKIE_NAME, config));
              // Also clear device token on sign-out
              const deviceConfig = getDeviceTokenCookieConfig(authSettings);
              cookiesToSet.push(serializeClearCookie(DEVICE_TOKEN_COOKIE_NAME, deviceConfig));
            }

            // Handle sign-in mutations; a client that sent the opt-out header
            // reads the token from the response body and gets no cookies.
            if (signInMutation && succeeded && !isSessionCookieOmitted(req)) {
              const accessToken = extractAccessToken(data, signInMutation);
              if (accessToken) {
                const rememberMe = hasRememberMe(body.variables);
                const config = getSessionCookieConfig(authSettings, rememberMe);
                log.info(`[auth-cookie] Sign-in mutation succeeded, setting session cookie (rememberMe=${rememberMe})`);
                cookiesToSet.push(serializeCookie(SESSION_COOKIE_NAME, accessToken, config));

                const deviceId = extractDeviceId(data, signInMutation);
                if (deviceId) {
                  log.info('[auth-cookie] Device ID returned, setting device token cookie');
                  const deviceConfig = getDeviceTokenCookieConfig(authSettings);
                  cookiesToSet.push(serializeCookie(DEVICE_TOKEN_COOKIE_NAME, deviceId, deviceConfig));
                }
              }
            }

            // Set cookies directly on Express response and return modified headers
            if (cookiesToSet.length > 0) {
              const res = (event.requestDigest.requestContext as { expressv4?: { res?: { setHeader: (name: string, value: string[]) => void; getHeader: (name: string) => string | string[] | undefined } } })?.expressv4?.res;

              if (res?.setHeader) {
                // Get existing Set-Cookie headers from Express response
                const existingCookies = res.getHeader('Set-Cookie');
                const allCookies: string[] = [];

                if (existingCookies) {
                  if (Array.isArray(existingCookies)) {
                    allCookies.push(...existingCookies);
                  } else {
                    allCookies.push(existingCookies);
                  }
                }
                allCookies.push(...cookiesToSet);

                // Set as array to get multiple Set-Cookie headers
                res.setHeader('Set-Cookie', allCookies);
              }

              // Also update the BufferResult headers for grafserv to pass through
              const existingBufferCookie = bufferResult.headers['set-cookie'];
              const updatedHeaders = { ...bufferResult.headers };

              // Remove set-cookie from grafserv headers since we set it on Express
              delete updatedHeaders['set-cookie'];

              return {
                ...bufferResult,
                headers: updatedHeaders,
              };
            }
          } catch (err) {
            log.error('[auth-cookie] Error processing auth response:', err);
          }

          return result;
        },
      },
    },
  },
};
