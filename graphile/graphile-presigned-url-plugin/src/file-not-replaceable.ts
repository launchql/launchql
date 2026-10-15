import { ConstructiveError } from '@constructive-io/errors';

/**
 * A key whose existing file this caller may not delete. Named and public, so
 * the server passes the code through instead of masking it as
 * INTERNAL_SERVER_ERROR.
 */
export function fileNotReplaceable(fileId: string, key: string): ConstructiveError {
  return new ConstructiveError({
    code: 'FILE_NOT_REPLACEABLE',
    message: `FILE_NOT_REPLACEABLE: file ${fileId} at key ${key} cannot be replaced by this caller`,
    errorClass: 'public',
    http: 409,
    context: { fileId, key },
  });
}
