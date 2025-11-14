/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
  
    // Match both __tests__ and colocated test files
    testMatch: ['**/?(*.)+(test|spec).{ts,tsx,js,jsx}'],
  
    // Ignore build artifacts and type declarations
    testPathIgnorePatterns: ['/dist/', '\\.d\\.ts$'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    watchPathIgnorePatterns: ['/dist/'],
  
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  };