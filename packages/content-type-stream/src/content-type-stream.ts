import { BufferPeekStream,FileTypeDetector } from 'mime-bytes';
import type { Readable } from 'stream';

// Create a shared detector instance with default settings
const detector = new FileTypeDetector({
  peekBytes: 16384,
  checkMultipleOffsets: true
});

interface StreamContentTypeArgs {
  readStream: Readable;
  filename: string;
  peekBytes?: number;
}

interface StreamContentTypeResult {
  stream: BufferPeekStream | Readable;
  magic: { type: string; charset: string };
  contentType: string;
}

export async function streamContentType({
  readStream,
  filename,
  peekBytes = 16384
}: StreamContentTypeArgs): Promise<StreamContentTypeResult> {
  try {
    // Create a custom detector if different peek bytes are needed
    const customDetector = peekBytes !== 16384 
      ? new FileTypeDetector({ peekBytes, checkMultipleOffsets: true })
      : detector;

    // Detect from stream with fallback to filename
    const result = await customDetector.detectWithFallback(readStream, filename);
    
    // Get the peek stream that was created during detection
    // mime-bytes returns the peek stream as part of the result
    const peekStream = (result as any)?._stream || readStream;
    
    let type = 'application/octet-stream';
    let charset = 'binary';
    let contentType = 'application/octet-stream';
    
    if (result) {
      type = result.mimeType;
      charset = result.charset || 'binary';
      // Use the contentType directly from mime-bytes
      contentType = result.contentType || result.mimeType;
    }
    
    return {
      stream: peekStream,
      magic: { type, charset },
      contentType
    };
  } catch (error) {
    // If detection fails, return defaults with original stream
    const type = 'application/octet-stream';
    const charset = 'binary';
    const contentType = 'application/octet-stream';
    
    return {
      stream: readStream,
      magic: { type, charset },
      contentType
    };
  }
}
