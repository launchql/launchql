import { createReadStream } from 'fs';
import { glob } from 'glob';
import path from 'path';

import { FileTypeDetector } from '../../src/file-type-detector';

describe('Malicious Fixtures', () => {
  let detector: FileTypeDetector;
  
  beforeAll(() => {
    detector = new FileTypeDetector();
  });

  test('should detect true file type despite wrong extension', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/malicious');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    const detectionResults: Record<string, any> = {};
    
    for (const file of files) {
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      const fileExtension = path.extname(file).toLowerCase().replace('.', '');
      
      try {
        const detectedType = await detector.detectFromStream(stream);
        
        if (detectedType) {
          detectionResults[file] = {
            contentType: detectedType.contentType,
            magic: {
              charset: detectedType.charset,
              type: detectedType.mimeType,
              name: detectedType.name,
              extensions: detectedType.extensions,
              confidence: detectedType.confidence
            },
            claimedExtension: fileExtension,
            extensionMismatch: !detectedType.extensions.includes(fileExtension)
          };
        } else {
          detectionResults[file] = {
            contentType: null,
            magic: null,
            claimedExtension: fileExtension,
            extensionMismatch: false
          };
        }
      } catch (error) {
        detectionResults[file] = {
          contentType: null,
          magic: null,
          claimedExtension: fileExtension,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    // Create snapshot
    expect(detectionResults).toMatchSnapshot();
    
    // Calculate detection rate
    const totalFiles = Object.keys(detectionResults).length;
    const correctDetections = Object.values(detectionResults).filter(r => r.extensionMismatch === true).length;
    
    // We expect to detect at least some malicious files correctly
    if (totalFiles > 0) {
      expect(correctDetections).toBeGreaterThan(0);
    }
  });

  test('should handle corrupted or invalid files gracefully', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/malicious');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    const errorHandlingResults: Record<string, any> = {};
    
    for (const file of files) {
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      
      try {
        const detectedType = await detector.detectWithFallback(stream, file);
        
        errorHandlingResults[file] = {
          status: 'success',
          detected: detectedType !== null,
          type: detectedType?.name || null
        };
      } catch (error) {
        errorHandlingResults[file] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    // Create snapshot
    expect(errorHandlingResults).toMatchSnapshot();
    
    // All files should be handled without throwing unhandled errors
    const totalFiles = Object.keys(errorHandlingResults).length;
    const handledFiles = Object.values(errorHandlingResults).filter(r => r.status === 'success').length;
    expect(handledFiles).toBe(totalFiles);
  });

  test('should prioritize magic bytes over file extension', async () => {
    // Create test cases with known mismatches
    const testCases = [
      {
        // PNG data with wrong extension
        data: Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
        filename: 'fake.txt',
        expectedType: 'png',
        expectedMime: 'image/png'
      },
      {
        // JPEG data with wrong extension
        data: Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
        filename: 'fake.pdf',
        expectedType: 'jpeg',
        expectedMime: 'image/jpeg'
      },
      {
        // ZIP data with wrong extension
        data: Buffer.from([0x50, 0x4B, 0x03, 0x04]),
        filename: 'fake.doc',
        expectedType: 'zip',
        expectedMime: 'application/zip'
      }
    ];
    
    const magicBytesResults: Record<string, any> = {};
    
    for (const testCase of testCases) {
      const result = await detector.detectFromBuffer(testCase.data);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe(testCase.expectedType);
      expect(result?.mimeType).toBe(testCase.expectedMime);
      
      magicBytesResults[testCase.filename] = {
        detectedType: result?.name,
        detectedMime: result?.mimeType,
        expectedType: testCase.expectedType,
        expectedMime: testCase.expectedMime,
        correct: result?.name === testCase.expectedType
      };
    }
    
    expect(magicBytesResults).toMatchSnapshot();
  });

  test('should detect polyglot files', async () => {
    // Test files that are valid in multiple formats
    // Example: GIFAR (GIF + RAR), PDFZIP (PDF + ZIP)
    
    const polyglotResults: Record<string, any> = {};
    
    // GIFAR: GIF header followed by RAR
    const gifarData = Buffer.concat([
      Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
      Buffer.from([0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]), // Minimal GIF data
      Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00]) // RAR signature
    ]);
    
    const gifarResult = await detector.detectFromBuffer(gifarData);
    expect(gifarResult).toBeDefined();
    expect(gifarResult?.name).toBe('gif89a'); // Should detect as GIF (first valid signature)
    
    polyglotResults['GIFAR'] = {
      description: 'GIF + RAR polyglot',
      detectedAs: gifarResult?.name,
      expectedAs: 'gif89a',
      correct: gifarResult?.name === 'gif89a'
    };
    
    // PDFZIP: PDF header followed by ZIP
    const pdfzipData = Buffer.concat([
      Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
      Buffer.from('-1.4\n'),
      Buffer.from([0x50, 0x4B, 0x03, 0x04]) // ZIP signature
    ]);
    
    const pdfzipResult = await detector.detectFromBuffer(pdfzipData);
    expect(pdfzipResult).toBeDefined();
    expect(pdfzipResult?.name).toBe('pdf'); // Should detect as PDF (first valid signature)
    
    polyglotResults['PDFZIP'] = {
      description: 'PDF + ZIP polyglot',
      detectedAs: pdfzipResult?.name,
      expectedAs: 'pdf',
      correct: pdfzipResult?.name === 'pdf'
    };
    
    expect(polyglotResults).toMatchSnapshot();
  });
});