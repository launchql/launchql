// Magic bytes utility functions

export function hexToBuffer(hexArray: string[]): Buffer {
  const bytes = hexArray.map(hex => {
    if (hex === '?') return 0; // Wildcard placeholder
    return parseInt(hex.replace(/0x/i, ''), 16);
  });
  return Buffer.from(bytes);
}

export function bufferToHex(buffer: Buffer): string {
  return buffer.toString('hex');
}

export function compareBytes(buffer: Buffer, pattern: string[], offset: number = 0): boolean {
  // Empty patterns should not match
  if (!pattern || pattern.length === 0) {
    return false;
  }
  
  if (offset + pattern.length > buffer.length) {
    return false;
  }

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '?') continue; // Skip wildcards
    
    const expectedByte = parseInt(pattern[i].replace(/0x/i, ''), 16);
    const actualByte = buffer[offset + i];
    
    if (expectedByte !== actualByte) {
      return false;
    }
  }
  
  return true;
}

export function findMagicBytes(buffer: Buffer, patterns: Array<{pattern: string[], offset?: number}>): number {
  for (let i = 0; i < patterns.length; i++) {
    const { pattern, offset = 0 } = patterns[i];
    if (compareBytes(buffer, pattern, offset)) {
      return i;
    }
  }
  return -1;
}

// Extract a specific number of bytes from buffer at offset
export function extractBytes(buffer: Buffer, offset: number, length: number): Buffer {
  if (offset + length > buffer.length) {
    return buffer.slice(offset);
  }
  return buffer.slice(offset, offset + length);
}

// Check if buffer contains text-like content
export function isTextLike(buffer: Buffer): boolean {
  const sampleSize = Math.min(buffer.length, 512);
  let printableCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];
    // Check for printable ASCII characters, tabs, newlines, carriage returns
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
      printableCount++;
    }
  }
  
  // If more than 85% are printable characters, likely text
  return (printableCount / sampleSize) > 0.85;
}