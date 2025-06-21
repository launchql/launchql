// MIME type utility functions

// Common MIME type categories
export const MIME_CATEGORIES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  APPLICATION: 'application',
  TEXT: 'text',
  FONT: 'font'
} as const;

export type MimeCategory = typeof MIME_CATEGORIES[keyof typeof MIME_CATEGORIES];

// Extract category from MIME type
export function getMimeCategory(mimeType: string): MimeCategory | null {
  const category = mimeType.split('/')[0];
  if (Object.values(MIME_CATEGORIES).includes(category as MimeCategory)) {
    return category as MimeCategory;
  }
  return null;
}

// Check if MIME type is binary
export function isBinaryMimeType(mimeType: string): boolean {
  const textTypes = [
    'text/',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-sh',
    'application/x-csh',
    'application/x-python',
    'application/x-ruby',
    'application/x-perl'
  ];
  
  return !textTypes.some(type => mimeType.startsWith(type));
}

// Normalize MIME type (remove parameters)
export function normalizeMimeType(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase();
}

// Get file category from MIME type
export function getFileCategoryFromMime(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  
  if (normalized.startsWith('image/')) return 'image';
  if (normalized.startsWith('video/')) return 'video';
  if (normalized.startsWith('audio/')) return 'audio';
  if (normalized.startsWith('font/')) return 'font';
  if (normalized.startsWith('text/')) return 'text';
  
  // Special cases for application types
  if (normalized.includes('zip') || normalized.includes('compressed') || normalized.includes('archive')) {
    return 'archive';
  }
  
  if (normalized.includes('pdf') || normalized.includes('document') || normalized.includes('msword') || normalized.includes('officedocument')) {
    return 'document';
  }
  
  if (normalized.includes('executable') || normalized.includes('x-msdownload') || normalized.includes('x-elf') || normalized.includes('x-mach')) {
    return 'executable';
  }
  
  if (normalized.includes('sqlite') || normalized.includes('database')) {
    return 'database';
  }
  
  return 'other';
}

// Common MIME type aliases
const MIME_ALIASES: Record<string, string> = {
  'application/x-javascript': 'application/javascript',
  'text/javascript': 'application/javascript',
  'application/x-mpegURL': 'application/vnd.apple.mpegurl',
  'audio/mp3': 'audio/mpeg',
  'audio/x-mp3': 'audio/mpeg',
  'audio/x-mpeg': 'audio/mpeg',
  'video/x-m4v': 'video/mp4',
  'audio/x-m4a': 'audio/mp4',
  'image/jpg': 'image/jpeg',
  'image/x-png': 'image/png',
  'image/x-icon': 'image/vnd.microsoft.icon',
  'text/xml': 'application/xml',
  'application/x-compressed': 'application/x-compress',
  'application/x-gzip': 'application/gzip',
  'application/x-bzip': 'application/x-bzip2',
  'application/x-tar': 'application/tar'
};

// Resolve MIME type aliases
export function resolveMimeAlias(mimeType: string): string {
  const normalized = normalizeMimeType(mimeType);
  return MIME_ALIASES[normalized] || normalized;
}