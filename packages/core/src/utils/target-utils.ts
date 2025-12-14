import { errors } from '@pgpmjs/types';

export interface ParsedTarget {
  packageName: string;
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
      throw errors.INVALID_NAME({ name: target, type: 'tag', rules: 'Expected format: package:@tagName' });
    }
    
    // Check if this is a simple package:@tag format
    if (!beforeAt.includes(':')) {
      if (!beforeAt) {
        throw errors.INVALID_NAME({ name: target, type: 'tag', rules: 'Expected format: package:@tagName' });
      }
      return { packageName: beforeAt, toChange: `@${afterAt}` };
    }
    
    throw errors.INVALID_NAME({ name: target, type: 'change', rules: 'Expected formats: package, package:changeName, or package:@tagName' });
  }
  
  if (target.includes(':') && !target.includes('@')) {
    const parts = target.split(':');
    
    if (parts.length > 2) {
      throw errors.INVALID_NAME({ name: target, type: 'change', rules: 'Expected formats: package, package:changeName, or package:@tagName' });
    }
    
    const [packageName, changeName] = parts;
    
    if (!packageName || !changeName) {
      throw errors.INVALID_NAME({ name: target, type: 'change', rules: 'Expected format: package:changeName' });
    }
    
    return { packageName, toChange: changeName };
  }
  
  if (!target.includes(':')) {
    return { packageName: target, toChange: undefined };
  }

  throw errors.INVALID_NAME({ name: target, type: 'change', rules: 'Expected formats: package, package:changeName, or package:@tagName' });
}
