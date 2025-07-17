import path from 'path';
export const FIXTURES_PATH = path.resolve(__dirname, '../../../__fixtures__');

export const getFixturePath = (...paths: string[]) =>
  path.join(FIXTURES_PATH, ...paths);

export const cleanText = (text: string): string =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');



export { TestPlan } from './TestPlan';
export { CoreDeployTestFixture } from './CoreDeployTestFixture';
export { TestFixture } from './TestFixture';
