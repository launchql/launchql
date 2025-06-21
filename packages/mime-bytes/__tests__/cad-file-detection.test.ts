import { FileTypeDetector } from '../src/file-type-detector';
import { getContentTypeForExtension } from '../src/file-types-registry';

describe('CAD File Detection', () => {
  let detector: FileTypeDetector;

  beforeEach(() => {
    detector = new FileTypeDetector();
  });

  describe('DWG file detection', () => {
    it('should detect AutoCAD R14 DWG file', async () => {
      // AC1014 signature
      const dwgContent = Buffer.from([0x41, 0x43, 0x31, 0x30, 0x31, 0x34]);
      const result = await detector.detectFromBuffer(dwgContent);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('dwg');
      expect(result?.mimeType).toBe('application/acad');
      expect(result?.extensions).toContain('dwg');
      expect(result?.charset).toBe('binary');
    });

    it('should detect AutoCAD 2000 DWG file', async () => {
      // AC1015 signature
      const dwgContent = Buffer.from([0x41, 0x43, 0x31, 0x30, 0x31, 0x35]);
      const result = await detector.detectFromBuffer(dwgContent);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('dwg');
      expect(result?.mimeType).toBe('application/acad');
    });

    it('should detect AutoCAD 2018 DWG file', async () => {
      // AC1032 signature
      const dwgContent = Buffer.from([0x41, 0x43, 0x31, 0x30, 0x33, 0x32]);
      const result = await detector.detectFromBuffer(dwgContent);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('dwg');
      expect(result?.mimeType).toBe('application/acad');
    });

    it('should detect old AutoCAD R1.2 DWG file', async () => {
      // AC1.2 signature
      const dwgContent = Buffer.from([0x41, 0x43, 0x31, 0x2E, 0x32]);
      const result = await detector.detectFromBuffer(dwgContent);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('dwg');
      expect(result?.mimeType).toBe('application/acad');
    });

    it('should use content type mapping for DWG files', () => {
      const contentType = getContentTypeForExtension('dwg', 'binary');
      expect(contentType).toBe('application/acad');
    });

    it('should detect DWG file with fallback when no magic bytes match', async () => {
      // Binary content that doesn't match any DWG signature but is clearly binary
      // Avoid UTF-16 BOM (0xFF 0xFE) and other text signatures
      const unknownContent = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x00, 0x9A, 0xBC, 0xDE]);
      const result = await detector.detectWithFallback(unknownContent, 'drawing.dwg');
      
      expect(result).toBeDefined();
      expect(result?.contentType).toBe('application/acad');
      expect(result?.charset).toBe('binary');
    });
  });

  describe('EMF file detection', () => {
    it('should detect Enhanced Metafile', async () => {
      // EMF signature: 01 00 00 00 20 45 4D 46
      const emfContent = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x20, 0x45, 0x4D, 0x46]);
      const result = await detector.detectFromBuffer(emfContent);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('emf');
      expect(result?.mimeType).toBe('image/emf');
      expect(result?.extensions).toContain('emf');
      expect(result?.charset).toBe('binary');
    });

    it('should use content type mapping for EMF files', () => {
      const contentType = getContentTypeForExtension('emf', 'binary');
      expect(contentType).toBe('image/emf');
    });
  });

  describe('DXF file detection', () => {
    it('should use content type mapping for DXF files', () => {
      const contentType = getContentTypeForExtension('dxf', 'ascii');
      expect(contentType).toBe('image/vnd.dxf');
    });

    it('should handle DXF file with extension fallback', async () => {
      // DXF files are text-based and don't have reliable magic bytes
      // This simulates a DXF file content (simplified)
      const dxfContent = Buffer.from('0\nSECTION\n2\nHEADER\n');
      const result = await detector.detectWithFallback(dxfContent, 'drawing.dxf');
      
      expect(result).toBeDefined();
      // DXF files should get the proper content type based on charset
      expect(result?.contentType).toBe('image/vnd.dxf');
      // DXF files are typically ASCII or UTF-8 text
      expect(['ascii', 'utf-8']).toContain(result?.charset);
    });
  });

  describe('Unknown binary file handling', () => {
    it('should return null for unknown binary files', async () => {
      // Random binary content with no known signature
      const unknownBinary = Buffer.from([0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x00, 0xFF, 0xFF]);
      const result = await detector.detectWithFallback(unknownBinary);
      
      expect(result).toBeNull();
    });

    it('should return null for binary file with unknown extension', async () => {
      // Binary content with unknown extension
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF, 0xFE, 0xFD, 0xFC]);
      const result = await detector.detectWithFallback(binaryContent, 'file.xyz123');
      
      expect(result).toBeNull();
    });
  });
});