import { Readable } from 'stream';

import { FileTypeDetector } from '../src';

async function main() {
  // Create a detector instance
  const detector = new FileTypeDetector();

  // Example 1: Detect from a buffer (already-read data)
  console.log('=== Example 1: Detect from Buffer ===');
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
  ]);
  
  const pngResult = await detector.detectFromBuffer(pngBuffer);
  console.log('PNG Detection:', pngResult);

  // Example 2: Detect from a stream (memory efficient)
  console.log('\n=== Example 2: Detect from Stream ===');
  const jpegData = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01
  ]);
  
  const stream = Readable.from([jpegData]);
  const jpegResult = await detector.detectFromStream(stream);
  console.log('JPEG Detection:', jpegResult);

  // Example 3: Detect by extension
  console.log('\n=== Example 3: Detect by Extension ===');
  const extensionResults = detector.detectFromExtension('.pdf');
  console.log('PDF Extension Detection:', extensionResults);

  // Example 4: Get file types by category
  console.log('\n=== Example 4: Get by Category ===');
  const imageTypes = detector.getByCategory('image');
  console.log(`Found ${imageTypes.length} image types`);
  console.log('First 5 image types:', imageTypes.slice(0, 5).map(t => t.name));

  // Example 5: Detect with fallback
  console.log('\n=== Example 5: Detect with Fallback ===');
  const unknownData = Buffer.from([0x00, 0x11, 0x22, 0x33]);
  const unknownStream = Readable.from([unknownData]);
  const fallbackResult = await detector.detectWithFallback(unknownStream, 'document.docx');
  console.log('Fallback Detection:', fallbackResult);

  // Example 6: Check specific file type
  console.log('\n=== Example 6: Check Specific Type ===');
  const isPng = detector.isFileType(pngBuffer, 'png');
  const isJpeg = detector.isFileType(pngBuffer, 'jpeg');
  console.log('Is PNG?', isPng);
  console.log('Is JPEG?', isJpeg);

  // Example 7: Get statistics
  console.log('\n=== Example 7: Statistics ===');
  const stats = detector.getStatistics();
  console.log('Total registered types:', stats.totalTypes);
  console.log('Types by category:', stats.byCategory);
  console.log('Types by MIME prefix:', stats.byMimePrefix);
}

// Run the examples
main().catch(console.error);