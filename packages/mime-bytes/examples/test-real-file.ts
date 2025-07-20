import { createReadStream } from 'fs';
import path from 'path';

import { FileTypeDetector } from '../src';

async function testRealFile() {
  const detector = new FileTypeDetector();
  
  // Test with a real PNG file
  const pngPath = path.join(__dirname, '../../../__fixtures__/kitchen-sink/png-w-alpha.png');
  const pngStream = createReadStream(pngPath);
  
  console.log('Testing real PNG file:', pngPath);
  const result = await detector.detectFromStream(pngStream);
  
  console.log('Detection result:', result);
  
  if (result) {
    console.log('\n✅ Successfully detected:');
    console.log(`   Name: ${result.name}`);
    console.log(`   MIME Type: ${result.mimeType}`);
    console.log(`   Extensions: ${result.extensions.join(', ')}`);
    console.log(`   Charset: ${result.charset}`);
    console.log(`   Confidence: ${result.confidence}`);
  } else {
    console.log('❌ Failed to detect file type');
  }
}

testRealFile().catch(console.error);