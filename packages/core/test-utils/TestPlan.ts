import { existsSync } from 'fs';
import { dirname,join } from 'path';

import { parsePlanFile } from '../src/files';
import { ExtendedPlanFile, ParseResult } from '../src/files/types';

export class TestPlan {
  private fixturePath: string;
  result: ParseResult<ExtendedPlanFile>;

  constructor(fixturePath: string) {
    // Otherwise, resolve relative to root __fixtures__/sqitch-plans
    const rootDir = dirname(dirname(dirname(__dirname))); // Go up to workspace root
    const basePath = join(rootDir, '__fixtures__', 'sqitch-plans');
    this.fixturePath = join(basePath, fixturePath);
    
    if (!existsSync(this.fixturePath)) {
      throw new Error(`Fixture not found: ${this.fixturePath}`);
    }

    this.result = parsePlanFile(this.fixturePath);
  }

  expectResult(expected: ParseResult<ExtendedPlanFile>) {
    expect(this.result.errors).toEqual(expected.errors);
    expect(this.result.data).toEqual(expected.data);
  }
}