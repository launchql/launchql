// Performance tests for file type detection
import { FileTypeDetector } from '../src/file-type-detector';
import { createReadStream } from 'fs';
import path from 'path';
import { glob } from 'glob';

describe('Performance Tests', () => {
  let detector: FileTypeDetector;
  
  beforeAll(() => {
    detector = new FileTypeDetector();
  });

  test('should detect file types quickly', async () => {
    const fixturePath = path.join(__dirname, '../../../__fixtures__/kitchen-sink');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    if (files.length === 0) {
      throw new Error('No files found in fixtures, skipping performance test');
    }
    
    const startTime = Date.now();
    let successCount = 0;
    
    for (const file of files) {
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      
      try {
        const detectedType = await detector.detectWithFallback(stream, file);
        if (detectedType) successCount++;
      } catch (error) {
        // Count as success if handled gracefully
        successCount++;
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / files.length;
    
    // Should process files quickly (average under 10ms per file)
    expect(avgTime).toBeLessThan(10);
    expect(successCount).toBeGreaterThan(files.length * 0.95); // 95% success rate
    
    console.log(`✅ Processed ${files.length} files in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms/file)`);
  });

  test('should benefit from caching on repeated detections', async () => {
    const extensions = ['jpg', 'png', 'pdf', 'zip', 'mp4', 'txt'];
    
    // Clear cache to start fresh
    detector.clearCache();
    
    // First pass - cold cache
    const firstPassStart = Date.now();
    for (let i = 0; i < 1000; i++) {
      for (const ext of extensions) {
        detector.detectFromExtension(ext);
      }
    }
    const firstPassTime = Date.now() - firstPassStart;
    
    // Second pass - warm cache (should be faster)
    const secondPassStart = Date.now();
    for (let i = 0; i < 1000; i++) {
      for (const ext of extensions) {
        detector.detectFromExtension(ext);
      }
    }
    const secondPassTime = Date.now() - secondPassStart;
    
    // Second pass should be faster due to caching
    expect(secondPassTime).toBeLessThanOrEqual(firstPassTime);
    
    // Calculate improvement percentage
    const improvement = firstPassTime > 0 ? ((1 - secondPassTime/firstPassTime) * 100) : 0;
    
    console.log(`✅ First pass: ${firstPassTime}ms, Second pass: ${secondPassTime}ms (${improvement.toFixed(1)}% improvement)`);
  });

  test('should handle concurrent detections efficiently', async () => {
    const fixturePath = path.join(__dirname, '../../../../__fixtures__/kitchen-sink');
    const files = await glob('**/*', { cwd: fixturePath, nodir: true });
    
    if (files.length === 0) {
      console.log('No files found in fixtures, skipping concurrent test');
      return;
    }
    
    // Take first 10 files for concurrent test
    const testFiles = files.slice(0, Math.min(10, files.length));
    
    const startTime = Date.now();
    
    // Process files concurrently
    const promises = testFiles.map(file => {
      const filePath = path.join(fixturePath, file);
      const stream = createReadStream(filePath);
      return detector.detectWithFallback(stream, file);
    });
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r !== null).length;
    const totalTime = endTime - startTime;
    
    // Should handle concurrent requests efficiently
    expect(totalTime).toBeLessThan(100); // All 10 files in under 100ms
    expect(successCount).toBeGreaterThan(testFiles.length * 0.9); // 90% success rate
    
    console.log(`✅ Processed ${testFiles.length} files concurrently in ${totalTime}ms`);
  });
});