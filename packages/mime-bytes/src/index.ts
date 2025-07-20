// Main export file for mime-bytes package

// Export the main detector class and convenience functions
export {
  defaultDetector,
  detectFromBuffer,
  detectFromExtension,
  detectFromStream,
  FileTypeDetector,
  FileTypeDetectorOptions} from './file-type-detector';

// Export registry types and functions
export {
  CONTENT_TYPE_MAPPINGS,
  ContentTypeMapping,
  detectCharset,
  DetectionResult,
  FILE_TYPES,
  FileTypeDefinition,
  getContentTypeByExtension,
  getFileTypeByExtension,
  getFileTypeByMagicBytes,
  getFileTypesByCategory} from './file-types-registry';

// Export peek stream functionality
export {
  BufferPeekStream,
  peek,
  PeekCallback,
  PeekPromise,
  PeekStreamOptions} from './peak';

// Export utility functions
export * from './utils/extensions';
export * from './utils/magic-bytes';
export * from './utils/mime-types';