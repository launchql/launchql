const { streamContentType } = require('../dist');
const { createReadStream } = require('fs');
const { join } = require('path');

async function testMigration() {
  console.log('Testing content-type-stream with mime-bytes...\n');

  // Test with a PDF file
  const pdfPath = join(__dirname, '../../../__fixtures__/kitchen-sink/pdf.pdf');
  const pdfStream = createReadStream(pdfPath);
  
  try {
    const pdfResult = await streamContentType({
      readStream: pdfStream,
      filename: 'test.pdf'
    });
    
    console.log('PDF Detection:');
    console.log('  Content-Type:', pdfResult.contentType);
    console.log('  MIME Type:', pdfResult.magic.type);
    console.log('  Charset:', pdfResult.magic.charset);
    console.log('  Stream available:', !!pdfResult.stream);
    console.log();
  } catch (error) {
    console.error('Error detecting PDF:', error);
  }

  // Test with a TypeScript file
  const tsPath = join(__dirname, '../../../__fixtures__/kitchen-sink/typescript.ts');
  const tsStream = createReadStream(tsPath);
  
  try {
    const tsResult = await streamContentType({
      readStream: tsStream,
      filename: 'test.ts'
    });
    
    console.log('TypeScript Detection:');
    console.log('  Content-Type:', tsResult.contentType);
    console.log('  MIME Type:', tsResult.magic.type);
    console.log('  Charset:', tsResult.magic.charset);
    console.log('  Stream available:', !!tsResult.stream);
    console.log();
  } catch (error) {
    console.error('Error detecting TypeScript:', error);
  }

  // Test with an image
  const imagePath = join(__dirname, '../../../__fixtures__/kitchen-sink/apng.png');
  const imageStream = createReadStream(imagePath);
  
  try {
    const imageResult = await streamContentType({
      readStream: imageStream,
      filename: 'test.png'
    });
    
    console.log('PNG Detection:');
    console.log('  Content-Type:', imageResult.contentType);
    console.log('  MIME Type:', imageResult.magic.type);
    console.log('  Charset:', imageResult.magic.charset);
    console.log('  Stream available:', !!imageResult.stream);
  } catch (error) {
    console.error('Error detecting PNG:', error);
  }
}

testMigration().catch(console.error);