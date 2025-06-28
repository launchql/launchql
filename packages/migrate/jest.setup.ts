import { teardownAllPools } from './test-utils';

// Default test timeout
jest.setTimeout(10000);

// Global teardown after all tests
afterAll(async () => {
  await teardownAllPools();
});