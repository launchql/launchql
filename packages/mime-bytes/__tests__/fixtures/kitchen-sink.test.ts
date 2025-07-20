import { createReadStream } from 'fs';
import { glob } from 'glob';
import path from 'path';

import { FileTypeDetector } from '../../src/file-type-detector';

describe('Kitchen Sink Fixtures', () => {
  let detector: FileTypeDetector;
  
  beforeAll(() => {
    detector = new FileTypeDetector();
  });

  test('should detect all kitchen sink files correctly', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/kitchen-sink');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    const detectionResults: Record<string, any> = {};
    
    for (const file of files) {
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      
      try {
        const detectedType = await detector.detectWithFallback(stream, file);
        
        if (detectedType) {
          detectionResults[file] = {
            contentType: detectedType.contentType,
            magic: {
              charset: detectedType.charset,
              type: detectedType.mimeType,
              name: detectedType.name,
              confidence: detectedType.confidence
            }
          };
        } else {
          detectionResults[file] = {
            contentType: null,
            magic: null
          };
        }
      } catch (error) {
        detectionResults[file] = {
          contentType: null,
          magic: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    // Create snapshot
    expect(detectionResults).toMatchSnapshot();
    
    // Calculate success rate for assertion
    const totalFiles = Object.keys(detectionResults).length;
    const successfulDetections = Object.values(detectionResults).filter(r => r.magic !== null).length;
    const successRate = successfulDetections / totalFiles;
    
    // We expect at least 45% success rate since many text files don't have magic bytes
    expect(successRate).toBeGreaterThan(0.45);
  }, 60000); // 60 second timeout for this test

  test('should handle large files efficiently', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/kitchen-sink');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    // Filter for potentially large files
    const largeExtensions = ['pdf', 'zip', 'mp4', 'avi', 'mov', 'mkv', 'tar', 'gz'];
    const largeFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase().replace('.', '');
      return largeExtensions.includes(ext);
    });
    
    for (const file of largeFiles.slice(0, 5)) { // Test first 5 large files
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      
      const startTime = Date.now();
      const detectedType = await detector.detectFromStream(stream);
      const endTime = Date.now();
      
      // Should detect large files quickly (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Detection should be fast for large files
    }
  });

  test('should detect specific file types correctly', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/kitchen-sink');
    
    // Test specific known file types
    const testCases = [
      { pattern: '*.png', expectedType: 'png', expectedMime: 'image/png' },
      { pattern: '*.jpg', expectedType: 'jpeg', expectedMime: 'image/jpeg' },
      { pattern: '*.jpeg', expectedType: 'jpeg', expectedMime: 'image/jpeg' },
      { pattern: '*.gif', expectedType: /^gif/, expectedMime: 'image/gif' },
      { pattern: '*.pdf', expectedType: 'pdf', expectedMime: 'application/pdf' },
      { pattern: '*.zip', expectedType: 'zip', expectedMime: 'application/zip' },
      { pattern: '*.mp3', expectedType: /^mp3/, expectedMime: 'audio/mpeg' },
      { pattern: '*.mp4', expectedType: 'mp4', expectedMime: 'video/mp4' }
    ];
    
    for (const testCase of testCases) {
      const files = await glob(testCase.pattern, { cwd: fixturePath, nodir: true });
      
      if (files.length > 0) {
        const file = files[0]; // Test first file of each type
        const filePath = path.join(fixturePath, file);
        const stream = createReadStream(filePath);
        
        const detectedType = await detector.detectFromStream(stream);
        
        expect(detectedType).toBeDefined();
        
        if (typeof testCase.expectedType === 'string') {
          expect(detectedType?.name).toBe(testCase.expectedType);
        } else {
          expect(detectedType?.name).toMatch(testCase.expectedType);
        }
        
        expect(detectedType?.mimeType).toBe(testCase.expectedMime);
        
        // Successfully detected the expected type
      }
    }
  });
});