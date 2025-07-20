import { Readable } from 'stream';

import { FileTypeDetector } from '../src/file-type-detector';

describe('FileTypeDetector', () => {
  let detector: FileTypeDetector;

  beforeEach(() => {
    detector = new FileTypeDetector();
  });

  describe('detectFromBuffer', () => {
    it('should detect PNG files', async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
      ]);

      const result = await detector.detectFromBuffer(pngBuffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('png');
      expect(result?.mimeType).toBe('image/png');
      expect(result?.extensions).toContain('png');
      expect(result?.confidence).toBe(1.0);
    });

    it('should detect JPEG files', async () => {
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01
      ]);

      const result = await detector.detectFromBuffer(jpegBuffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('jpeg');
      expect(result?.mimeType).toBe('image/jpeg');
      expect(result?.extensions).toContain('jpg');
      expect(result?.extensions).toContain('jpeg');
    });

    it('should detect ZIP files', async () => {
      const zipBuffer = Buffer.from([
        0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
        0x08, 0x00, 0x00, 0x00, 0x21, 0x00, 0x00, 0x00
      ]);

      const result = await detector.detectFromBuffer(zipBuffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('zip');
      expect(result?.mimeType).toBe('application/zip');
      expect(result?.extensions).toContain('zip');
    });

    it('should detect PDF files', async () => {
      const pdfBuffer = Buffer.from([
        0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34,
        0x0A, 0x25, 0xC4, 0xE5, 0xF2, 0xE5, 0xEB, 0xA7
      ]);

      const result = await detector.detectFromBuffer(pdfBuffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('pdf');
      expect(result?.mimeType).toBe('application/pdf');
      expect(result?.extensions).toContain('pdf');
    });

    it('should detect MP4 files with offset', async () => {
      const mp4Buffer = Buffer.from([
        0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
        0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00
      ]);

      const result = await detector.detectFromBuffer(mp4Buffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('mp4');
      expect(result?.mimeType).toBe('video/mp4');
      expect(result?.extensions).toContain('mp4');
    });

    it('should detect UTF-8 BOM', async () => {
      const utf8Buffer = Buffer.from([
        0xEF, 0xBB, 0xBF, 0x48, 0x65, 0x6C, 0x6C, 0x6F
      ]);

      const result = await detector.detectFromBuffer(utf8Buffer);
      expect(result).toBeDefined();
      expect(result?.name).toBe('utf8');
      expect(result?.mimeType).toBe('text/plain');
      expect(result?.charset).toBe('utf-8');
    });

    it('should return null for unknown file types', async () => {
      const unknownBuffer = Buffer.from([
        0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77
      ]);

      const result = await detector.detectFromBuffer(unknownBuffer);
      expect(result).toBeNull();
    });

    it('should handle empty buffers', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = await detector.detectFromBuffer(emptyBuffer);
      expect(result).toBeNull();
    });
  });

  describe('detectFromExtension', () => {
    it('should detect by extension with dot', () => {
      const results = detector.detectFromExtension('.png');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('png');
      expect(results[0].mimeType).toBe('image/png');
      expect(results[0].confidence).toBe(0.8);
    });

    it('should detect by extension without dot', () => {
      const results = detector.detectFromExtension('jpg');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].extensions).toContain('jpg');
    });

    it('should return multiple results for ambiguous extensions', () => {
      const results = detector.detectFromExtension('xml');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle unknown extensions', () => {
      const results = detector.detectFromExtension('xyz123');
      expect(results).toHaveLength(0);
    });
  });

  describe('detectFromStream', () => {
    it('should detect from a readable stream', async () => {
      // Create a stream with PNG magic bytes
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
      ]);
      
      const stream = Readable.from([pngData]);
      const result = await detector.detectFromStream(stream);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('png');
      expect(result?.mimeType).toBe('image/png');
    });

    it('should handle stream errors gracefully', async () => {
      const errorStream = new Readable({
        read() {
          // Push some data first, then destroy
          this.push(Buffer.from([0x00]));
          this.push(null); // End the stream
          process.nextTick(() => {
            this.destroy(new Error('Stream error'));
          });
        }
      });

      const result = await detector.detectFromStream(errorStream);
      expect(result).toBeNull();
    });
  });

  describe('getByCategory', () => {
    it('should return file types by category', () => {
      const imageTypes = detector.getByCategory('image');
      expect(imageTypes.length).toBeGreaterThan(0);
      expect(imageTypes.every(ft => ft.category === 'image')).toBe(true);
    });

    it('should return empty array for unknown category', () => {
      const unknownTypes = detector.getByCategory('unknown-category');
      expect(unknownTypes).toHaveLength(0);
    });
  });

  describe('addFileType and removeFileType', () => {
    it('should add a new file type', () => {
      const customType = {
        name: 'custom',
        magicBytes: ['0xAA', '0xBB'],
        mimeType: 'application/custom',
        extensions: ['custom'],
        category: 'other'
      };

      detector.addFileType(customType);
      const allTypes = detector.getAllFileTypes();
      expect(allTypes).toContainEqual(customType);
    });

    it('should remove a file type', async () => {
      // Create a new detector instance for this test to avoid affecting other tests
      const testDetector = new FileTypeDetector();
      const removed = testDetector.removeFileType('png');
      expect(removed).toBe(true);
      
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ]);
      
      const result = await testDetector.detectFromBuffer(pngBuffer);
      expect(result).toBeNull();
    });
  });

  describe('isFileType', () => {
    it('should correctly identify file types', () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ]);

      expect(detector.isFileType(pngBuffer, 'png')).toBe(true);
      expect(detector.isFileType(pngBuffer, 'jpeg')).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics about registered file types', () => {
      const stats = detector.getStatistics();
      expect(stats.totalTypes).toBeGreaterThan(0);
      expect(stats.byCategory).toBeDefined();
      expect(stats.byMimePrefix).toBeDefined();
      expect(stats.byCategory.image).toBeGreaterThan(0);
      expect(stats.byMimePrefix.image).toBeGreaterThan(0);
    });
  });

  describe('detectWithFallback', () => {
    it('should use magic bytes when available', async () => {
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ]);
      
      const stream = Readable.from([pngData]);
      const result = await detector.detectWithFallback(stream, 'file.txt');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('png');
      expect(result?.confidence).toBe(1.0);
    });

    it('should fallback to extension when magic bytes fail', async () => {
      const unknownData = Buffer.from([0x00, 0x11, 0x22, 0x33]);
      const stream = Readable.from([unknownData]);
      
      const result = await detector.detectWithFallback(stream, 'file.png');
      
      expect(result).toBeDefined();
      expect(result?.extensions).toContain('png');
      expect(result?.confidence).toBe(0.7); // Higher confidence since PNG is in content type mappings
    });
  });

  describe('charset detection', () => {
    it('should detect UTF-8 with BOM', async () => {
      const utf8BOM = Buffer.from([0xEF, 0xBB, 0xBF, 0x48, 0x65, 0x6C, 0x6C, 0x6F]); // BOM + "Hello"
      const result = await detector.detectFromBuffer(utf8BOM);
      expect(result?.charset).toBe('utf-8');
    });

    it('should detect UTF-8 without BOM', async () => {
      const utf8Text = Buffer.from('Hello, 世界! 🌍', 'utf-8');
      const result = await detector.detectFromBuffer(utf8Text);
      expect(result?.charset).toBe('utf-8');
    });

    it('should return null for binary content', async () => {
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00]);
      const result = await detector.detectFromBuffer(binaryData);
      expect(result).toBeNull(); // Binary content with no magic bytes returns null
    });

    it('should detect ASCII for non-UTF-8 text', async () => {
      // Create invalid UTF-8 sequence
      const invalidUtf8 = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0xFF, 0xFE]); // "Hello" + invalid bytes
      const result = await detector.detectFromBuffer(invalidUtf8);
      expect(result?.charset).toBe('ascii');
    });

    it('should detect UTF-16 LE with BOM', async () => {
      const utf16LE = Buffer.from([0xFF, 0xFE, 0x48, 0x00, 0x65, 0x00]); // BOM + "He"
      const result = await detector.detectFromBuffer(utf16LE);
      expect(result?.charset).toBe('utf-16le');
    });

    it('should detect UTF-16 BE with BOM', async () => {
      const utf16BE = Buffer.from([0xFE, 0xFF, 0x00, 0x48, 0x00, 0x65]); // BOM + "He"
      const result = await detector.detectFromBuffer(utf16BE);
      expect(result?.charset).toBe('utf-16be');
    });
  });
});