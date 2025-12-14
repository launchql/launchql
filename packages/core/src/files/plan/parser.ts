import { readFileSync } from 'fs';

import { Change, ExtendedPlanFile, ParseError, ParseResult,PlanFile, Tag } from '../types';
import { isValidChangeName, isValidDependency, isValidTagName, parseReference } from './validators';
import { errors } from '@pgpmjs/types';

/**
 * Parse a Sqitch plan file with full validation
 * Supports both changes and tags
 */
export function parsePlanFile(planPath: string): ParseResult<ExtendedPlanFile> {
  const content = readFileSync(planPath, 'utf-8');
  const lines = content.split('\n');
  
  let project = '';
  let uri = '';
  const changes: Change[] = [];
  const tags: Tag[] = [];
  const errors: ParseError[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Skip comments
    if (trimmed.startsWith('#')) continue;
    
    // Parse package metadata
    if (trimmed.startsWith('%project=')) {
      project = trimmed.substring('%project='.length);
      continue;
    }
    
    if (trimmed.startsWith('%uri=')) {
      uri = trimmed.substring('%uri='.length);
      continue;
    }
    
    // Skip other metadata lines
    if (trimmed.startsWith('%')) {
      continue;
    }
    
    // Parse tag lines
    if (trimmed.startsWith('@')) {
      const lastChangeName = changes.length > 0 ? changes[changes.length - 1].name : null;
      const tag = parseTagLine(trimmed, lastChangeName);
      if (tag) {
        if (isValidTagName(tag.name)) {
          tags.push(tag);
        } else {
          errors.push({
            line: lineNum,
            message: `Invalid tag name: ${tag.name}`
            
          });
        }
      } else {
        errors.push({
          line: lineNum,
          message: 'Invalid tag line format'
          
        });
      }
      continue;
    }
    
    // Parse change lines
    const change = parseChangeLine(trimmed);
    if (change) {
      // Validate change name
      if (!isValidChangeName(change.name)) {
        errors.push({
          line: lineNum,
          message: `Invalid change name: ${change.name}`
          
        });
        continue;
      }
      
      // Validate dependencies
      for (const dep of change.dependencies) {
        if (!isValidDependency(dep)) {
          errors.push({
            line: lineNum,
            message: `Invalid dependency reference: ${dep}`
            
          });
        }
      }
      
      changes.push(change);
    } else if (trimmed) {
      // Non-empty line that couldn't be parsed
      errors.push({
        line: lineNum,
        message: 'Invalid line format'
        
      });
    }
  }
  
  if (errors.length > 0) {
    return { errors };
  }
  
  return {
    data: { package: project, uri, changes, tags },
    errors: []
  };
}

/**
 * Parse a single change line from a plan file
 * Format: change_name [deps] timestamp planner <email> # comment
 */
function parseChangeLine(line: string): Change | null {
  // More flexible regex that handles various formats, including planner names with spaces
  // Format: change_name [deps] timestamp planner <email> # comment
  // The timestamp is required if planner/email/comment are present
  const regex = /^(\S+)(?:\s+\[([^\]]*)\])?(?:\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)(?:\s+([^<]+?))?(?:\s+<([^>]+)>)?(?:\s+#\s+(.*))?)?$/;
  
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
 * Parse a tag line from a plan file
 * Format: @tag_name change_name timestamp planner <email> # comment
 */
function parseTagLine(line: string, lastChangeName: string | null): Tag | null {
  // Tag lines start with @
  if (!line.startsWith('@')) {
    return null;
  }
  
  // Remove the @ and parse
  const tagContent = line.substring(1);
  
  // Two possible formats:
  // 1. tagname timestamp planner <email> # comment (tag for last change)
  // 2. tagname changename timestamp planner <email> # comment (tag for specific change)
  
  // First try to match with change name (format 2)
  const regexWithChange = /^(\S+)\s+(\S+)\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+(.+?)\s+<([^>]+)>(?:\s+#\s+(.*))?$/;
  let match = tagContent.match(regexWithChange);
  
  if (match) {
    const [, name, secondToken, timestamp, planner, email, comment] = match;
    
    // Check if the second token is a timestamp (format 1) or change name (format 2)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(secondToken)) {
      // Format 1: no change name specified
      return {
        name,
        change: lastChangeName || '', // Tag is associated with the last change
        timestamp: secondToken,
        planner: timestamp, // What we thought was timestamp is actually planner
        email: planner, // Shift everything
        comment: email || comment
      };
    } else {
      // Format 2: explicit change name
      return {
        name,
        change: secondToken,
        timestamp,
        planner,
        email,
        comment
      };
    }
  }
  
  // Try simple format without change name
  const regexSimple = /^(\S+)\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+(.+?)\s+<([^>]+)>(?:\s+#\s+(.*))?$/;
  match = tagContent.match(regexSimple);
  
  if (!match) {
    return null;
  }

  const [, name, timestamp, planner, email, comment] = match;

  return {
    name,
    change: lastChangeName || '', // Tag is associated with the last change
    timestamp,
    planner,
    email,
    comment
  };
}

/**
 * Resolve a reference within a plan file context
 * Handles symbolic references (HEAD, ROOT) and relative references
 */
export function resolveReference(
  ref: string, 
  plan: ExtendedPlanFile,
  currentPackage?: string
): { change?: string; tag?: string; error?: string } {
  const parsed = parseReference(ref);
  if (!parsed) {
    return { error: `Invalid reference: ${ref}` };
  }
  
  // Handle package qualifier
  const planPackage = currentPackage || plan.package;
  if (parsed.package && parsed.package !== planPackage) {
    // Cross-package reference - return as-is
    return { change: ref };
  }
  
  // Handle SHA1 references
  if (parsed.sha1) {
    // Would need to look up in database
    return { change: ref };
  }
  
  // Handle symbolic references
  if (parsed.symbolic === 'HEAD' && plan.changes.length > 0) {
    return { change: plan.changes[plan.changes.length - 1].name };
  }
  if (parsed.symbolic === 'ROOT' && plan.changes.length > 0) {
    return { change: plan.changes[0].name };
  }
  
  // Handle relative references
  if (parsed.relative) {
    const baseResolved = resolveReference(parsed.relative.base, plan, currentPackage);
    if (baseResolved.error) {
      return baseResolved;
    }
    
    // Get the change name from the resolved reference
    const baseChange = baseResolved.change;
    if (!baseChange) {
      return { error: `Cannot resolve base reference: ${parsed.relative.base}` };
    }
    
    const changeIndex = plan.changes.findIndex(c => c.name === baseChange);
    if (changeIndex === -1) {
      return { error: `Change not found: ${baseChange}` };
    }
    
    let targetIndex: number;
    if (parsed.relative.direction === '^') {
      // Go backwards
      targetIndex = changeIndex - parsed.relative.count;
    } else {
      // Go forwards
      targetIndex = changeIndex + parsed.relative.count;
    }
    
    if (targetIndex < 0 || targetIndex >= plan.changes.length) {
      return { error: `Relative reference out of bounds: ${ref}` };
    }
    
    return { change: plan.changes[targetIndex].name };
  }
  
  // Handle tag references
  if (parsed.tag) {
    const tag = plan.tags.find(t => t.name === parsed.tag);
    if (!tag) {
      return { error: `Tag not found: ${parsed.tag}` };
    }
    return { tag: parsed.tag, change: tag.change };
  }
  
  // Handle change@tag format
  if (parsed.change && parsed.tag) {
    return { change: parsed.change, tag: parsed.tag };
  }
  
  // Plain change reference
  if (parsed.change) {
    // Validate that the change exists in the plan
    const changeExists = plan.changes.some(c => c.name === parsed.change);
    if (!changeExists) {
      return { error: `Change not found: ${parsed.change}` };
    }
    return { change: parsed.change };
  }
  
  return { error: `Cannot resolve reference: ${ref}` };
}

/**
 * Simple plan file parser without validation (for backwards compatibility)
 */
export function parsePlanFileSimple(planPath: string): PlanFile {
  const result = parsePlanFile(planPath);
  
  if (result.data) {
    // Return without tags for simple format
    const { tags, ...planWithoutTags } = result.data;
    return planWithoutTags;
  }
  
  // If there are errors, throw with details
  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
    throw errors.PLAN_PARSE_ERROR({ planPath, errors: errorMessages });
  }
  
  // Return empty plan if no data and no errors
  return { package: '', uri: '', changes: [] };
}

/**
 * Get all change names from a plan file
 */
export function getChanges(planPath: string): string[] {
  const plan = parsePlanFileSimple(planPath);
  return plan.changes.map(change => change.name);
}

/**
 * Get the latest (last) change from a plan file
 */
export function getLatestChange(planPath: string): string {
  const changes = getChanges(planPath);
  return changes[changes.length - 1] || '';
}
