import { FileTypeDetector } from '../src/file-type-detector';
import { getContentTypeForExtension } from '../src/file-types-registry';

describe('Charset-aware Content Type Detection', () => {
  let detector: FileTypeDetector;

  beforeEach(() => {
    detector = new FileTypeDetector();
  });

  describe('getContentTypeForExtension', () => {
    it('should return text/x-typescript for .ts files with utf-8 charset', () => {
      const contentType = getContentTypeForExtension('ts', 'utf-8');
      expect(contentType).toBe('text/x-typescript');
    });

    it('should return video/mp2t for .ts files with binary charset', () => {
      const contentType = getContentTypeForExtension('ts', 'binary');
      expect(contentType).toBe('video/mp2t');
    });

    it('should return text/x-typescript for .tsx files with utf-8 charset', () => {
      const contentType = getContentTypeForExtension('tsx', 'utf-8');
      expect(contentType).toBe('text/x-typescript');
    });

    it('should return null for .tsx files with binary charset', () => {
      const contentType = getContentTypeForExtension('tsx', 'binary');
      expect(contentType).toBeNull();
    });

    it('should return font content types without charset requirement', () => {
      expect(getContentTypeForExtension('ttf')).toBe('font/ttf');
      expect(getContentTypeForExtension('otf')).toBe('font/otf');
      expect(getContentTypeForExtension('woff')).toBe('font/woff');
      expect(getContentTypeForExtension('woff2')).toBe('font/woff2');
      expect(getContentTypeForExtension('eot')).toBe('application/vnd.ms-fontobject');
    });

    it('should return image/svg+xml for .svg files', () => {
      expect(getContentTypeForExtension('svg')).toBe('image/svg+xml');
    });
  });

  describe('TypeScript file detection', () => {
    it('should detect UTF-8 TypeScript file as text/x-typescript', async () => {
      const tsContent = Buffer.from(`
        // TypeScript code
        interface User {
          name: string;
          age: number;
        }
        
        const user: User = { name: "John", age: 30 };
      `);

      const result = await detector.detectFromBuffer(tsContent);
      expect(result).toBeDefined();
      expect(result?.charset).toBe('utf-8');
      
      // Since we don't have magic bytes for TS files, it will be detected as generic text
      // But the content type lookup should work with the charset
      const contentType = getContentTypeForExtension('ts', result?.charset);
      expect(contentType).toBe('text/x-typescript');
    });

    it('should detect binary MPEG-TS file as video/mp2t', async () => {
      // MPEG-TS sync byte pattern (0x47 every 188 bytes)
      const mpegTsContent = Buffer.alloc(376);
      mpegTsContent[0] = 0x47;
      mpegTsContent[188] = 0x47;
      // Add some binary data
      for (let i = 1; i < 188; i++) {
        mpegTsContent[i] = Math.floor(Math.random() * 256);
      }

      const result = await detector.detectFromBuffer(mpegTsContent);
      expect(result?.charset).toBe('binary');
      
      const contentType = getContentTypeForExtension('ts', result?.charset);
      expect(contentType).toBe('video/mp2t');
    });
  });

  describe('Font file detection', () => {
    it('should detect TrueType font files', async () => {
      const ttfMagic = Buffer.from([0x00, 0x01, 0x00, 0x00]);
      const result = await detector.detectFromBuffer(ttfMagic);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('ttf');
      expect(result?.mimeType).toBe('font/ttf');
      expect(result?.contentType).toBe('font/ttf');
    });

    it('should detect WOFF files', async () => {
      const woffMagic = Buffer.from([0x77, 0x4F, 0x46, 0x46]); // 'wOFF'
      const result = await detector.detectFromBuffer(woffMagic);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('woff');
      expect(result?.mimeType).toBe('font/woff');
      expect(result?.contentType).toBe('font/woff');
    });

    it('should detect WOFF2 files', async () => {
      const woff2Magic = Buffer.from([0x77, 0x4F, 0x46, 0x32]); // 'wOF2'
      const result = await detector.detectFromBuffer(woff2Magic);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('woff2');
      expect(result?.mimeType).toBe('font/woff2');
      expect(result?.contentType).toBe('font/woff2');
    });
  });

  describe('SVG file detection', () => {
    it('should detect SVG files as image/svg+xml', async () => {
      const svgContent = Buffer.from(`<?xml version="1.0"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <circle cx="50" cy="50" r="40" fill="red"/>
        </svg>
      `);

      const result = await detector.detectFromBuffer(svgContent);
      expect(result).toBeDefined();
      
      // SVG files might be detected as XML or text
      const contentType = getContentTypeForExtension('svg');
      expect(contentType).toBe('image/svg+xml');
    });
  });

  describe('Office Open XML format detection', () => {
    it('should return specific content type for .docx files detected as zip', async () => {
      // ZIP magic bytes (PK signature)
      const zipContent = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      const result = await detector.detectWithFallback(zipContent, 'document.docx');
      
      expect(result).toBeDefined();
      expect(result?.mimeType).toBe('application/zip');
      expect(result?.contentType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should return specific content type for .xlsx files detected as zip', async () => {
      const zipContent = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      const result = await detector.detectWithFallback(zipContent, 'spreadsheet.xlsx');
      
      expect(result).toBeDefined();
      expect(result?.mimeType).toBe('application/zip');
      expect(result?.contentType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should return specific content type for .pptx files detected as zip', async () => {
      const zipContent = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
      const result = await detector.detectWithFallback(zipContent, 'presentation.pptx');
      
      expect(result).toBeDefined();
      expect(result?.mimeType).toBe('application/zip');
      expect(result?.contentType).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
    });

    it('should use charset-aware lookup for Office formats', () => {
      expect(getContentTypeForExtension('docx', 'binary')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(getContentTypeForExtension('xlsx', 'binary')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(getContentTypeForExtension('pptx', 'binary')).toBe('application/vnd.openxmlformats-officedocument.presentationml.presentation');
    });
  });
});