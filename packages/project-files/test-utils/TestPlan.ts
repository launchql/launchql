import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parsePlanFile, parsePlanFileSimple } from '../src';
import { ExtendedPlanFile, PlanFile, ParseError, ParseResult } from '../src/types';

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