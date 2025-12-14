import { PgpmError } from './error';

type ErrorContext = Record<string, string | number | boolean>;

export const makeError = <T extends ErrorContext>(
  code: string,
  messageFn: (context: T) => string,
  httpCode?: number
) => {
  return (
    context: T,
    overrideMessage?: string
  ): PgpmError => {
    const message = overrideMessage || messageFn(context);
    return new PgpmError(code, message, context, httpCode);
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
    ({ name }: { name: string }) => `Module "${name}" not found in modules list.`,
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
    () => `You must be in a PGPM workspace. Initialize with "pgpm init workspace".`,
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

  CHANGE_NOT_FOUND: makeError(
    'CHANGE_NOT_FOUND',
    ({ change, plan }: { change: string, plan?: string }) => 
      `Change '${change}' not found in plan${plan ? ` file: ${plan}` : ''}`,
    404
  ),

  TAG_NOT_FOUND: makeError(
    'TAG_NOT_FOUND',
    ({ tag, project }: { tag: string, project?: string }) => 
      `Tag '${tag}' not found${project ? ` in project ${project}` : ' in plan'}`,
    404
  ),

  PATH_NOT_FOUND: makeError(
    'PATH_NOT_FOUND',
    ({ path, type }: { path: string, type: 'module' | 'workspace' | 'file' }) => 
      `${type} path not found: ${path}`,
    404
  ),

  OPERATION_FAILED: makeError(
    'OPERATION_FAILED',
    ({ operation, target, reason }: { operation: string, target?: string, reason?: string }) => 
      `${operation} failed${target ? ` for ${target}` : ''}${reason ? `: ${reason}` : ''}`,
    500
  ),

  PLAN_PARSE_ERROR: makeError(
    'PLAN_PARSE_ERROR',
    ({ planPath, errors }: { planPath: string, errors: string }) => 
      `Failed to parse plan file ${planPath}: ${errors}`,
    400
  ),

  CIRCULAR_DEPENDENCY: makeError(
    'CIRCULAR_DEPENDENCY',
    ({ module, dependency }: { module: string, dependency: string }) => 
      `Circular reference detected: ${module} → ${dependency}`,
    400
  ),

  INVALID_NAME: makeError(
    'INVALID_NAME',
    ({ name, type, rules }: { name: string, type: 'tag' | 'change' | 'module', rules?: string }) => 
      `Invalid ${type} name: ${name}${rules ? `. ${rules}` : ''}`,
    400
  ),

  WORKSPACE_OPERATION_ERROR: makeError(
    'WORKSPACE_OPERATION_ERROR',
    ({ operation }: { operation: string }) => 
      `Cannot perform non-recursive ${operation} on workspace. Use recursive=true or specify a target module.`,
    400
  ),

  FILE_NOT_FOUND: makeError(
    'FILE_NOT_FOUND',
    ({ filePath, type }: { filePath: string, type?: string }) => 
      `${type ? `${type} file` : 'File'} not found: ${filePath}`,
    404
  ),
};

// throw errors.MODULE_NOT_FOUND({ name: 'auth' });

// throw errors.INTERNAL_FAILURE({ details: 'Could not connect to DB' });

// throw errors.UNKNOWN_COMMAND({ cmd: 'foo' }, 'Unsupported command "foo"');

// throw errors.CONTEXT_MISSING(();
