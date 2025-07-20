import { createReadStream } from 'fs';
import path from 'path';

import { detectFromStream,FileTypeDetector } from '../src';

async function demonstrateUsage() {
  console.log('=== mime-bytes Usage Examples ===\n');

  // Create a detector instance
  const detector = new FileTypeDetector();

  // Example 1: Detect from stream (PRIMARY METHOD - memory efficient)
  console.log('1. Detecting from stream:');
  const pngPath = path.join(__dirname, '../../../__fixtures__/kitchen-sink/png-w-alpha.png');
  const pngStream = createReadStream(pngPath);
  
  try {
    const pngResult = await detector.detectFromStream(pngStream);
    console.log('PNG detection:', pngResult);
  } catch (error) {
    console.error('Error detecting PNG:', error);
  }

  // Example 2: Using the convenience function
  console.log('\n2. Using convenience function:');
  const jpgPath = path.join(__dirname, '../../../__fixtures__/kitchen-sink/jpg.jpg');
  const jpgStream = createReadStream(jpgPath);
  
  const jpgResult = await detectFromStream(jpgStream);
  console.log('JPEG detection:', jpgResult);

  // Example 3: Detect with fallback to extension
  console.log('\n3. Detect with fallback:');
  const textPath = path.join(__dirname, '../../../__fixtures__/kitchen-sink/txt.txt');
  const textStream = createReadStream(textPath);
  
  const textResult = await detector.detectWithFallback(textStream, 'document.txt');
  console.log('Text file detection with fallback:', textResult);

  // Example 4: Detect from buffer (for already-read data)
  console.log('\n4. Detect from buffer:');
  const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
  const pdfResult = await detector.detectFromBuffer(pdfMagicBytes);
  console.log('PDF detection from buffer:', pdfResult);

  // Example 5: Extension-based detection
  console.log('\n5. Extension-based detection:');
  const extensionResults = detector.detectFromExtension('mp4');
  console.log('MP4 extension detection:', extensionResults);

  // Example 6: Get file types by category
  console.log('\n6. Get file types by category:');
  const imageTypes = detector.getByCategory('image');
  console.log(`Found ${imageTypes.length} image types:`, imageTypes.slice(0, 5).map(ft => ft.name));

  // Example 7: Check if buffer is a specific file type
  console.log('\n7. Check specific file type:');
  const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
  const isGif = detector.isFileType(gifBuffer, 'gif89a');
  console.log('Is GIF89a?', isGif);

  // Example 8: Get statistics
  console.log('\n8. File type statistics:');
  const stats = detector.getStatistics();
  console.log('Statistics:', stats);

  // Example 9: Add custom file type
  console.log('\n9. Add custom file type:');
  detector.addFileType({
    name: 'custom-format',
    magicBytes: ['0xCA', '0xFE', '0xBA', '0xBE'],
    mimeType: 'application/x-custom',
    extensions: ['custom'],
    description: 'Custom file format',
    category: 'other',
    charset: 'binary'
  });
  
  const customBuffer = Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]);
  const customResult = await detector.detectFromBuffer(customBuffer);
  console.log('Custom format detection:', customResult);

  // Example 10: Handle large files efficiently
  console.log('\n10. Large file handling:');
  const largePath = path.join(__dirname, '../../../__fixtures__/kitchen-sink/mp4.mp4');
  const largeStream = createReadStream(largePath);
  
  const startTime = Date.now();
  const largeResult = await detector.detectFromStream(largeStream);
  const endTime = Date.now();
  
  console.log(`Large file detected as ${largeResult?.name} in ${endTime - startTime}ms`);
}

// Run the demonstration
demonstrateUsage().catch(console.error);