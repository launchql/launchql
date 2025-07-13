import { readFileSync } from 'fs';
import { Change, PlanFile } from '../types';
import { isValidChangeName, isValidTagName, isValidDependency, parseReference } from './validators';

export interface Tag {
  name: string;
  change: string;
  timestamp?: string;
  planner?: string;
  email?: string;
  comment?: string;
}

export interface ExtendedPlanFile extends PlanFile {
  tags: Tag[];
}

export interface ParseError {
  line: number;
  message: string;
  content: string;
}

export interface ParseResult {
  plan?: ExtendedPlanFile;
  errors: ParseError[];
}

/**
 * Parse a Sqitch plan file with full validation
 * Supports both changes and tags
 */
export function parsePlanFileWithValidation(planPath: string): ParseResult {
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
    if (trimmed.startsWith('%')) {
      continue;
    }
    
    // Parse tag lines
    if (trimmed.startsWith('@')) {
      const tag = parseTagLine(trimmed);
      if (tag) {
        if (isValidTagName(tag.name)) {
          tags.push(tag);
        } else {
          errors.push({
            line: lineNum,
            message: `Invalid tag name: ${tag.name}`,
            content: trimmed
          });
        }
      } else {
        errors.push({
          line: lineNum,
          message: 'Invalid tag line format',
          content: trimmed
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
          message: `Invalid change name: ${change.name}`,
          content: trimmed
        });
        continue;
      }
      
      // Validate dependencies
      for (const dep of change.dependencies) {
        if (!isValidDependency(dep)) {
          errors.push({
            line: lineNum,
            message: `Invalid dependency reference: ${dep}`,
            content: trimmed
          });
        }
      }
      
      changes.push(change);
    } else if (trimmed) {
      // Non-empty line that couldn't be parsed
      errors.push({
        line: lineNum,
        message: 'Invalid line format',
        content: trimmed
      });
    }
  }
  
  if (errors.length > 0) {
    return { errors };
  }
  
  return {
    plan: { project, uri, changes, tags },
    errors: []
  };
}

/**
 * Parse a single change line from a plan file
 * Format: change_name [deps] timestamp planner <email> # comment
 */
function parseChangeLine(line: string): Change | null {
  // More flexible regex that handles various formats
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
 * Parse a tag line from a plan file
 * Format: @tag_name change_name timestamp planner <email> # comment
 */
function parseTagLine(line: string): Tag | null {
  // Tag lines start with @
  if (!line.startsWith('@')) {
    return null;
  }
  
  // Remove the @ and parse similar to change line
  const tagContent = line.substring(1);
  const regex = /^(\S+)\s+(\S+)(?:\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z))?(?:\s+(\S+))?(?:\s+<([^>]+)>)?(?:\s+#\s+(.*))?$/;
  
  const match = tagContent.match(regex);
  if (!match) {
    return null;
  }
  
  const [, name, change, timestamp, planner, email, comment] = match;
  
  return {
    name,
    change,
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
  currentProject?: string
): { change?: string; tag?: string; error?: string } {
  const parsed = parseReference(ref);
  if (!parsed) {
    return { error: `Invalid reference: ${ref}` };
  }
  
  // Handle project qualifier
  const planProject = currentProject || plan.project;
  if (parsed.project && parsed.project !== planProject) {
    // Cross-project reference - return as-is
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
    const baseResolved = resolveReference(parsed.relative.base, plan, currentProject);
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
    return { change: parsed.change };
  }
  
  return { error: `Cannot resolve reference: ${ref}` };
}