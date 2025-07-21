export interface ParsedTarget {
  projectName: string;
  toChange?: string;
}

export function parseTarget(target: string): ParsedTarget {
  if (!target) {
    throw new Error('Target parameter is required');
  }

  if (target.includes(':@')) {
    const atIndex = target.indexOf(':@');
    const beforeAt = target.substring(0, atIndex);
    const afterAt = target.substring(atIndex + 2);
    
    if (!afterAt) {
      throw new Error(`Invalid tag format: ${target}. Expected format: project:@tagName`);
    }
    
    // Check if this is a simple project:@tag format
    if (!beforeAt.includes(':')) {
      if (!beforeAt) {
        throw new Error(`Invalid tag format: ${target}. Expected format: project:@tagName`);
      }
      return { projectName: beforeAt, toChange: `${beforeAt}:@${afterAt}` };
    }
    
    const lastColonIndex = beforeAt.lastIndexOf(':');
    const projectName = beforeAt.substring(0, lastColonIndex);
    const changeName = beforeAt.substring(lastColonIndex + 1);
    
    if (!projectName || !changeName) {
      throw new Error(`Invalid tag format: ${target}. Expected format: project:@tagName`);
    }
    
    const toChange = `${changeName}:@${afterAt}`;
    return { projectName, toChange };
  }
  
  if (target.includes(':') && !target.includes('@')) {
    const parts = target.split(':');
    
    if (parts.length > 2) {
      throw new Error(`Invalid target format: ${target}. Expected formats: project, project:changeName, or project:@tagName`);
    }
    
    const [projectName, changeName] = parts;
    
    if (!projectName || !changeName) {
      throw new Error(`Invalid change format: ${target}. Expected format: project:changeName`);
    }
    
    return { projectName, toChange: changeName };
  }
  
  if (!target.includes(':')) {
    return { projectName: target, toChange: undefined };
  }

  throw new Error(`Invalid target format: ${target}. Expected formats: project, project:changeName, or project:@tagName`);
}
