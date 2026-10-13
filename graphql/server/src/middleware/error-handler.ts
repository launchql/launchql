import './types';

import { Logger } from '@pgpmjs/logger';
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import errorPage50x from '../errors/50x';
import errorPage404Message from '../errors/404-message';
import { isApiError } from '../errors/api-errors';

const log = new Logger('error-handler');

const wantsJson = (req: Request): boolean => {
  const accept = req.get('Accept') || '';
  return accept.includes('application/json')
    || accept.includes('application/graphql-response+json')
    || Boolean(req.is('json'));
};

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  logLevel: 'warn' | 'error';
}

const isCsrfError = (err: Error): boolean => {
  const code = (err as unknown as { code?: string }).code;
  return typeof code === 'string' && code.startsWith('CSRF_');
};

const categorizeError = (err: Error): ErrorResponse => {
  if (isApiError(err)) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      logLevel: err.statusCode >= 500 ? 'error' : 'warn',
    };
  }
  if (isCsrfError(err)) {
    const code = (err as unknown as { code: string }).code;
    return { statusCode: 403, code, message: err.message, logLevel: 'warn' };
  }
  if (err.message?.includes('ECONNREFUSED') || err.message?.includes('connection terminated')) {
    return { statusCode: 503, code: 'SERVICE_UNAVAILABLE', message: err.message, logLevel: 'error' };
  }
  if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
    return { statusCode: 504, code: 'GATEWAY_TIMEOUT', message: err.message, logLevel: 'error' };
  }
  return { statusCode: 500, code: 'INTERNAL_ERROR', message: err.message, logLevel: 'error' };
};

const sendResponse = (req: Request, res: Response, { statusCode, code, message }: ErrorResponse): void => {
  if (wantsJson(req)) {
    res.status(statusCode).json({ error: { code, message, requestId: req.requestId } });
  } else {
    res.status(statusCode).send(statusCode >= 500 ? errorPage50x : errorPage404Message(message));
  }
};

const logError = (err: Error, req: Request, level: 'warn' | 'error'): void => {
  const context = {
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    host: req.get('host'),
    databaseId: req.databaseId,
    svcKey: req.svc_key,
    clientIp: req.clientIp,
  };

  if (isApiError(err)) {
    log[level]({ event: 'api_error', code: err.code, statusCode: err.statusCode, message: err.message, ...context });
  } else {
    log[level]({ event: 'unexpected_error', name: err.name, message: err.message, stack: err.stack, ...context });
  }
};

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (res.headersSent) {
    log.warn({ event: 'headers_already_sent', requestId: req.requestId, path: req.path, errorMessage: err.message });
    return;
  }

  const response = categorizeError(err);
  logError(err, req, response.logLevel);
  sendResponse(req, res, response);
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  log.warn({ event: 'route_not_found', path: req.path, method: req.method, requestId: req.requestId });

  if (wantsJson(req)) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found', requestId: req.requestId } });
  } else {
    res.status(404).send(errorPage404Message('The requested page was not found'));
  }
};
