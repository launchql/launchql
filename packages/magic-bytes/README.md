# magic-bytes

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/launchql/launchql/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/launchql/launchql/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/magic-bytes"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Fmagic-bytes%2Fpackage.json"/></a>
</p>

**Lightning-fast file type detection using magic bytes (file signatures) with a focus on stream processing and minimal memory usage.**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API](#-api) • [File Types](#-supported-file-types) • [Performance](#-performance)

</div>

---

## ✨ Features

- 🚀 **Stream-based detection** - Process files of any size without loading them into memory
- 📦 **100+ file types** - Comprehensive coverage of common and specialized formats
- 🎯 **High accuracy** - Magic byte detection with fallback to extension-based identification
- 💾 **Minimal memory usage** - Only reads the first 16-32 bytes needed for detection
- 🔧 **TypeScript support** - Full type safety and IntelliSense
- ⚡ **Performance optimized** - Built-in caching for repeated operations
- 🎨 **Content type disambiguation** - Smart MIME type resolution for ambiguous formats
- 🔌 **Extensible** - Add custom file types at runtime
- 🌐 **Charset detection** - Automatic encoding detection for text files
- 🛡️ **Robust error handling** - Graceful degradation for unknown formats

## 📦 Installation

```bash
npm install magic-bytes
```

## 🚀 Quick Start

```typescript
import { FileTypeDetector } from 'magic-bytes';
import { createReadStream } from 'fs';

const detector = new FileTypeDetector();

// Stream-based detection (recommended)
const stream = createReadStream('document.pdf');
const fileType = await detector.detectFromStream(stream);

console.log(fileType);
// {
//   name: "pdf",
//   mimeType: "application/pdf",
//   extensions: ["pdf"],
//   description: "Portable Document Format",
//   charset: "binary",
//   contentType: "application/pdf",
//   confidence: 1.0
// }
```

## 📖 API

### FileTypeDetector

The main class for file type detection.

#### Constructor Options

```typescript
const detector = new FileTypeDetector({
  peekBytes: 32,              // Number of bytes to peek (default: 32)
  checkMultipleOffsets: true, // Check offsets 0, 4, 8, 12 (default: true)
  maxOffset: 12               // Maximum offset to check (default: 12)
});
```

### Core Methods

#### `detectFromStream(stream: Readable): Promise<FileTypeResult | null>`

Detect file type from a readable stream. **This is the primary and recommended method.**

```typescript
const stream = createReadStream('video.mp4');
const result = await detector.detectFromStream(stream);
// Stream can still be used after detection!
```

#### `detectFromBuffer(buffer: Buffer): Promise<FileTypeResult | null>`

Detect file type from a buffer (for already-loaded data).

```typescript
const buffer = await fs.readFile('image.png');
const result = await detector.detectFromBuffer(buffer);
```

#### `detectWithFallback(input: Readable | Buffer, filename?: string): Promise<FileTypeResult | null>`

Detect with automatic fallback to extension-based detection.

```typescript
const stream = createReadStream('document.docx');
const result = await detector.detectWithFallback(stream, 'document.docx');
// Will use magic bytes first, then fall back to extension if needed
```

#### `detectFromExtension(extension: string): FileTypeResult[]`

Get possible file types based on extension alone.

```typescript
const results = detector.detectFromExtension('.jpg');
// Returns array of possible types with lower confidence scores
```

### File Type Management

#### `addFileType(fileType: FileTypeDefinition): void`

Add a custom file type definition.

```typescript
detector.addFileType({
  name: "myformat",
  magicBytes: ["0x4D", "0x59", "0x46", "0x4D"],
  mimeType: "application/x-myformat",
  extensions: ["myf", "myfmt"],
  description: "My Custom Format",
  category: "application"
});
```

#### `removeFileType(name: string): boolean`

Remove a file type by name.

```typescript
detector.removeFileType('myformat'); // Returns true if removed
```

#### `getByCategory(category: string): FileTypeDefinition[]`

Get all file types in a specific category.

```typescript
const imageTypes = detector.getByCategory('image');
const audioTypes = detector.getByCategory('audio');
```

### Utility Methods

#### `isFileType(input: Buffer | FileTypeResult, typeName: string): boolean`

Check if a buffer or result matches a specific file type.

```typescript
const buffer = await fs.readFile('image.png');
if (detector.isFileType(buffer, 'png')) {
  console.log('This is a PNG file!');
}
```

#### `getStats(): FileTypeStats`

Get detection statistics.

```typescript
const stats = detector.getStats();
console.log(`Total detections: ${stats.totalDetections}`);
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
```

#### `clearCache(): void`

Clear the internal cache (useful for testing or memory management).

```typescript
detector.clearCache();
```

## 📊 File Type Result

All detection methods return a `FileTypeResult` object:

```typescript
interface FileTypeResult {
  name: string;           // Short identifier (e.g., "pdf")
  mimeType: string;       // Standard MIME type
  extensions: string[];   // Common file extensions
  description?: string;   // Human-readable description
  charset?: string;       // Character encoding (for text files)
  contentType?: string;   // Full content type 
  confidence: number;     // Detection confidence (0-1)
}
```

## 🗂️ Supported File Types

### Images (30+ formats)
- **Common**: PNG, JPEG, GIF, WebP, SVG, ICO
- **Modern**: AVIF, HEIC/HEIF, JXL, QOI
- **Professional**: PSD, TIFF, BMP, DNG
- **Raw**: CR2, CR3, NEF, ARW, RAF
- **Legacy**: PCX, TGA, PICT

### Archives (20+ formats)
- **Common**: ZIP, RAR, 7Z, TAR, GZIP
- **Unix**: BZIP2, XZ, LZ, CPIO
- **Windows**: CAB, MSI
- **Package**: DEB, RPM, APK, JAR

### Documents (15+ formats)
- **Office**: DOCX, XLSX, PPTX, ODT, ODS
- **Portable**: PDF, RTF, EPUB
- **Legacy**: DOC, XLS, PPT

### Media (25+ formats)
- **Video**: MP4, AVI, MKV, MOV, WebM, FLV
- **Audio**: MP3, WAV, FLAC, OGG, M4A, AAC
- **Streaming**: MPEG-TS, M3U8

### Programming (20+ formats)
- **Source**: JS, TS, JSX, TSX, Python, Java
- **Data**: JSON, XML, YAML, TOML
- **Web**: HTML, CSS, LESS, SCSS
- **Scripts**: SH, BAT, PS1

### Executables (10+ formats)
- **Windows**: EXE, DLL, MSI
- **Unix**: ELF, Mach-O
- **Cross-platform**: JAR, WASM

### Specialized
- **CAD**: DWG, DXF, STL
- **Fonts**: TTF, OTF, WOFF, WOFF2
- **Database**: SQLite
- **Disk Images**: ISO, DMG

## ⚡ Performance

magic-bytes is designed for speed and efficiency:

- **Memory Usage**: O(1) - Only peeks necessary bytes
- **Time Complexity**: O(n) where n is number of registered types
- **Caching**: ~40% performance improvement on repeated operations
- **Average Detection Time**: <10ms per file

### Benchmarks

```typescript
// First detection: ~13ms
// Cached detection: ~8ms (38% faster)
// Concurrent processing: Handles 1000+ files/second
```

## 🔧 Advanced Usage

### Custom Peek Size

For files with magic bytes at unusual offsets:

```typescript
const detector = new FileTypeDetector({
  peekBytes: 64,  // Read more bytes
  maxOffset: 32   // Check deeper offsets
});
```

### Stream Processing Large Files

```typescript
import { pipeline } from 'stream/promises';

async function processLargeFile(filepath: string) {
  const readStream = createReadStream(filepath);
  
  // Detect type without consuming the stream
  const fileType = await detector.detectFromStream(readStream);
  
  if (fileType?.name === 'zip') {
    // Continue processing the same stream
    await pipeline(
      readStream,
      createUnzipStream(),
      createWriteStream('output')
    );
  }
}
```

### Handling Ambiguous Types

```typescript
// TypeScript files can be video/mp2t or text/x-typescript
const result = await detector.detectWithFallback(stream, 'file.ts');

if (result?.charset === 'utf-8') {
  console.log('TypeScript source file');
} else if (result?.charset === 'binary') {
  console.log('MPEG Transport Stream');
}
```

### Batch Processing

```typescript
async function detectMultipleFiles(files: string[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const stream = createReadStream(file);
      const type = await detector.detectFromStream(stream);
      return { file, type };
    })
  );
  
  return results;
}
```

## 🛡️ Error Handling

```typescript
try {
  const result = await detector.detectFromStream(stream);
  
  if (!result) {
    console.log('Unknown file type');
    // Handle unknown format
  } else {
    console.log(`Detected: ${result.name}`);
  }
} catch (error) {
  console.error('Detection failed:', error.message);
  // Handle stream errors, permission issues, etc.
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Adding New File Types

1. Add the file type definition to `src/file-types-registry.ts`
2. Include magic bytes, MIME type, and extensions
3. Add tests for the new file type
4. Submit a PR with a description of the format

## Related LaunchQL Tooling

### 🧪 Testing

* [launchql/pgsql-test](https://github.com/launchql/launchql/tree/main/packages/pgsql-test): **📊 Isolated testing environments** with per-test transaction rollbacks—ideal for integration tests, complex migrations, and RLS simulation.
* [launchql/graphile-test](https://github.com/launchql/launchql/tree/main/packages/graphile-test): **🔐 Authentication mocking** for Graphile-focused test helpers and emulating row-level security contexts.
* [launchql/pg-query-context](https://github.com/launchql/launchql/tree/main/packages/pg-query-context): **🔒 Session context injection** to add session-local context (e.g., `SET LOCAL`) into queries—ideal for setting `role`, `jwt.claims`, and other session settings.

### 🧠 Parsing & AST

* [launchql/pgsql-parser](https://github.com/launchql/pgsql-parser): **🔄 SQL conversion engine** that interprets and converts PostgreSQL syntax.
* [launchql/libpg-query-node](https://github.com/launchql/libpg-query-node): **🌉 Node.js bindings** for `libpg_query`, converting SQL into parse trees.
* [launchql/pg-proto-parser](https://github.com/launchql/pg-proto-parser): **📦 Protobuf parser** for parsing PostgreSQL Protocol Buffers definitions to generate TypeScript interfaces, utility functions, and JSON mappings for enums.
* [@pgsql/enums](https://github.com/launchql/pgsql-parser/tree/main/packages/enums): **🏷️ TypeScript enums** for PostgreSQL AST for safe and ergonomic parsing logic.
* [@pgsql/types](https://github.com/launchql/pgsql-parser/tree/main/packages/types): **📝 Type definitions** for PostgreSQL AST nodes in TypeScript.
* [@pgsql/utils](https://github.com/launchql/pgsql-parser/tree/main/packages/utils): **🛠️ AST utilities** for constructing and transforming PostgreSQL syntax trees.
* [launchql/pg-ast](https://github.com/launchql/launchql/tree/main/packages/pg-ast): **🔍 Low-level AST tools** and transformations for Postgres query structures.

### 🚀 API & Dev Tools

* [launchql/server](https://github.com/launchql/launchql/tree/main/packages/server): **⚡ Express-based API server** powered by PostGraphile to expose a secure, scalable GraphQL API over your Postgres database.
* [launchql/explorer](https://github.com/launchql/launchql/tree/main/packages/explorer): **🔎 Visual API explorer** with GraphiQL for browsing across all databases and schemas—useful for debugging, documentation, and API prototyping.

### 🔁 Streaming & Uploads

* [launchql/s3-streamer](https://github.com/launchql/launchql/tree/main/packages/s3-streamer): **📤 Direct S3 streaming** for large files with support for metadata injection and content validation.
* [launchql/etag-hash](https://github.com/launchql/launchql/tree/main/packages/etag-hash): **🏷️ S3-compatible ETags** created by streaming and hashing file uploads in chunks.
* [launchql/etag-stream](https://github.com/launchql/launchql/tree/main/packages/etag-stream): **🔄 ETag computation** via Node stream transformer during upload or transfer.
* [launchql/uuid-hash](https://github.com/launchql/launchql/tree/main/packages/uuid-hash): **🆔 Deterministic UUIDs** generated from hashed content, great for deduplication and asset referencing.
* [launchql/uuid-stream](https://github.com/launchql/launchql/tree/main/packages/uuid-stream): **🌊 Streaming UUID generation** based on piped file content—ideal for upload pipelines.
* [launchql/upload-names](https://github.com/launchql/launchql/tree/main/packages/upload-names): **📂 Collision-resistant filenames** utility for structured and unique file names for uploads.

### 🧰 CLI & Codegen

* [@launchql/cli](https://github.com/launchql/launchql/tree/main/packages/cli): **🖥️ Command-line toolkit** for managing LaunchQL projects—supports database scaffolding, migrations, seeding, code generation, and automation.
* [launchql/launchql-gen](https://github.com/launchql/launchql/tree/main/packages/launchql-gen): **✨ Auto-generated GraphQL** mutations and queries dynamically built from introspected schema data.
* [@launchql/query-builder](https://github.com/launchql/launchql/tree/main/packages/query-builder): **🏗️ SQL constructor** providing a robust TypeScript-based query builder for dynamic generation of `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and stored procedure calls—supports advanced SQL features like `JOIN`, `GROUP BY`, and schema-qualified queries.
* [@launchql/query](https://github.com/launchql/launchql/tree/main/packages/query): **🧩 Fluent GraphQL builder** for PostGraphile schemas. ⚡ Schema-aware via introspection, 🧩 composable and ergonomic for building deeply nested queries.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.