/**
 * Validators for Sqitch change and tag names according to the spec:
 * https://sqitch.org/docs/manual/sqitchchanges/
 */

/**
 * Check if a character is punctuation (excluding underscore)
 */
function isPunctuation(char: string): boolean {
  // Common punctuation marks, excluding underscore
  const punctuation = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^`{|}~]/;
  return punctuation.test(char);
}

/**
 * Validate a change name according to Sqitch rules:
 * - ≥1 character
 * - Cannot contain whitespace
 * - First and last characters must not be punctuation (except _)
 * - Must not end in ~, ^, /, = or % followed by digits
 * - Disallowed characters anywhere: :, @, #, \
 */
export function isValidChangeName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }

  // Check for whitespace
  if (/\s/.test(name)) {
    return false;
  }

  // Check for disallowed characters anywhere
  if (/[:@#\\]/.test(name)) {
    return false;
  }

  // Check first character - must not be punctuation except underscore
  const firstChar = name[0];
  if (firstChar !== '_' && isPunctuation(firstChar)) {
    return false;
  }

  // Check last character - must not be punctuation except underscore
  const lastChar = name[name.length - 1];
  if (lastChar !== '_' && isPunctuation(lastChar)) {
    return false;
  }

  // Check for endings like ~N, ^N, /N, =N, %N where N is digits
  if (/[~^/=%]\d+$/.test(name)) {
    return false;
  }

  return true;
}

/**
 * Validate a tag name according to Sqitch rules:
 * - Same as change name rules
 * - Additionally, must not contain /
 */
export function isValidTagName(name: string): boolean {
  if (!isValidChangeName(name)) {
    return false;
  }

  // Tags must not contain /
  if (name.includes('/')) {
    return false;
  }

  return true;
}

/**
 * Parse a reference that might include project qualifier and/or tag
 * Examples:
 * - "users_table"
 * - "@v1.0"
 * - "users_table@v1.0"
 * - "otherproj:users_table"
 * - "otherproj:@v1.2"
 * - "otherproj:users_table@v1.2"
 * - "40763784148fa190d75bad036730ef44d1c2eac6"
 * - "project:40763784148fa190d75bad036730ef44d1c2eac6"
 */
export interface ParsedReference {
  package?: string;
  change?: string;
  tag?: string;
  sha1?: string;
  symbolic?: 'HEAD' | 'ROOT';
  relative?: {
    base: string;
    direction: '^' | '~';
    count: number;
  };
}

/**
 * Check if a string is a valid SHA1 hash (40 hex characters)
 */
function isSHA1(str: string): boolean {
  return /^[0-9a-f]{40}$/i.test(str);
}

/**
 * Parse a reference string into its components
 */
export function parseReference(ref: string): ParsedReference | null {
  if (!ref) {
    return null;
  }

  const result: ParsedReference = {};

  // Check for package qualifier
  let workingRef = ref;
  const colonIndex = ref.indexOf(':');
  if (colonIndex > 0) {
    const projectPart = ref.substring(0, colonIndex);
    const remainingPart = ref.substring(colonIndex + 1);
    
    // Check if this is actually a package qualifier or just a colon in the name
    // Package names should be valid identifiers (alphanumeric, dash, underscore)
    // Also check that the remaining part doesn't have more colons
    if (/^[a-zA-Z0-9_-]+$/.test(projectPart) && 
        remainingPart.length > 0 && 
        remainingPart.indexOf(':') === -1) {
      result.package = projectPart;
      workingRef = remainingPart;
    } else {
      // Not a valid package qualifier, treat the whole thing as a reference
      workingRef = ref;
    }
  }

  // Check for symbolic references
  if (workingRef === 'HEAD' || workingRef === '@HEAD') {
    result.symbolic = 'HEAD';
    return result;
  }
  if (workingRef === 'ROOT' || workingRef === '@ROOT') {
    result.symbolic = 'ROOT';
    return result;
  }

  // Check for relative references (e.g., HEAD^, @beta~2, HEAD^^)
  // Handle multiple ^ characters
  const multiCaretMatch = workingRef.match(/^(.+?)(\^+)$/);
  if (multiCaretMatch) {
    const [, base, carets] = multiCaretMatch;
    result.relative = {
      base: base, // Keep the original base including @ prefix
      direction: '^',
      count: carets.length
    };
    return result;
  }
  
  // Handle ^N or ~N format
  const relativeMatch = workingRef.match(/^(.+?)([~^])(\d+)$/);
  if (relativeMatch) {
    const [, base, direction, countStr] = relativeMatch;
    const count = parseInt(countStr, 10);
    
    result.relative = {
      base: base, // Keep the original base including @ prefix
      direction: direction as '^' | '~',
      count
    };
    return result;
  }
  
  // Handle single ^ or ~ without number
  const singleRelativeMatch = workingRef.match(/^(.+?)([~^])$/);
  if (singleRelativeMatch) {
    const [, base, direction] = singleRelativeMatch;
    
    result.relative = {
      base: base, // Keep the original base including @ prefix
      direction: direction as '^' | '~',
      count: 1
    };
    return result;
  }

  // Check if it's a SHA1
  if (isSHA1(workingRef)) {
    result.sha1 = workingRef;
    return result;
  }

  // Check for tag reference (starts with @)
  if (workingRef.startsWith('@')) {
    const tagName = workingRef.substring(1);
    if (isValidTagName(tagName)) {
      result.tag = tagName;
      return result;
    }
    return null; // Invalid tag name
  }

  // Check for change@tag format
  const atIndex = workingRef.indexOf('@');
  if (atIndex > 0) {
    const changeName = workingRef.substring(0, atIndex);
    const tagName = workingRef.substring(atIndex + 1);
    
    if (isValidChangeName(changeName) && isValidTagName(tagName)) {
      result.change = changeName;
      result.tag = tagName;
      return result;
    }
    return null; // Invalid change or tag name
  }

  // Must be a plain change name
  if (isValidChangeName(workingRef)) {
    result.change = workingRef;
    return result;
  }

  return null; // Invalid reference
}

/**
 * Validate a dependency reference
 * Dependencies can be any valid reference format
 */
export function isValidDependency(dep: string): boolean {
  return parseReference(dep) !== null;
}
