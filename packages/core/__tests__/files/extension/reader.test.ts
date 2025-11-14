import fs from 'fs';
import os from 'os';
import path from 'path';
import { getInstalledExtensions } from '../../../src/files/extension/reader';

describe('getInstalledExtensions', () => {
  let tempDir: string;
  let controlFilePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-test-'));
    controlFilePath = path.join(tempDir, 'test.control');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return empty array when control file has no requires line', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual([]);
  });

  it('should return empty array when control file does not exist', () => {
    const nonExistentPath = path.join(tempDir, 'nonexistent.control');
    
    const result = getInstalledExtensions(nonExistentPath);
    expect(result).toEqual([]);
  });

  it('should parse single extension from requires line', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
requires = 'pgcrypto'
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual(['pgcrypto']);
  });

  it('should parse multiple extensions from requires line', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
requires = 'pgcrypto,postgis,plpgsql'
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual(['pgcrypto', 'postgis', 'plpgsql']);
  });

  it('should handle requires line with spaces', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
requires = 'pgcrypto, postgis, plpgsql'
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual(['pgcrypto', 'postgis', 'plpgsql']);
  });

  it('should handle requires line with leading/trailing whitespace', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
  requires = 'pgcrypto,postgis'  
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual(['pgcrypto', 'postgis']);
  });

  it('should return empty array when requires line is empty', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
requires = ''
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual([]);
  });

  it('should filter out empty strings from comma-separated list', () => {
    const content = `# test extension
comment = 'test extension'
default_version = '1.0.0'
requires = 'pgcrypto,,postgis'
module_pathname = '$libdir/test'
relocatable = false
superuser = false
`;
    fs.writeFileSync(controlFilePath, content);
    
    const result = getInstalledExtensions(controlFilePath);
    expect(result).toEqual(['pgcrypto', 'postgis']);
  });

  it('should throw error for non-ENOENT read errors', () => {
    fs.mkdirSync(controlFilePath);
    
    expect(() => getInstalledExtensions(controlFilePath)).toThrow();
  });
});
