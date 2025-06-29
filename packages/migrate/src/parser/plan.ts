import { readFileSync } from 'fs';
import { SqitchChange, SqitchPlan } from '@launchql/types';

/**
 * Parse a Sqitch plan file into a structured format for execution
 * 
 * Plan line format:
 * change_name [dep1 dep2] timestamp planner <email> # comment
 * 
 * Example:
 * procedures/verify_constraint [pg-utilities:procedures/tg_update_timestamps] 2017-08-11T08:11:51Z skitch <skitch@5b0c196eeb62> # add procedures/verify_constraint
 */
export function parsePlanForExecution(planPath: string): SqitchPlan {
  const content = readFileSync(planPath, 'utf-8');
  const lines = content.split('\n');
  
  let project = '';
  let uri = '';
  const changes: SqitchChange[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Parse project metadata
    if (trimmed.startsWith('%project=')) {
      project = trimmed.substring('%project='.length);
      continue;
    }
    
    if (trimmed.startsWith('%uri=')) {
      uri = trimmed.substring('%uri='.length);
      continue;
    }
    
    // Skip other metadata lines
    if (trimmed.startsWith('%') || trimmed.startsWith('@')) {
      continue;
    }
    
    // Parse change lines
    const change = parseChangeLine(trimmed);
    if (change) {
      changes.push(change);
    }
  }
  
  return { project, uri, changes };
}

/**
 * Parse a single change line from a plan file
 */
function parseChangeLine(line: string): SqitchChange | null {
  // Regular expression to parse change lines
  // Matches: change_name [deps] timestamp planner <email> # comment
  const regex = /^(\S+)(?:\s+\[([^\]]*)\])?(?:\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z))?(?:\s+(\S+))?(?:\s+<([^>]+)>)?(?:\s+#\s+(.*))?$/;
  
  const match = line.match(regex);
  if (!match) {
    return null;
  }
  
  const [, name, depsStr, timestamp, planner, email, note] = match;
  
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
    note
  };
}

/**
 * Extract just the change names from a plan file (for compatibility with existing code)
 */
export function getChangeNamesFromPlan(planPath: string): string[] {
  const plan = parsePlanForExecution(planPath);
  return plan.changes.map(change => change.name);
}

/**
 * Get changes for deployment operations in forward or reverse order
 */
export function getChangesForDeployment(planPath: string, reverse: boolean = false): SqitchChange[] {
  const plan = parsePlanForExecution(planPath);
  return reverse ? [...plan.changes].reverse() : plan.changes;
}