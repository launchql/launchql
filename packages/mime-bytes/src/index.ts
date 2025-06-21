// Main export file for mime-bytes package

// Export the main detector class and convenience functions
export {
  FileTypeDetector,
  FileTypeDetectorOptions,
  defaultDetector,
  detectFromStream,
  detectFromBuffer,
  detectFromExtension
} from './file-type-detector';

// Export registry types and functions
export {
  FileTypeDefinition,
  DetectionResult,
  ContentTypeMapping,
  FILE_TYPES,
  CONTENT_TYPE_MAPPINGS,
  getFileTypeByMagicBytes,
  getFileTypeByExtension,
  getFileTypesByCategory,
  getContentTypeByExtension,
  detectCharset
} from './file-types-registry';

// Export peek stream functionality
export {
  peek,
  BufferPeekStream,
  PeekStreamOptions,
  PeekCallback,
  PeekPromise
} from './peak';

// Export utility functions
export * from './utils/magic-bytes';
export * from './utils/mime-types';
export * from './utils/extensions';