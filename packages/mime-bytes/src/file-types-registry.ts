// Master registry of all supported file types with magic bytes, MIME types, and extensions

export interface FileTypeDefinition {
  name: string;
  magicBytes: string[];  // Array of hex strings like ["0x89", "0x50", "0x4E", "0x47"]
  mimeType: string;
  extensions: string[];  // Array of valid extensions
  offset?: number;       // Optional byte offset for magic bytes
  description?: string;  // Human-readable description
  category?: string;     // Category for organization
  charset?: string;      // Character encoding (e.g., 'binary', 'utf-8')
  contentType?: string;  // More specific content type based on extension
}



export const FILE_TYPES: FileTypeDefinition[] = [
  // Image Formats
  {
    name: 'png',
    magicBytes: ['0x89', '0x50', '0x4E', '0x47', '0x0D', '0x0A', '0x1A', '0x0A'],
    mimeType: 'image/png',
    extensions: ['png', 'apng'],
    description: 'Portable Network Graphics',
    category: 'image',
    charset: 'binary'
  },
  
  {
    name: 'jpeg',
    magicBytes: ['0xFF', '0xD8', '0xFF'],
    mimeType: 'image/jpeg',
    extensions: ['jpg', 'jpeg', 'jpe', 'jif', 'jfif'],
    description: 'JPEG image format',
    category: 'image'
  },
  
  {
    name: 'gif',
    magicBytes: ['0x47', '0x49', '0x46', '0x38', '0x37', '0x61'],
    mimeType: 'image/gif',
    extensions: ['gif'],
    description: 'Graphics Interchange Format (GIF87a)',
    category: 'image'
  },
  
  {
    name: 'gif89a',
    magicBytes: ['0x47', '0x49', '0x46', '0x38', '0x39', '0x61'],
    mimeType: 'image/gif',
    extensions: ['gif'],
    description: 'Graphics Interchange Format (GIF89a)',
    category: 'image'
  },
  
  {
    name: 'webp',
    magicBytes: ['0x52', '0x49', '0x46', '0x46', '?', '?', '?', '?', '0x57', '0x45', '0x42', '0x50'],
    mimeType: 'image/webp',
    extensions: ['webp'],
    description: 'WebP image format',
    category: 'image'
  },
  
  {
    name: 'qoi',
    magicBytes: ['0x71', '0x6F', '0x69', '0x66'],
    mimeType: 'image/qoi',
    extensions: ['qoi'],
    description: 'Quite OK Image Format',
    category: 'image'
  },
  
  // PCT (Apple PICT) - No reliable magic bytes, extension-based detection only
  {
    name: 'pct',
    magicBytes: [], // PCT files don't have consistent magic bytes
    mimeType: 'image/x-pict',
    extensions: ['pct', 'pic', 'pict'],
    description: 'Apple PICT image format (legacy)',
    category: 'image'
  },
  
  // TGA (Truevision Targa) - No reliable magic bytes at offset 0
  {
    name: 'tga',
    magicBytes: [], // TGA files don't have magic bytes at the beginning
    mimeType: 'image/x-targa',
    extensions: ['tga', 'icb', 'vda', 'vst'],
    description: 'Truevision TGA image format',
    category: 'image'
  },
  
  {
    name: 'bmp',
    magicBytes: ['0x42', '0x4D'],
    mimeType: 'image/bmp',
    extensions: ['bmp'],
    description: 'Bitmap image format',
    category: 'image'
  },
  
  {
    name: 'ico',
    magicBytes: ['0x00', '0x00', '0x01', '0x00'],
    mimeType: 'image/x-icon',
    extensions: ['ico'],
    description: 'Icon format',
    category: 'image'
  },
  
  {
    name: 'tiff',
    magicBytes: ['0x49', '0x49', '0x2A', '0x00'],
    mimeType: 'image/tiff',
    extensions: ['tif', 'tiff'],
    description: 'Tagged Image File Format (little-endian)',
    category: 'image'
  },
  
  {
    name: 'tiff-be',
    magicBytes: ['0x4D', '0x4D', '0x00', '0x2A'],
    mimeType: 'image/tiff',
    extensions: ['tif', 'tiff'],
    description: 'Tagged Image File Format (big-endian)',
    category: 'image'
  },
  
  // Archive Formats
  {
    name: 'zip',
    magicBytes: ['0x50', '0x4B', '0x03', '0x04'],
    mimeType: 'application/zip',
    extensions: ['zip', 'aar', 'apk', 'docx', 'epub', 'ipa', 'jar', 'kmz', 'maff', 'msix', 'odp', 'ods', 'odt', 'pk3', 'pk4', 'pptx', 'usdz', 'vsdx', 'xlsx', 'xpi', 'whl'],
    description: 'ZIP archive and related formats',
    category: 'archive'
  },
  
  {
    name: 'zip-empty',
    magicBytes: ['0x50', '0x4B', '0x05', '0x06'],
    mimeType: 'application/zip',
    extensions: ['zip'],
    description: 'Empty ZIP archive',
    category: 'archive'
  },
  
  {
    name: 'zip-spanned',
    magicBytes: ['0x50', '0x4B', '0x07', '0x08'],
    mimeType: 'application/zip',
    extensions: ['zip'],
    description: 'Spanned ZIP archive',
    category: 'archive'
  },
  
  {
    name: 'rar',
    magicBytes: ['0x52', '0x61', '0x72', '0x21', '0x1A', '0x07', '0x00'],
    mimeType: 'application/x-rar-compressed',
    extensions: ['rar'],
    description: 'RAR archive format',
    category: 'archive'
  },
  
  {
    name: 'rar5',
    magicBytes: ['0x52', '0x61', '0x72', '0x21', '0x1A', '0x07', '0x01', '0x00'],
    mimeType: 'application/x-rar-compressed',
    extensions: ['rar'],
    description: 'RAR5 archive format',
    category: 'archive'
  },
  
  {
    name: '7z',
    magicBytes: ['0x37', '0x7A', '0xBC', '0xAF', '0x27', '0x1C'],
    mimeType: 'application/x-7z-compressed',
    extensions: ['7z'],
    description: '7-Zip archive format',
    category: 'archive'
  },
  
  {
    name: 'tar',
    magicBytes: ['0x75', '0x73', '0x74', '0x61', '0x72'],
    mimeType: 'application/x-tar',
    extensions: ['tar'],
    offset: 257,
    description: 'TAR archive',
    category: 'archive'
  },
  
  {
    name: 'gz',
    magicBytes: ['0x1F', '0x8B'],
    mimeType: 'application/gzip',
    extensions: ['gz', 'gzip'],
    description: 'GZIP compressed file',
    category: 'archive'
  },
  
  {
    name: 'bz2',
    magicBytes: ['0x42', '0x5A', '0x68'],
    mimeType: 'application/x-bzip2',
    extensions: ['bz2'],
    description: 'BZIP2 compressed file',
    category: 'archive'
  },
  
  {
    name: 'xz',
    magicBytes: ['0xFD', '0x37', '0x7A', '0x58', '0x5A', '0x00'],
    mimeType: 'application/x-xz',
    extensions: ['xz'],
    description: 'XZ compressed file',
    category: 'archive'
  },
  
  // Document Formats
  {
    name: 'pdf',
    magicBytes: ['0x25', '0x50', '0x44', '0x46'],
    mimeType: 'application/pdf',
    extensions: ['pdf'],
    description: 'Portable Document Format',
    category: 'document'
  },
  
  {
    name: 'ps',
    magicBytes: ['0x25', '0x21', '0x50', '0x53'],
    mimeType: 'application/postscript',
    extensions: ['ps'],
    description: 'PostScript document',
    category: 'document'
  },
  
  {
    name: 'eps',
    magicBytes: ['0x25', '0x21', '0x50', '0x53', '0x2D', '0x41', '0x64', '0x6F', '0x62', '0x65'],
    mimeType: 'application/eps',
    extensions: ['eps', 'epsf'],
    description: 'Encapsulated PostScript',
    category: 'document'
  },
  
  {
    name: 'rtf',
    magicBytes: ['0x7B', '0x5C', '0x72', '0x74', '0x66'],
    mimeType: 'application/rtf',
    extensions: ['rtf'],
    description: 'Rich Text Format',
    category: 'document'
  },
  
  // Media Formats
  {
    name: 'mp4',
    magicBytes: ['0x66', '0x74', '0x79', '0x70'],
    mimeType: 'video/mp4',
    extensions: ['mp4', 'm4v', 'm4p', 'm4b', 'f4v', 'f4p', 'f4b', 'f4a'],
    offset: 4,
    description: 'MP4 video format',
    category: 'video'
  },
  
  {
    name: '3gp',
    magicBytes: ['0x66', '0x74', '0x79', '0x70', '0x33', '0x67'],
    mimeType: 'video/3gpp',
    extensions: ['3gp', '3g2'],
    offset: 4,
    description: '3GP video format',
    category: 'video'
  },
  
  {
    name: 'heic',
    magicBytes: ['0x66', '0x74', '0x79', '0x70', '0x68', '0x65', '0x69', '0x63'],
    mimeType: 'image/heic',
    extensions: ['heic'],
    offset: 4,
    description: 'High Efficiency Image Container',
    category: 'image'
  },
  
  {
    name: 'heif',
    magicBytes: ['0x66', '0x74', '0x79', '0x70', '0x6D', '0x69', '0x66', '0x31'],
    mimeType: 'image/heif',
    extensions: ['heif'],
    offset: 4,
    description: 'High Efficiency Image Format',
    category: 'image'
  },
  
  {
    name: 'mp3',
    magicBytes: ['0x49', '0x44', '0x33'],
    mimeType: 'audio/mpeg',
    extensions: ['mp3'],
    description: 'MP3 audio format',
    category: 'audio'
  },
  
  {
    name: 'mp3-sync',
    magicBytes: ['0xFF', '0xFB'],
    mimeType: 'audio/mpeg',
    extensions: ['mp3'],
    description: 'MP3 audio format (sync)',
    category: 'audio'
  },
  
  {
    name: 'flac',
    magicBytes: ['0x66', '0x4C', '0x61', '0x43'],
    mimeType: 'audio/flac',
    extensions: ['flac'],
    description: 'FLAC audio format',
    category: 'audio'
  },
  
  {
    name: 'wav',
    magicBytes: ['0x52', '0x49', '0x46', '0x46', '?', '?', '?', '?', '0x57', '0x41', '0x56', '0x45'],
    mimeType: 'audio/wav',
    extensions: ['wav'],
    description: 'WAV audio format',
    category: 'audio'
  },
  
  {
    name: 'ogg',
    magicBytes: ['0x4F', '0x67', '0x67', '0x53'],
    mimeType: 'audio/ogg',
    extensions: ['ogg', 'oga', 'ogv'],
    description: 'OGG container format',
    category: 'audio'
  },
  
  {
    name: 'avi',
    magicBytes: ['0x52', '0x49', '0x46', '0x46', '?', '?', '?', '?', '0x41', '0x56', '0x49', '0x20'],
    mimeType: 'video/x-msvideo',
    extensions: ['avi'],
    description: 'AVI video format',
    category: 'video'
  },
  
  {
    name: 'mkv',
    magicBytes: ['0x1A', '0x45', '0xDF', '0xA3'],
    mimeType: 'video/x-matroska',
    extensions: ['mkv', 'mka', 'mks', 'mk3d', 'webm'],
    description: 'Matroska video format',
    category: 'video'
  },
  
  {
    name: 'mov',
    magicBytes: ['0x66', '0x74', '0x79', '0x70', '0x71', '0x74'],
    mimeType: 'video/quicktime',
    extensions: ['mov'],
    offset: 4,
    description: 'QuickTime video format',
    category: 'video'
  },
  
  // Executable Formats
  {
    name: 'exe',
    magicBytes: ['0x4D', '0x5A'],
    mimeType: 'application/x-msdownload',
    extensions: ['exe', 'dll', 'mui', 'sys', 'scr', 'cpl', 'ocx', 'ax', 'iec', 'ime', 'rs', 'tsp', 'fon', 'efi'],
    description: 'Windows PE executable',
    category: 'executable'
  },
  
  {
    name: 'elf',
    magicBytes: ['0x7F', '0x45', '0x4C', '0x46'],
    mimeType: 'application/x-elf',
    extensions: ['elf', 'axf', 'bin', 'o', 'out', 'prx', 'puff', 'ko', 'mod', 'so'],
    description: 'ELF executable format',
    category: 'executable'
  },
  
  {
    name: 'macho-32',
    magicBytes: ['0xFE', '0xED', '0xFA', '0xCE'],
    mimeType: 'application/x-mach-binary',
    extensions: ['macho'],
    description: 'Mach-O 32-bit executable format',
    category: 'executable'
  },
  
  {
    name: 'macho-64',
    magicBytes: ['0xFE', '0xED', '0xFA', '0xCF'],
    mimeType: 'application/x-mach-binary',
    extensions: ['macho'],
    description: 'Mach-O 64-bit executable format',
    category: 'executable'
  },
  
  {
    name: 'macho-universal',
    magicBytes: ['0xCA', '0xFE', '0xBA', '0xBE'],
    mimeType: 'application/x-mach-binary',
    extensions: ['macho'],
    description: 'Mach-O universal binary',
    category: 'executable'
  },
  
  {
    name: 'class',
    magicBytes: ['0xCA', '0xFE', '0xBA', '0xBE'],
    mimeType: 'application/java-vm',
    extensions: ['class'],
    description: 'Java class file',
    category: 'executable'
  },
  
  {
    name: 'dex',
    magicBytes: ['0x64', '0x65', '0x78', '0x0A', '0x30', '0x33', '0x35', '0x00'],
    mimeType: 'application/x-dex',
    extensions: ['dex'],
    description: 'Dalvik Executable',
    category: 'executable'
  },
  
  {
    name: 'wasm',
    magicBytes: ['0x00', '0x61', '0x73', '0x6D'],
    mimeType: 'application/wasm',
    extensions: ['wasm'],
    description: 'WebAssembly binary format',
    category: 'executable'
  },
  
  // Font Formats
  {
    name: 'ttf',
    magicBytes: ['0x00', '0x01', '0x00', '0x00'],
    mimeType: 'font/ttf',
    extensions: ['ttf'],
    description: 'TrueType font',
    category: 'font'
  },
  
  {
    name: 'otf',
    magicBytes: ['0x4F', '0x54', '0x54', '0x4F'],
    mimeType: 'font/otf',
    extensions: ['otf'],
    description: 'OpenType font',
    category: 'font'
  },
  
  {
    name: 'woff',
    magicBytes: ['0x77', '0x4F', '0x46', '0x46'],
    mimeType: 'font/woff',
    extensions: ['woff'],
    description: 'Web Open Font Format',
    category: 'font'
  },
  
  {
    name: 'woff2',
    magicBytes: ['0x77', '0x4F', '0x46', '0x32'],
    mimeType: 'font/woff2',
    extensions: ['woff2'],
    description: 'Web Open Font Format 2',
    category: 'font'
  },
  
  {
    name: 'eot',
    magicBytes: ['0x4C', '0x50'],
    mimeType: 'application/vnd.ms-fontobject',
    extensions: ['eot'],
    offset: 34,
    description: 'Embedded OpenType font',
    category: 'font'
  },
  
  // Database Formats
  {
    name: 'sqlite',
    magicBytes: ['0x53', '0x51', '0x4C', '0x69', '0x74', '0x65', '0x20', '0x66', '0x6F', '0x72', '0x6D', '0x61', '0x74', '0x20', '0x33', '0x00'],
    mimeType: 'application/x-sqlite3',
    extensions: ['sqlite', 'sqlite3', 'db', 'db3'],
    description: 'SQLite database',
    category: 'database'
  },
  
  // Text Formats with BOM
  {
    name: 'utf8',
    magicBytes: ['0xEF', '0xBB', '0xBF'],
    mimeType: 'text/plain',
    extensions: ['txt', 'xml', 'json', 'csv', 'md', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'sql', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'log'],
    description: 'UTF-8 text with BOM',
    category: 'text',
    charset: 'utf-8'
  },
  
  {
    name: 'utf16le',
    magicBytes: ['0xFF', '0xFE'],
    mimeType: 'text/plain',
    extensions: ['txt', 'xml', 'json', 'csv', 'md', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'hpp'],
    description: 'UTF-16 LE text with BOM',
    category: 'text'
  },
  
  {
    name: 'utf16be',
    magicBytes: ['0xFE', '0xFF'],
    mimeType: 'text/plain',
    extensions: ['txt', 'xml', 'json', 'csv', 'md', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'hpp'],
    description: 'UTF-16 BE text with BOM',
    category: 'text'
  },
  
  {
    name: 'utf32le',
    magicBytes: ['0xFF', '0xFE', '0x00', '0x00'],
    mimeType: 'text/plain',
    extensions: ['txt', 'xml', 'json', 'csv', 'md', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'hpp'],
    description: 'UTF-32 LE text with BOM',
    category: 'text'
  },
  
  {
    name: 'utf32be',
    magicBytes: ['0x00', '0x00', '0xFE', '0xFF'],
    mimeType: 'text/plain',
    extensions: ['txt', 'xml', 'json', 'csv', 'md', 'html', 'css', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'h', 'hpp'],
    description: 'UTF-32 BE text with BOM',
    category: 'text'
  },
  
  // Other Formats
  {
    name: 'xml',
    magicBytes: ['0x3C', '0x3F', '0x78', '0x6D', '0x6C'],
    mimeType: 'application/xml',
    extensions: ['xml'],
    description: 'XML document',
    category: 'text'
  },
  
  {
    name: 'swf',
    magicBytes: ['0x43', '0x57', '0x53'],
    mimeType: 'application/x-shockwave-flash',
    extensions: ['swf'],
    description: 'Shockwave Flash',
    category: 'other'
  },
  
  {
    name: 'swf-compressed',
    magicBytes: ['0x46', '0x57', '0x53'],
    mimeType: 'application/x-shockwave-flash',
    extensions: ['swf'],
    description: 'Shockwave Flash (compressed)',
    category: 'other'
  },
  
  {
    name: 'psd',
    magicBytes: ['0x38', '0x42', '0x50', '0x53'],
    mimeType: 'image/vnd.adobe.photoshop',
    extensions: ['psd'],
    description: 'Adobe Photoshop document',
    category: 'image'
  },
  
  {
    name: 'indd',
    magicBytes: ['0x06', '0x06', '0xED', '0xF5', '0xD8', '0x1D', '0x46', '0xE5', '0xBD', '0x31', '0xEF', '0xE7', '0xFE', '0x74', '0xB7', '0x1D'],
    mimeType: 'application/x-indesign',
    extensions: ['indd'],
    description: 'Adobe InDesign document',
    category: 'document'
  },

  // Additional Archive Formats
  {
    name: 'cab',
    magicBytes: ['0x4D', '0x53', '0x43', '0x46'],
    mimeType: 'application/vnd.ms-cab-compressed',
    extensions: ['cab'],
    description: 'Microsoft Cabinet archive',
    category: 'archive',
    charset: 'binary'
  },

  {
    name: 'deb',
    magicBytes: ['0x21', '0x3C', '0x61', '0x72', '0x63', '0x68', '0x3E'],
    mimeType: 'application/x-debian-package',
    extensions: ['deb'],
    description: 'Debian package',
    category: 'archive',
    charset: 'binary'
  },

  {
    name: 'ar',
    magicBytes: ['0x21', '0x3C', '0x61', '0x72', '0x63', '0x68', '0x3E'],
    mimeType: 'application/x-archive',
    extensions: ['ar', 'a'],
    description: 'Unix archive',
    category: 'archive',
    charset: 'binary'
  },

  {
    name: 'rpm',
    magicBytes: ['0xED', '0xAB', '0xEE', '0xDB'],
    mimeType: 'application/x-rpm',
    extensions: ['rpm'],
    description: 'Red Hat Package Manager',
    category: 'archive',
    charset: 'binary'
  },

  // Additional Audio Formats
  {
    name: 'm4a',
    magicBytes: ['0x66', '0x74', '0x79', '0x70', '0x4D', '0x34', '0x41'],
    mimeType: 'audio/mp4',
    extensions: ['m4a'],
    offset: 4,
    description: 'MPEG-4 Audio',
    category: 'audio',
    charset: 'binary'
  },

  {
    name: 'opus',
    magicBytes: ['0x4F', '0x70', '0x75', '0x73', '0x48', '0x65', '0x61', '0x64'],
    mimeType: 'audio/opus',
    extensions: ['opus'],
    description: 'Opus audio',
    category: 'audio',
    charset: 'binary'
  },

  {
    name: 'amr',
    magicBytes: ['0x23', '0x21', '0x41', '0x4D', '0x52'],
    mimeType: 'audio/amr',
    extensions: ['amr'],
    description: 'Adaptive Multi-Rate audio',
    category: 'audio',
    charset: 'binary'
  },

  {
    name: 'spx',
    magicBytes: ['0x53', '0x70', '0x65', '0x65', '0x78', '0x20', '0x20', '0x20'],
    mimeType: 'audio/speex',
    extensions: ['spx'],
    description: 'Speex audio',
    category: 'audio',
    charset: 'binary'
  },

  // Additional Video Formats
  {
    name: 'webm',
    magicBytes: ['0x1A', '0x45', '0xDF', '0xA3'],
    mimeType: 'video/webm',
    extensions: ['webm'],
    description: 'WebM video',
    category: 'video',
    charset: 'binary'
  },
  
  {
    name: 'mp2t',
    magicBytes: ['0x47'],
    mimeType: 'video/mp2t',
    extensions: ['ts', 'mts', 'm2ts'],
    description: 'MPEG Transport Stream',
    category: 'video',
    charset: 'binary'
  },

  // AutoCAD DWG - Multiple versions with different signatures
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x2E', '0x32'], // AC1.2
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R1.2)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x2E', '0x34', '0x30'], // AC1.40
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R1.40)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x2E', '0x35', '0x30'], // AC1.50
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R1.50)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x30', '0x30'], // AC2.00
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.00)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x31', '0x30'], // AC2.10
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.10)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x32', '0x31'], // AC2.21
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.21)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x32', '0x32'], // AC2.22
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.22)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x35', '0x30'], // AC2.50
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.50)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x32', '0x2E', '0x36', '0x30'], // AC2.60
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R2.60)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x30', '0x31'], // AC1001
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R9)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x30', '0x32'], // AC1002
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R10)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x30', '0x33'], // AC1003
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R11)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x30', '0x34'], // AC1004
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R12)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x31', '0x32'], // AC1012
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R13)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x31', '0x34'], // AC1014
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (R14)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x31', '0x35'], // AC1015
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2000)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x31', '0x38'], // AC1018
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2004)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x32', '0x31'], // AC1021
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2007)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x32', '0x34'], // AC1024
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2010)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x32', '0x37'], // AC1027
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2013)',
    category: 'cad',
    charset: 'binary'
  },
  {
    name: 'dwg',
    magicBytes: ['0x41', '0x43', '0x31', '0x30', '0x33', '0x32'], // AC1032
    mimeType: 'application/acad',
    extensions: ['dwg'],
    description: 'AutoCAD Drawing (2018)',
    category: 'cad',
    charset: 'binary'
  },

  // Enhanced Metafile (EMF)
  {
    name: 'emf',
    magicBytes: ['0x01', '0x00', '0x00', '0x00'],
    mimeType: 'image/emf',
    extensions: ['emf'],
    description: 'Enhanced Metafile',
    category: 'image',
    charset: 'binary'
  },

  {
    name: 'mpg',
    magicBytes: ['0x00', '0x00', '0x01', '0xBA'],
    mimeType: 'video/mpeg',
    extensions: ['mpg', 'mpeg'],
    description: 'MPEG video',
    category: 'video',
    charset: 'binary'
  },

  {
    name: 'mp2',
    magicBytes: ['0x00', '0x00', '0x01', '0xB3'],
    mimeType: 'video/mpeg',
    extensions: ['mp2', 'm2v'],
    description: 'MPEG-2 video',
    category: 'video',
    charset: 'binary'
  },

  {
    name: 'flv',
    magicBytes: ['0x46', '0x4C', '0x56'],
    mimeType: 'video/x-flv',
    extensions: ['flv'],
    description: 'Flash Video',
    category: 'video',
    charset: 'binary'
  },

  // Additional Font Formats
  {
    name: 'ttc',
    magicBytes: ['0x74', '0x74', '0x63', '0x66'],
    mimeType: 'font/collection',
    extensions: ['ttc'],
    description: 'TrueType font collection',
    category: 'font',
    charset: 'binary'
  },

  // Office Document Formats (ZIP-based)
  {
    name: 'docx',
    magicBytes: ['0x50', '0x4B', '0x03', '0x04'],
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['docx'],
    description: 'Microsoft Word document',
    category: 'document',
    charset: 'binary',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },

  {
    name: 'xlsx',
    magicBytes: ['0x50', '0x4B', '0x03', '0x04'],
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['xlsx'],
    description: 'Microsoft Excel spreadsheet',
    category: 'document',
    charset: 'binary',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },

  {
    name: 'pptx',
    magicBytes: ['0x50', '0x4B', '0x03', '0x04'],
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['pptx'],
    description: 'Microsoft PowerPoint presentation',
    category: 'document',
    charset: 'binary',
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
];

// Content type mapping for more specific MIME types
// Format: [extensions[], contentType, charset?]
export type ContentTypeMapping = [string[], string] | [string[], string, string];

export const CONTENT_TYPE_MAPPINGS: ContentTypeMapping[] = [
  // TypeScript files (charset-dependent)
  [['ts'], 'text/x-typescript', 'utf-8'],
  [['ts'], 'video/mp2t', 'binary'],
  [['tsx'], 'text/x-typescript', 'utf-8'],
  
  // Office Open XML formats (detected as application/zip but have specific content types)
  [['docx'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'binary'],
  [['xlsx'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'binary'],
  [['pptx'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'binary'],
  
  // Other ZIP-based formats
  [['epub'], 'application/epub+zip', 'binary'],
  [['jar'], 'application/java-archive', 'binary'],
  [['apk'], 'application/vnd.android.package-archive', 'binary'],
  [['xpi'], 'application/x-xpinstall', 'binary'],
  
  // Font files
  [['ttf'], 'font/ttf'],
  [['otf'], 'font/otf'],
  [['woff'], 'font/woff'],
  [['woff2'], 'font/woff2'],
  [['eot'], 'application/vnd.ms-fontobject'],
  [['svg'], 'image/svg+xml'],
  
  // OpenDocument formats
  [['ods'], 'application/vnd.oasis.opendocument.spreadsheet'],
  [['odt'], 'application/vnd.oasis.opendocument.text'],
  [['odp'], 'application/vnd.oasis.opendocument.presentation'],
  [['odg'], 'application/vnd.oasis.opendocument.graphics'],
  
  // CAD formats
  [['dxf'], 'image/vnd.dxf', 'ascii'],  // DXF is typically text-based
  [['dxf'], 'image/vnd.dxf', 'utf-8'],  // Modern DXF files might be UTF-8
  [['emf'], 'image/emf', 'binary'],
  
  // Archive formats
  [['zip'], 'application/zip'],
  [['rar'], 'application/x-rar-compressed'],
  [['7z'], 'application/x-7z-compressed'],
  [['tar'], 'application/x-tar'],
  [['gz', 'gzip'], 'application/gzip'],
  [['bz2'], 'application/x-bzip2'],
  [['xz'], 'application/x-xz'],
  [['Z'], 'application/x-compress'],
  [['lz'], 'application/x-lzip'],
  [['lzh'], 'application/x-lzh-compressed'],
  [['zst'], 'application/zstd'],
  [['cab'], 'application/vnd.ms-cab-compressed'],
  [['deb'], 'application/x-deb'],
  [['ar'], 'application/x-unix-archive'],
  [['rpm'], 'application/x-rpm'],
  [['cpio'], 'application/x-cpio'],
  [['arj'], 'application/x-arj'],
  [['ace'], 'application/x-ace-compressed'],
  [['asar'], 'application/x-asar'],
  [['tar.gz'], 'application/gzip'],
  
  // Image formats
  [['jpg'], 'image/jpeg'],
  [['png'], 'image/png'],
  [['apng'], 'image/apng'],
  [['gif'], 'image/gif'],
  [['webp'], 'image/webp'],
  [['flif'], 'image/flif'],
  [['xcf'], 'image/x-xcf'],
  [['cr2'], 'image/x-canon-cr2'],
  [['cr3'], 'image/x-canon-cr3'],
  [['orf'], 'image/x-olympus-orf'],
  [['arw'], 'image/x-sony-arw'],
  [['dng'], 'image/x-adobe-dng'],
  [['nef'], 'image/x-nikon-nef'],
  [['rw2'], 'image/x-panasonic-rw2'],
  [['raf'], 'image/x-fujifilm-raf'],
  [['tif'], 'image/tiff'],
  [['bmp'], 'image/bmp'],
  [['icns'], 'image/icns'],
  [['jxr'], 'image/vnd.ms-photo'],
  [['psd'], 'image/vnd.adobe.photoshop'],
  [['ico'], 'image/x-icon'],
  [['cur'], 'image/x-icon'],
  [['bpg'], 'image/bpg'],
  [['j2c'], 'image/j2c'],
  [['jp2'], 'image/jp2'],
  [['jpm'], 'image/jpm'],
  [['jpx'], 'image/jpx'],
  [['mj2'], 'image/mj2'],
  [['heic'], 'image/heic'],
  [['heif'], 'image/heif'],
  [['avif'], 'image/avif'],
  [['jxl'], 'image/jxl'],
  [['jls'], 'image/jls'],
  [['ktx'], 'image/ktx'],
  [['dwg'], 'application/acad', 'binary'],

  
  // Video formats
  [['mp4'], 'video/mp4'],
  [['mkv'], 'video/matroska'],
  [['webm'], 'video/webm'],
  [['mov'], 'video/quicktime'],
  [['avi'], 'video/vnd.avi'],
  [['mpg'], 'video/mpeg'],
  [['mp2'], 'video/mpeg'],
  [['mp1'], 'video/MP1S'],
  [['mts'], 'video/mp2t'],
  [['m2ts'], 'video/mp2t'],
  [['3gp'], 'video/3gpp'],
  [['3g2'], 'video/3gpp2'],
  [['flv'], 'video/x-flv'],
  [['m4v'], 'video/x-m4v'],
  [['f4v'], 'video/x-m4v'],
  [['ogv'], 'video/ogg'],
  [['asf'], 'video/x-ms-asf'],
  
  // Audio formats
  [['mp3'], 'audio/mpeg'],
  [['m4a'], 'audio/x-m4a'],
  [['m4p'], 'audio/mp4'],
  [['m4b'], 'audio/mp4'],
  [['f4a'], 'audio/mp4'],
  [['f4b'], 'audio/mp4'],
  [['oga'], 'audio/ogg'],
  [['ogg'], 'audio/ogg'],
  [['opus'], 'audio/ogg; codecs=opus'],
  [['flac'], 'audio/flac'],
  [['wav'], 'audio/wav'],
  [['spx'], 'audio/ogg'],
  [['amr'], 'audio/amr'],
  [['mid'], 'audio/midi'],
  [['aif'], 'audio/aiff'],
  [['aiff'], 'audio/aiff'],
  [['qcp'], 'audio/qcelp'],
  [['ape'], 'audio/ape'],
  [['wv'], 'audio/wavpack'],
  [['mpc'], 'audio/x-musepack'],
  [['voc'], 'audio/x-voc'],
  [['ac3'], 'audio/vnd.dolby.dd-raw'],
  [['aac'], 'audio/aac'],
  [['it'], 'audio/x-it'],
  [['s3m'], 'audio/x-s3m'],
  [['xm'], 'audio/x-xm'],
  [['dsf'], 'audio/x-dsf'],
  
  // Document formats
  [['pdf'], 'application/pdf'],
  [['rtf'], 'application/rtf'],
  [['ps'], 'application/postscript'],
  [['eps'], 'application/eps'],
  [['indd'], 'application/x-indesign'],
  
  // Text formats
  [['xml'], 'application/xml'],
  [['ics'], 'text/calendar'],
  [['vcf'], 'text/vcard'],
  [['vtt'], 'text/vtt'],
  
  // Font formats (additional)
  [['ttc'], 'font/collection'],
  
  // Model/3D formats
  [['glb'], 'model/gltf-binary'],
  [['stl'], 'model/stl'],
  [['3mf'], 'model/3mf'],
  [['fbx'], 'application/x-autodesk.fbx'],
  [['blend'], 'application/x-blender'],
  [['skp'], 'application/vnd.sketchup.skp'],
  
  // Microsoft Office formats (additional)
  [['docm'], 'application/vnd.ms-word.document.macroenabled.12'],
  [['dotm'], 'application/vnd.ms-word.template.macroenabled.12'],
  [['dotx'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.template'],
  [['xlsm'], 'application/vnd.ms-excel.sheet.macroenabled.12'],
  [['xltm'], 'application/vnd.ms-excel.template.macroenabled.12'],
  [['xltx'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.template'],
  [['pptm'], 'application/vnd.ms-powerpoint.presentation.macroenabled.12'],
  [['potm'], 'application/vnd.ms-powerpoint.template.macroenabled.12'],
  [['potx'], 'application/vnd.openxmlformats-officedocument.presentationml.template'],
  [['ppsm'], 'application/vnd.ms-powerpoint.slideshow.macroenabled.12'],
  [['ppsx'], 'application/vnd.openxmlformats-officedocument.presentationml.slideshow'],
  [['vsdx'], 'application/vnd.visio'],
  [['pst'], 'application/vnd.ms-outlook'],
  
  // OpenDocument templates
  [['ott'], 'application/vnd.oasis.opendocument.text-template'],
  [['ots'], 'application/vnd.oasis.opendocument.spreadsheet-template'],
  [['otp'], 'application/vnd.oasis.opendocument.presentation-template'],
  [['otg'], 'application/vnd.oasis.opendocument.graphics-template'],
  
  // Executable/Binary formats
  [['exe'], 'application/x-msdownload'],
  [['elf'], 'application/x-elf'],
  [['macho'], 'application/x-mach-binary'],
  [['class'], 'application/java-vm'],
  [['swf'], 'application/x-shockwave-flash'],
  [['wasm'], 'application/wasm'],
  [['crx'], 'application/x-google-chrome-extension'],
  
  // Database formats
  [['sqlite'], 'application/x-sqlite3'],
  
  // Data formats
  [['arrow'], 'application/vnd.apache.arrow.file'],
  [['parquet'], 'application/vnd.apache.parquet'],
  [['avro'], 'application/avro'],
  
  // Disk/System formats
  [['dmg'], 'application/x-apple-diskimage'],
  [['reg'], 'application/x-ms-regedit'],
  [['dat'], 'application/x-ft-windows-registry-hive'],
  
  // E-book formats
  [['mobi'], 'application/x-mobipocket-ebook'],
  [['chm'], 'application/vnd.ms-htmlhelp'],
  
  // Miscellaneous formats
  [['cfb'], 'application/x-cfb'],
  [['mxf'], 'application/mxf'],
  [['mie'], 'application/x-mie'],
  [['nes'], 'application/x-nintendo-nes-rom'],
  [['pcap'], 'application/vnd.tcpdump.pcap'],
  [['shp'], 'application/x-esri-shape'],
  [['pgp'], 'application/pgp-encrypted'],
  [['icc'], 'application/vnd.iccprofile'],
  [['dcm'], 'application/dicom'],
  [['rm'], 'application/vnd.rn-realmedia'],
  [['ogm'], 'application/ogg'],
  [['ogx'], 'application/ogg'],
  
  // Programming and markup languages
  [['less'], 'text/x-less', 'utf-8'],
  [['md'], 'text/markdown', 'utf-8'],
  [['scss'], 'text/x-scss', 'utf-8'],
  [['sh'], 'application/x-sh', 'utf-8'],
  [['sql'], 'application/x-sql', 'utf-8'],
  [['yaml'], 'application/x-yaml', 'utf-8'],
  [['yml'], 'application/x-yaml', 'utf-8'],
  [['jsx'], 'text/jsx', 'utf-8'],
  [['js'], 'application/javascript', 'utf-8'],
  [['json'], 'application/json', 'utf-8'],
  [['html'], 'text/html', 'utf-8'],
  [['htm'], 'text/html', 'utf-8'],
  [['css'], 'text/css', 'utf-8'],
  [['txt'], 'text/plain', 'utf-8'],
  [['csv'], 'text/csv', 'utf-8'],
  [['tsv'], 'text/tab-separated-values', 'utf-8'],
  
  // Legacy image formats
  [['pct'], 'image/x-pict'],
  [['tga'], 'image/x-targa']
];

// Utility functions for working with the registry
export function getFileTypeByMagicBytes(magicBytes: string, offset: number = 0): FileTypeDefinition | null {
  return FILE_TYPES.find(type => {
    // Skip file types with no magic bytes (extension-only detection)
    if (!type.magicBytes || type.magicBytes.length === 0) return false;
    
    if (type.offset !== undefined && type.offset !== offset) return false;
    
    // Convert magic bytes to hex string for comparison
    const typeSignature = type.magicBytes.map(b => b.replace(/0x/i, '')).join('').toLowerCase();
    const inputSignature = magicBytes.toLowerCase();
    
    // Handle wildcards in signatures
    return matchSignatureWithWildcards(typeSignature, inputSignature);
  }) || null;
}

export function getFileTypeByExtension(extension: string): FileTypeDefinition[] {
  const cleanExt = extension.toLowerCase().replace(/^\./, '');
  return FILE_TYPES.filter(type => 
    type.extensions.some(ext => ext.toLowerCase() === cleanExt)
  );
}

export function getFileTypesByCategory(category: string): FileTypeDefinition[] {
  return FILE_TYPES.filter(type => type.category === category);
}

// Helper function to match signatures with wildcards
function matchSignatureWithWildcards(pattern: string, input: string): boolean {
  if (pattern === input) return true;
  
  // Handle wildcards (?) in the pattern
  const regexPattern = pattern.replace(/\?/g, '[0-9a-f]{2}');
  const regex = new RegExp(`^${regexPattern}`, 'i');
  return regex.test(input);
}

// Helper function to find content type by extension
export function getContentTypeByExtension(extension: string): string | null {
  const cleanExt = extension.toLowerCase().replace(/^\./, '');
  
  for (const mapping of CONTENT_TYPE_MAPPINGS) {
    if (mapping[0].includes(cleanExt)) {
      return mapping[1];
    }
  }
  
  return null;
}

// Charset detection logic - derived from bytes automatically
export function detectCharset(buffer: Buffer): string {
  // Step 1: Check for BOM (Byte Order Mark) patterns
  const hex = buffer.slice(0, 4).toString('hex');
  
  if (hex.startsWith('efbbbf')) return 'utf-8';
  if (hex.startsWith('fffe')) return 'utf-16le';
  if (hex.startsWith('feff')) return 'utf-16be';
  if (hex.startsWith('0000feff')) return 'utf-32be';
  if (hex.startsWith('fffe0000')) return 'utf-32le';
  
  // Step 2: Check for binary characteristics
  const sample = buffer.slice(0, Math.min(buffer.length, 1024)); // Check first 1KB
  let nullCount = 0;
  let controlCount = 0;
  
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    if (byte === 0) nullCount++;
    // Count control characters except tab, newline, carriage return
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      controlCount++;
    }
  }
  
  const nullRatio = nullCount / sample.length;
  const controlRatio = controlCount / sample.length;
  
  // If more than 10% null bytes or control characters, likely binary
  if (nullRatio > 0.1 || controlRatio > 0.1) {
    return 'binary';
  }
  
  // Step 3: Try to decode as UTF-8 to validate
  try {
    // Use TextDecoder with fatal flag to validate UTF-8
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return 'utf-8';
  } catch {
    // If UTF-8 decoding fails, it might be a legacy encoding
    // Return 'ascii' as a conservative guess (could also return 'unknown')
    return 'ascii';
  }
}

export function getContentTypeForExtension(extension: string, charset?: string): string | null {
  // Normalize extension
  const ext = extension.toLowerCase().replace(/^\./, '');
  
  // If charset is provided, look for exact matches first
  if (charset) {
    const exactMatch = CONTENT_TYPE_MAPPINGS.find(
      mapping => mapping[0].includes(ext) && mapping[2] === charset
    );
    if (exactMatch) {
      return exactMatch[1];
    }
  }
  
  // Fall back to mappings without charset requirements
  const generalMatch = CONTENT_TYPE_MAPPINGS.find(
    mapping => mapping[0].includes(ext) && mapping.length === 2
  );
  
  return generalMatch ? generalMatch[1] : null;
}

// Detection result interface
export interface DetectionResult {
  name: string;
  mimeType: string;
  extensions: string[];
  charset: string;
  contentType: string;
  confidence: number; // 0-1 confidence score
}