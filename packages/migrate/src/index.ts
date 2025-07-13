export { LaunchQLMigrate } from './client';
export * from './types';
export { parsePlanFile, getChangeNamesFromPlan, getChangesInOrder } from './parser/plan';
export { hashFile, hashString } from './utils/hash';
export { readScript, scriptExists } from './utils/fs';
export { withTransaction, TransactionContext, TransactionOptions } from './utils/transaction';

// Export new validation and parsing functionality
export {
  isValidChangeName,
  isValidTagName,
  parseReference,
  isValidDependency,
  ParsedReference
} from './parser/validators';

export {
  parsePlanFileWithValidation,
  resolveReference,
  ExtendedPlanFile,
  Tag,
  ParseError,
  ParseResult
} from './parser/plan-parser';