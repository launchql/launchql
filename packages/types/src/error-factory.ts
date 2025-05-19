import { LaunchQLError } from './error';

type ErrorContext = Record<string, string | number | boolean>;

export const makeError = <T extends ErrorContext>(
  code: string,
  messageFn: (context: T) => string,
  httpCode?: number
) => {
  return (
    context: T,
    overrideMessage?: string
  ): LaunchQLError => {
    const message = overrideMessage || messageFn(context);
    return new LaunchQLError(code, message, context, httpCode);
  };
};

export const errors = {
  NOT_FOUND: makeError(
    'NOT_FOUND',
    () => `Not found.`,
    404
  ),

  MODULE_NOT_FOUND: makeError(
    'MODULE_NOT_FOUND',
    ({ name }) => `Module "${name}" not found.`,
    404
  ),

  NO_ACCOUNT_EXISTS: makeError(
    'NO_ACCOUNT_EXISTS',
    ({ userId }) => `No account exists for user: ${userId}`,
    404
  ),

  INTERNAL_FAILURE: makeError(
    'INTERNAL_FAILURE',
    ({ details }) => `Something went wrong: ${details}`,
    500
  ),

  CONTEXT_MISSING: makeError(
    'CONTEXT_MISSING',
    () => `Context is not initialized. Did you run setup()?`,
    500
  ),

  NOT_IN_WORKSPACE: makeError(
    'NOT_IN_WORKSPACE',
    () => `You must be in a LaunchQL workspace. Initialize with --workspace.`,
    400
  ),

  NOT_IN_WORKSPACE_MODULE: makeError(
    'NOT_IN_WORKSPACE_MODULE',
    () => `Error: You must be inside one of the workspace packages.`,
    400
  ),

  DEPLOYMENT_FAILED: makeError(
    'DEPLOYMENT_FAILED',
    ({ type, module }: {type: 'Deployment' | 'Revert' | 'Verify', module: string}) => `${type} failed for module: ${module}`,
    500
  ),

  UNSUPPORTED_TYPE_HINT: makeError(
    'UNSUPPORTED_TYPE_HINT',
    ({ typeHint }) => `Unsupported type hint: ${typeHint}`,
    400
  ),

  BAD_FILE_NAME: makeError(
    'BAD_FILE_NAME',
    ({ name }) => `Invalid file name: ${name}`,
    400
  ),

  UNKNOWN_COMMAND: makeError(
    'UNKNOWN_COMMAND',
    ({ cmd }) => `Unknown command: ${cmd}`,
    400
  ),
};

// throw errors.MODULE_NOT_FOUND({ name: 'auth' });

// throw errors.INTERNAL_FAILURE({ details: 'Could not connect to DB' });

// throw errors.UNKNOWN_COMMAND({ cmd: 'foo' }, 'Unsupported command "foo"');

// throw errors.CONTEXT_MISSING(();

