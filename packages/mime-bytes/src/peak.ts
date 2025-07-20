// TypeScript implementation of peek stream for efficient file type detection
// Based on reference-packages/buffer-peak/peak.js

import { Readable,Transform, TransformOptions } from 'stream';

export interface PeekStreamOptions extends TransformOptions {
  peekBytes: number;
}

export class BufferPeekStream extends Transform {
  private peekBytes: number;
  private buffer: Buffer;
  private bufferLength: number;
  private peeked: boolean;

  constructor(options: PeekStreamOptions) {
    super(options);
    this.peekBytes = options.peekBytes || 16;
    this.buffer = Buffer.alloc(0);
    this.bufferLength = 0;
    this.peeked = false;
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: Function): void {
    if (this.peeked) {
      // After peeking, just pass through
      this.push(chunk);
      callback();
      return;
    }

    // Accumulate data until we have enough to peek
    const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
    this.buffer = Buffer.concat([this.buffer, chunkBuffer]);
    this.bufferLength += chunkBuffer.length;

    if (this.bufferLength >= this.peekBytes) {
      // We have enough data to peek
      this.peeked = true;
      
      // Emit the peek event with the requested bytes
      const peekBuffer = this.buffer.slice(0, this.peekBytes);
      this.emit('peek', peekBuffer);
      
      // Push all accumulated data
      this.push(this.buffer);
      this.buffer = Buffer.alloc(0);
      this.bufferLength = 0;
      
      callback();
    } else {
      // Need more data
      callback();
    }
  }

  _flush(callback: Function): void {
    if (!this.peeked && this.bufferLength > 0) {
      // Not enough data was received, emit what we have
      this.peeked = true;
      this.emit('peek', this.buffer);
      this.push(this.buffer);
    }
    callback();
  }
}

// Main peek function with callback
export function peek(source: Readable, bytes: number, callback?: (err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void): BufferPeekStream;
export function peek(source: Readable, callback: (err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void): BufferPeekStream;
export function peek(
  source: Readable,
  bytesOrCallback: number | ((err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void),
  callback?: (err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void
): BufferPeekStream {
  let bytes: number;
  let cb: ((err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void) | undefined;

  if (typeof bytesOrCallback === 'function') {
    bytes = 16; // Default peek bytes
    cb = bytesOrCallback;
  } else {
    bytes = bytesOrCallback;
    cb = callback;
  }

  const dest = new BufferPeekStream({ peekBytes: bytes });

  if (cb) {
    dest.once('peek', (buffer: Buffer) => {
      cb(null, buffer, dest);
    });

    dest.once('error', (err: Error) => {
      cb(err, Buffer.alloc(0), dest);
    });
  }

  return source.pipe(dest);
}

// Promise-based version
peek.promise = function(source: Readable, bytes: number = 16): Promise<[Buffer, BufferPeekStream]> {
  return new Promise((resolve, reject) => {
    const dest = peek(source, bytes, (err, buffer, stream) => {
      if (err) {
        reject(err);
      } else {
        resolve([buffer, stream]);
      }
    });

    // Handle source errors
    source.once('error', reject);
  });
};

// Export types
export type PeekCallback = (err: Error | null, buffer: Buffer, dest: BufferPeekStream) => void;
export type PeekPromise = (source: Readable, bytes?: number) => Promise<[Buffer, BufferPeekStream]>;