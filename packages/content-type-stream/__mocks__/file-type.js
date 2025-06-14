const fileTypeFromBuffer = async (buffer) => {
  const firstBytes = buffer.slice(0, 16);
  
  if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
    return { ext: 'png', mime: 'image/png' };
  }
  
  if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8 && firstBytes[2] === 0xFF) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  
  if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && firstBytes[2] === 0x46) {
    return { ext: 'gif', mime: 'image/gif' };
  }
  
  if (firstBytes[0] === 0x25 && firstBytes[1] === 0x50 && firstBytes[2] === 0x44 && firstBytes[3] === 0x46) {
    return { ext: 'pdf', mime: 'application/pdf' };
  }
  
  if (firstBytes[0] === 0x50 && firstBytes[1] === 0x4B && (firstBytes[2] === 0x03 || firstBytes[2] === 0x05)) {
    return { ext: 'zip', mime: 'application/zip' };
  }
  
  if (firstBytes[0] === 0x42 && firstBytes[1] === 0x4D) {
    return { ext: 'bmp', mime: 'image/x-ms-bmp' };
  }
  
  if ((firstBytes[0] === 0x49 && firstBytes[1] === 0x49 && firstBytes[2] === 0x2A && firstBytes[3] === 0x00) ||
      (firstBytes[0] === 0x4D && firstBytes[1] === 0x4D && firstBytes[2] === 0x00 && firstBytes[3] === 0x2A)) {
    return { ext: 'tif', mime: 'image/tiff' };
  }
  
  if (firstBytes[0] === 0x1F && firstBytes[1] === 0x8B) {
    return { ext: 'gz', mime: 'application/x-gzip' };
  }
  
  const text = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
  if (/^[\x20-\x7E\s]*$/.test(text)) {
    if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
      return { ext: 'html', mime: 'text/html' };
    }
    if (text.includes('<svg') || text.includes('xmlns="http://www.w3.org/2000/svg"')) {
      return { ext: 'svg', mime: 'image/svg' };
    }
    if (text.startsWith('#!/bin/bash') || text.startsWith('#!/bin/sh')) {
      return { ext: 'sh', mime: 'text/x-shellscript' };
    }
    return { ext: 'txt', mime: 'text/plain' };
  }
  
  return undefined;
};

module.exports = {
  fileTypeFromBuffer
};
