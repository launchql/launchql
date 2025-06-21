// Extension utility functions

// Normalize file extension
export function normalizeExtension(extension: string): string {
  return extension.toLowerCase().replace(/^\./, '');
}

// Extract extension from filename
export function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return normalizeExtension(filename.substring(lastDot + 1));
}

// Check if extension is commonly associated with compressed files
export function isCompressedExtension(extension: string): boolean {
  const compressed = [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'lz', 'lzma', 'z',
    'tgz', 'tbz', 'tbz2', 'txz', 'tlz', 'arc', 'arj', 'cab', 'dmg',
    'iso', 'lha', 'lzh', 'pkg', 'deb', 'rpm', 'msi', 'jar', 'war',
    'ear', 'sar', 'aar', 'apk', 'ipa', 'xpi', 'egg', 'whl', 'gem'
  ];
  return compressed.includes(normalizeExtension(extension));
}

// Check if extension is commonly associated with document files
export function isDocumentExtension(extension: string): boolean {
  const documents = [
    'pdf', 'doc', 'docx', 'odt', 'rtf', 'tex', 'wpd', 'txt', 'md',
    'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'epub', 'mobi',
    'azw', 'azw3', 'fb2', 'lit', 'pdb', 'ps', 'eps', 'indd', 'xps'
  ];
  return documents.includes(normalizeExtension(extension));
}

// Check if extension is commonly associated with media files
export function isMediaExtension(extension: string): boolean {
  const media = [
    // Video
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'vob', 'ogv',
    'ogg', 'm4v', '3gp', '3g2', 'mpg', 'mpeg', 'mp2', 'mpe', 'mpv',
    'm2v', 'svi', 'mxf', 'roq', 'nsv', 'f4v', 'f4p', 'f4a', 'f4b',
    // Audio
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'oga', 'wma', 'm4a', 'opus',
    'ape', 'wv', 'amr', 'ac3', 'dts', 'spx', 'mid', 'midi', 'kar',
    'aiff', 'aif', 'aifc', 'au', 'snd', 'voc', 'ra', 'rm', 'ram'
  ];
  return media.includes(normalizeExtension(extension));
}

// Check if extension is commonly associated with image files
export function isImageExtension(extension: string): boolean {
  const images = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tif',
    'tiff', 'psd', 'raw', 'heif', 'heic', 'indd', 'ai', 'eps', 'ps',
    'xcf', 'cdr', 'cmx', 'dib', 'jxr', 'hdp', 'wdp', 'cur', 'icns',
    'pbm', 'pgm', 'ppm', 'pnm', 'pcx', 'dcx', 'dds', 'dng', 'cr2',
    'cr3', 'crw', 'nef', 'nrw', 'orf', 'raf', 'rw2', 'rwl', 'srw',
    'arw', 'srf', 'sr2', 'bay', 'cap', 'iiq', 'eip', 'dcs', 'dcr',
    'drf', 'k25', 'kdc', 'mdc', 'mef', 'mos', 'mrw', 'pef', 'ptx',
    'pxn', 'r3d', 'x3f', 'qoi'
  ];
  return images.includes(normalizeExtension(extension));
}

// Check if extension is commonly associated with executable files
export function isExecutableExtension(extension: string): boolean {
  const executables = [
    'exe', 'dll', 'so', 'dylib', 'app', 'deb', 'rpm', 'dmg', 'pkg',
    'msi', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'js', 'jar', 'class',
    'pyc', 'pyo', 'elf', 'o', 'out', 'bin', 'run', 'com', 'scr',
    'cpl', 'ocx', 'sys', 'drv', 'efi', 'mui', 'ax', 'ime', 'rs',
    'tsp', 'fon', 'wasm', 'ko', 'mod', 'prx', 'puff', 'axf', 'dex'
  ];
  return executables.includes(normalizeExtension(extension));
}

// Get category from extension
export function getCategoryFromExtension(extension: string): string {
  const ext = normalizeExtension(extension);
  
  if (isImageExtension(ext)) return 'image';
  if (isMediaExtension(ext)) return 'media';
  if (isDocumentExtension(ext)) return 'document';
  if (isCompressedExtension(ext)) return 'archive';
  if (isExecutableExtension(ext)) return 'executable';
  
  // Check for specific categories
  const categories: Record<string, string[]> = {
    font: ['ttf', 'otf', 'woff', 'woff2', 'eot', 'fon', 'fnt'],
    database: ['db', 'db3', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'dbf'],
    code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'r', 'lua', 'pl', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'psm1', 'psd1', 'bat', 'cmd'],
    config: ['json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'properties', 'env'],
    text: ['txt', 'md', 'markdown', 'rst', 'asciidoc', 'adoc', 'org', 'tex', 'log']
  };
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return 'other';
}

// Common double extensions (e.g., .tar.gz)
const DOUBLE_EXTENSIONS = [
  'tar.gz', 'tar.bz2', 'tar.xz', 'tar.lz', 'tar.lzma', 'tar.Z',
  'tar.br', 'tar.zst', 'user.js', 'min.js', 'min.css', 'd.ts'
];

// Get double extension if applicable
export function getDoubleExtension(filename: string): string | null {
  const lower = filename.toLowerCase();
  
  for (const doubleExt of DOUBLE_EXTENSIONS) {
    if (lower.endsWith('.' + doubleExt)) {
      return doubleExt;
    }
  }
  
  return null;
}