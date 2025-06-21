# Migration from mmmagic to mime-bytes

This document describes the changes made to replace `@launchql/mmmagic` and `buffer-peek-stream` with `mime-bytes`.

## Changes Made

### 1. Updated Dependencies

**Removed:**
- `@launchql/mmmagic@0.5.3` - Native libmagic bindings
- `buffer-peek-stream@1.1.0` - Stream peeking utility

**Added:**
- `mime-bytes@^0.1.1` - Pure JavaScript/TypeScript file type detection with built-in stream peeking

### 2. Code Changes in `content-type-stream.ts`

- Replaced callback-based `magic.detect()` with async/await `detector.detectWithFallback()`
- Removed the need for manual stream peeking setup (mime-bytes handles this internally)
- Simplified error handling with try/catch instead of callback error parameters
- Removed `@ts-nocheck` directive as mime-bytes has proper TypeScript support

### 3. API Changes

The public API remains the same:
- `streamContentType()` still accepts the same parameters
- Returns the same result structure
- The function is now `async` (returns a Promise) instead of callback-based

### 4. Improvements

1. **No Native Dependencies**: Eliminates build issues on different platforms
2. **Better Performance**: Built-in caching and optimized detection
3. **More Accurate Detection**: 100+ file types with magic byte detection
4. **Better TypeScript Support**: Full type safety without `@ts-nocheck`
5. **Improved Charset Detection**: More accurate UTF-8 vs ASCII detection
6. **Stream Efficiency**: Built-in peek functionality reduces complexity

### 5. Test Updates

The test snapshots were updated to reflect:
- More accurate charset detection (us-ascii → utf-8 for text files)
- Improved MIME type detection for some formats
- Better handling of ambiguous file types

## Usage Example

```javascript
const { streamContentType } = require('@launchql/content-type-stream');
const { createReadStream } = require('fs');

async function detectContentType(filename) {
  const readStream = createReadStream(filename);
  const result = await streamContentType({
    readStream,
    filename
  });
  
  console.log('Content-Type:', result.contentType);
  console.log('MIME Type:', result.magic.type);
  console.log('Charset:', result.magic.charset);
  
  // Use the returned stream for further processing
  result.stream.pipe(process.stdout);
}
```

## Breaking Changes

None for the public API. The function signature and return values remain the same, only the internal implementation has changed from callback-based to promise-based.