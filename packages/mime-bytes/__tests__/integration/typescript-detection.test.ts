
import { FileTypeDetector } from '../../src/file-type-detector';

describe('TypeScript File Detection Integration', () => {
  let detector: FileTypeDetector;

  beforeEach(() => {
    detector = new FileTypeDetector();
  });

  it('should correctly identify TypeScript source files', async () => {
    // Create a TypeScript file content
    const tsContent = `
import { Request, Response } from 'express';

interface User {
  id: number;
  name: string;
  email: string;
}

export class UserController {
  async getUser(req: Request, res: Response): Promise<void> {
    const userId = parseInt(req.params.id);
    const user: User = await this.userService.findById(userId);
    res.json(user);
  }
}
`;

    const buffer = Buffer.from(tsContent);
    const result = await detector.detectFromBuffer(buffer);
    
    // Should detect as text with UTF-8 charset
    expect(result).toBeDefined();
    expect(result?.charset).toBe('utf-8');
    expect(result?.name).toBe('text');
    
    // When combined with filename, should get correct content type
    const resultWithFilename = await detector.detectWithFallback(
      buffer,
      'controller.ts'
    );
    
    expect(resultWithFilename).toBeDefined();
    expect(resultWithFilename?.contentType).toBe('text/x-typescript');
  });

  it('should correctly identify MPEG-TS video files', async () => {
    // Create MPEG-TS content with sync bytes
    const tsSize = 188 * 3; // 3 packets
    const mpegTsContent = Buffer.alloc(tsSize);
    
    // Set sync bytes at packet boundaries
    for (let i = 0; i < 3; i++) {
      mpegTsContent[i * 188] = 0x47; // Sync byte
      // Fill with binary data that ensures binary detection
      for (let j = 1; j < 188; j++) {
        // Use values that are definitely non-ASCII (> 127)
        mpegTsContent[i * 188 + j] = 128 + Math.floor(Math.random() * 128);
      }
    }
    
    const result = await detector.detectFromBuffer(mpegTsContent);
    
    // Should detect as mp2t with binary charset
    expect(result).toBeDefined();
    expect(result?.name).toBe('mp2t');
    expect(result?.charset).toBe('binary');
    expect(result?.contentType).toBe('video/mp2t');
  });

  it('should handle .ts extension based on content', async () => {
    // Test 1: TypeScript content
    const tsCode = Buffer.from('const x: number = 42;');
    const tsResult = await detector.detectWithFallback(tsCode, 'file.ts');
    expect(tsResult?.contentType).toBe('text/x-typescript');
    
    // Test 2: Binary content with .ts extension
    const binaryContent = Buffer.from([0x47, 0x00, 0x00, 0x00]);
    const binaryResult = await detector.detectWithFallback(binaryContent, 'video.ts');
    expect(binaryResult?.contentType).toBe('video/mp2t');
  });

  it('should detect TSX files correctly', async () => {
    const tsxContent = `
import React from 'react';

interface Props {
  name: string;
  age: number;
}

export const UserCard: React.FC<Props> = ({ name, age }) => {
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>Age: {age}</p>
    </div>
  );
};
`;

    const buffer = Buffer.from(tsxContent);
    const result = await detector.detectWithFallback(buffer, 'component.tsx');
    
    expect(result).toBeDefined();
    expect(result?.charset).toBe('utf-8');
    expect(result?.contentType).toBe('text/x-typescript');
  });
});