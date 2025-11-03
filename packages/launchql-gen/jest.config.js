/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        babelConfig: false,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: [`/node_modules/*`],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['dist/*'],
  moduleNameMapper: {
    '^@launchql/logger$': '<rootDir>/../../packages/logger/dist',
    '^@launchql/(.*)$': '<rootDir>/../../packages/$1/dist',
    '^pgsql-test$': '<rootDir>/../../packages/pgsql-test/dist',
    '^graphile-test$': '<rootDir>/../../packages/graphile-test/dist',
    '^pg-env$': '<rootDir>/../../packages/pg-env/dist',
    '^pg-cache$': '<rootDir>/../../packages/pg-cache/dist',
  },
};
