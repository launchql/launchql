import { readFileSync } from 'fs';
import { Change, PlanFile } from '../types';
import { parsePlanFileWithValidation } from './plan-parser';

// Re-export new parser functionality
export * from './validators';
export * from './plan-parser';

/**
 * Parse a Sqitch plan file into a structured format
 * 
 * Plan line format:
 * change_name [dep1 dep2] timestamp planner <email> # comment
 * 
 * Example:
 * procedures/verify_constraint [pg-utilities:procedures/tg_update_timestamps] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/verify_constraint
 * 
 * @deprecated Use parsePlanFileWithValidation for full validation support
 */
export function parsePlanFile(planPath: string): PlanFile {
  // Use the new parser but return the simple format for backwards compatibility
  const result = parsePlanFileWithValidation(planPath);
  
  if (result.errors.length > 0) {
    // For backwards compatibility, we'll still try to return what we can
    // In production, you should use parsePlanFileWithValidation and handle errors
    console.warn('Plan file parsing encountered errors:', result.errors);
  }
  
  if (result.plan) {
    // Return without the tags for backwards compatibility
    const { tags, ...planWithoutTags } = result.plan;
    return planWithoutTags;
  }
  
  // Fallback to empty plan
  return { project: '', uri: '', changes: [] };
}

/**
 * Parse a single change line from a plan file
 */
function parseChangeLine(line: string): Change | null {
  // Regular expression to parse change lines
  // Matches: change_name [deps] timestamp planner <email> # comment
  const regex = /^(\S+)(?:\s+\[([^\]]*)\])?(?:\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z))?(?:\s+(\S+))?(?:\s+<([^>]+)>)?(?:\s+#\s+(.*))?$/;
  
  const match = line.match(regex);
  if (!match) {
    return null;
  }
  
  const [, name, depsStr, timestamp, planner, email, comment] = match;
  
  // Parse dependencies
  const dependencies = depsStr 
    ? depsStr.split(/\s+/).filter(dep => dep.length > 0)
    : [];
  
  return {
    name,
    dependencies,
    timestamp,
    planner,
    email,
    comment
  };
}

/**
 * Extract just the change names from a plan file (for compatibility with existing code)
 */
export function getChangeNamesFromPlan(planPath: string): string[] {
  const plan = parsePlanFile(planPath);
  return plan.changes.map(change => change.name);
}

/**
 * Get changes in deployment order (forward) or revert order (reverse)
 */
export function getChangesInOrder(planPath: string, reverse: boolean = false): Change[] {
  const plan = parsePlanFile(planPath);
  return reverse ? [...plan.changes].reverse() : plan.changes;
}