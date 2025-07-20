// Main file type detector class with stream-focused API

import { Readable } from 'stream';

import {
  detectCharset,
  DetectionResult,
  FILE_TYPES,
  FileTypeDefinition,
  getContentTypeByExtension,
  getContentTypeForExtension,
  getFileTypeByExtension,
  getFileTypesByCategory} from './file-types-registry';
import {peek } from './peak';
import {normalizeExtension } from './utils/extensions';
import { compareBytes } from './utils/magic-bytes';
import { resolveMimeAlias } from './utils/mime-types';

export interface FileTypeDetectorOptions {
  peekBytes?: number; // Number of bytes to peek (default: 32)
  checkMultipleOffsets?: boolean; // Check multiple offsets (default: true)
  maxOffset?: number; // Maximum offset to check (default: 12)
}

export class FileTypeDetector {
  private fileTypes: FileTypeDefinition[];
  private options: Required<FileTypeDetectorOptions>;
  private magicBytesCache: Map<string, FileTypeDefinition | null>;
  private extensionCache: Map<string, FileTypeDefinition[]>;

  constructor(options: FileTypeDetectorOptions = {}) {
    // Create a copy of FILE_TYPES to avoid modifying the global registry
    this.fileTypes = [...FILE_TYPES];
    this.options = {
      peekBytes: options.peekBytes || 32,
      checkMultipleOffsets: options.checkMultipleOffsets !== false,
      maxOffset: options.maxOffset || 12
    };
    this.magicBytesCache = new Map();
    this.extensionCache = new Map();
  }

  /**
   * Detect file type from a stream (PRIMARY METHOD - memory efficient)
   * @param stream - Readable stream to detect from
   * @returns Detection result or null if not detected
   */
  async detectFromStream(stream: Readable): Promise<DetectionResult | null> {
    try {
      const [buffer, peekStream] = await peek.promise(stream, this.options.peekBytes);
      
      // Check multiple offsets for different file types
      const result = await this.detectFromBuffer(buffer);
      
      // Important: Return the peek stream so it can be used for further processing
      // The caller should use peekStream instead of the original stream
      if (result) {
        (result as any)._stream = peekStream;
      }
      
      return result;
    } catch (error) {
      // Handle stream errors gracefully
      // Only log errors in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error detecting file type from stream:', error);
      }
      return null;
    }
  }

  /**
   * Detect file type from an already-read buffer
   * @param buffer - Buffer to detect from
   * @returns Detection result or null if not detected
   */
  async detectFromBuffer(buffer: Buffer): Promise<DetectionResult | null> {
    if (!buffer || buffer.length === 0) {
      return null;
    }

    // Check multiple offsets if enabled
    const offsets = this.options.checkMultipleOffsets 
      ? this.generateOffsets(buffer.length)
      : [0];

    for (const offset of offsets) {
      const fileType = this.checkMagicBytesAtOffset(buffer, offset);
      if (fileType) {
        return this.enhanceDetectionResult(fileType, buffer);
      }
    }

    // No magic bytes matched, but we can still detect charset for unknown files
    const charset = detectCharset(buffer);
    if (charset !== 'binary') {
      // Return a generic text file result
      return {
        name: 'text',
        mimeType: 'text/plain',
        extensions: ['txt'],
        charset,
        contentType: 'text/plain',
        confidence: 0.5 // Lower confidence since we only detected charset
      };
    }

    return null;
  }

  /**
   * Detect file type from extension only
   * @param extension - File extension (with or without dot)
   * @returns Array of possible detection results with lower confidence
   */
  detectFromExtension(extension: string): DetectionResult[] {
    const cleanExt = normalizeExtension(extension);
    
    // Check cache first
    if (this.extensionCache.has(cleanExt)) {
      const cachedTypes = this.extensionCache.get(cleanExt)!;
      return cachedTypes.map(fileType => ({
        name: fileType.name,
        mimeType: resolveMimeAlias(fileType.mimeType),
        extensions: fileType.extensions,
        charset: 'unknown', // Can't determine charset from extension alone
        contentType: getContentTypeByExtension(cleanExt) || fileType.mimeType,
        confidence: 0.8 // Lower confidence for extension-only detection
      }));
    }
    
    const fileTypes = getFileTypeByExtension(cleanExt);
    
    // Cache the result
    this.extensionCache.set(cleanExt, fileTypes);
    
    return fileTypes.map(fileType => ({
      name: fileType.name,
      mimeType: resolveMimeAlias(fileType.mimeType),
      extensions: fileType.extensions,
      charset: 'unknown', // Can't determine charset from extension alone
      contentType: getContentTypeByExtension(cleanExt) || fileType.mimeType,
      confidence: 0.8 // Lower confidence for extension-only detection
    }));
  }

  /**
   * Get all file types by category
   * @param category - Category name (e.g., 'image', 'video', 'archive')
   * @returns Array of file type definitions
   */
  getByCategory(category: string): FileTypeDefinition[] {
    return getFileTypesByCategory(category);
  }

  /**
   * Add a new file type dynamically
   * @param fileType - File type definition to add
   */
  addFileType(fileType: FileTypeDefinition): void {
    this.fileTypes.push(fileType);
    // Clear caches when file types change
    this.clearCache();
  }

  /**
   * Remove a file type by name
   * @param name - Name of the file type to remove
   */
  removeFileType(name: string): boolean {
    const index = this.fileTypes.findIndex(ft => ft.name === name);
    if (index !== -1) {
      this.fileTypes.splice(index, 1);
      // Clear caches when file types change
      this.clearCache();
      return true;
    }
    return false;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.magicBytesCache.clear();
    this.extensionCache.clear();
  }

  /**
   * Get all registered file types
   * @returns Array of all file type definitions
   */
  getAllFileTypes(): FileTypeDefinition[] {
    return [...this.fileTypes];
  }

  /**
   * Check magic bytes at a specific offset
   * @private
   */
  private checkMagicBytesAtOffset(buffer: Buffer, offset: number): FileTypeDefinition | null {
    // Check each file type in order
    for (const fileType of this.fileTypes) {
      // Skip if this file type requires a different offset
      if (fileType.offset !== undefined && fileType.offset !== offset) continue;
      
      // Skip if offset is not 0 and file type doesn't specify an offset
      if (offset > 0 && fileType.offset === undefined) continue;
      
      // Check if magic bytes match
      if (compareBytes(buffer, fileType.magicBytes, offset)) {
        return fileType;
      }
    }
    
    return null;
  }

  /**
   * Generate offsets to check based on buffer size
   * @private
   */
  private generateOffsets(bufferLength: number): number[] {
    const offsets: number[] = [];
    for (let i = 0; i <= this.options.maxOffset && i < bufferLength; i += 4) {
      offsets.push(i);
    }
    return offsets;
  }

  /**
   * Enhance detection result with additional information
   * @private
   */
  private enhanceDetectionResult(fileType: FileTypeDefinition, buffer: Buffer): DetectionResult {
    // Use charset from file type definition if available, otherwise detect it
    const charset = fileType.charset || detectCharset(buffer);
    
    // Determine content type based on extension and charset
    let contentType = fileType.contentType || fileType.mimeType;
    
    // Try charset-aware content type lookup first
    if (fileType.extensions.length > 0) {
      const primaryExt = fileType.extensions[0];
      const charsetAwareContentType = getContentTypeForExtension(primaryExt, charset);
      
      if (charsetAwareContentType) {
        contentType = charsetAwareContentType;
      } else if (!fileType.contentType) {
        // Fall back to regular content type lookup if no charset-specific match
        const inferredContentType = getContentTypeByExtension(primaryExt);
        if (inferredContentType) {
          contentType = inferredContentType;
        }
      }
    }

    return {
      name: fileType.name,
      mimeType: resolveMimeAlias(fileType.mimeType),
      extensions: fileType.extensions,
      charset,
      contentType: resolveMimeAlias(contentType),
      confidence: 1.0 // High confidence for magic bytes detection
    };
  }

  /**
   * Detect file type with fallback to extension
   * @param input - Readable stream or Buffer
   * @param filename - Optional filename for extension fallback
   * @returns Detection result with attached stream for reuse (if input was stream)
   */
  async detectWithFallback(input: Readable | Buffer, filename?: string): Promise<(DetectionResult & { _stream?: Readable }) | null> {
    try {
      let buffer: Buffer;
      let peekStream: Readable | undefined;
      
      // Handle both Buffer and Readable inputs
      if (Buffer.isBuffer(input)) {
        buffer = input;
      } else {
        const peekResult = await peek.promise(input, this.options.peekBytes);
        buffer = peekResult[0];
        peekStream = peekResult[1];
      }
      
      // Try magic bytes detection first
      const magicResult = await this.detectFromBuffer(buffer);
      
      if (magicResult) {
        // If we have a filename, try to enhance with more specific content type
        if (filename) {
          const lastDot = filename.lastIndexOf('.');
          if (lastDot !== -1) {
            const extension = filename.substring(lastDot + 1);
            
            // Check for generic text files that might have specific content types
            if (magicResult.mimeType === 'text/plain' && magicResult.charset) {
              const contentType = getContentTypeForExtension(extension, magicResult.charset);
              if (contentType) {
                // Enhance the result with charset-aware content type
                const enhancedResult = {
                  ...magicResult,
                  contentType,
                  confidence: 0.8 // Higher confidence since we have both magic bytes and extension
                };
                return peekStream ? { ...enhancedResult, _stream: peekStream } : enhancedResult;
              }
            }
            
            // Check for ZIP files that might be Office Open XML or other specific formats
            if (magicResult.name === 'zip' || magicResult.mimeType === 'application/zip') {
              const contentType = getContentTypeForExtension(extension, magicResult.charset || 'binary');
              if (contentType && contentType !== 'application/zip') {
                // Enhance the result with more specific content type
                const enhancedResult = {
                  ...magicResult,
                  contentType,
                  confidence: 0.9 // High confidence for known ZIP-based formats
                };
                return peekStream ? { ...enhancedResult, _stream: peekStream } : enhancedResult;
              }
            }
          }
        }
        
        // Attach the peek stream for reuse if available
        return peekStream ? { ...magicResult, _stream: peekStream } : magicResult;
      }

      // Fallback to extension if filename provided
      if (filename) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot !== -1) {
          const extension = filename.substring(lastDot + 1);
          const charset = detectCharset(buffer);
          
          // Try charset-aware content type lookup
          const contentType = getContentTypeForExtension(extension, charset);
          
          if (contentType) {
            // Create a result based on extension and detected charset
            const result: DetectionResult = {
              name: extension.toLowerCase(),
              mimeType: contentType,
              extensions: [extension.toLowerCase()],
              charset,
              contentType,
              confidence: 0.7 // Higher confidence when charset matches
            };
            
            return peekStream ? { ...result, _stream: peekStream } : result;
          }
          
          // Fall back to regular extension detection
          const extensionResults = this.detectFromExtension(extension);
          if (extensionResults.length > 0) {
            const result = {
              ...extensionResults[0],
              charset, // Use detected charset
              confidence: 0.6 // Lower confidence for fallback
            };
            
            // Update content type if charset-specific mapping exists
            const charsetContentType = getContentTypeForExtension(extension, charset);
            if (charsetContentType) {
              result.contentType = charsetContentType;
            }
            
            return peekStream ? { ...result, _stream: peekStream } : result;
          }
        }
      }

      // No detection possible
      return null;
    } catch (error) {
      // Only log errors in non-test environments
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error in detectWithFallback:', error);
      }
      return null;
    }
  }

  /**
   * Check if a buffer matches a specific file type
   * @param buffer - Buffer to check
   * @param fileTypeName - Name of the file type to check against
   * @returns True if matches, false otherwise
   */
  isFileType(buffer: Buffer, fileTypeName: string): boolean {
    const fileType = this.fileTypes.find(ft => ft.name === fileTypeName);
    if (!fileType) return false;

    const offset = fileType.offset || 0;
    return compareBytes(buffer, fileType.magicBytes, offset);
  }

  /**
   * Get statistics about registered file types
   * @returns Statistics object
   */
  getStatistics(): {
    totalTypes: number;
    byCategory: Record<string, number>;
    byMimePrefix: Record<string, number>;
    } {
    const stats = {
      totalTypes: this.fileTypes.length,
      byCategory: {} as Record<string, number>,
      byMimePrefix: {} as Record<string, number>
    };

    for (const fileType of this.fileTypes) {
      // Count by category
      const category = fileType.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by MIME prefix
      const mimePrefix = fileType.mimeType.split('/')[0];
      stats.byMimePrefix[mimePrefix] = (stats.byMimePrefix[mimePrefix] || 0) + 1;
    }

    return stats;
  }
}

// Export a default instance for convenience
export const defaultDetector = new FileTypeDetector();

// Convenience functions using the default detector
export async function detectFromStream(stream: Readable): Promise<DetectionResult | null> {
  return defaultDetector.detectFromStream(stream);
}

export async function detectFromBuffer(buffer: Buffer): Promise<DetectionResult | null> {
  return defaultDetector.detectFromBuffer(buffer);
}

export function detectFromExtension(extension: string): DetectionResult[] {
  return defaultDetector.detectFromExtension(extension);
}