import { TestFixture } from '../test-utils';
import { TestDatabase } from '../../core/test-utils';
import { ParsedArgs } from 'minimist';
import * as path from 'path';

interface ExecutionResult {
  command: string;
  args: ParsedArgs & { cwd: string };
  success: boolean;
}

describe('CLI Deployment Scenarios - Execution Tests', () => {
  let fixture: TestFixture;
  let db: TestDatabase;

  beforeAll(async () => {
    fixture = new TestFixture('sqitch', 'simple-w-tags');
    db = await fixture.setupTestDatabase();
  });

  afterAll(async () => {
    await fixture.cleanup();
  });

  test('executes modified deployment scenario for my-third using script approach', async () => {
    const script = `
      lql deploy --recursive --project my-third --database ${db.name}
      lql revert --recursive --project my-third --database ${db.name} --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database ${db.name}
      lql revert --recursive --project my-third --database ${db.name} --toChange my-first:@v1.0.0
      lql deploy --recursive --project my-third --database ${db.name}
      lql verify --recursive --project my-third --database ${db.name}
    `;

    const commands = fixture.parseScript(script);
    
    expect(commands).toHaveLength(6);
    
    const results = await fixture.getSnapshottableResults(commands);

    const expectedSequence = ['deploy', 'revert', 'deploy', 'revert', 'deploy', 'verify'];
    expect(results.map(r => r.command)).toEqual(expectedSequence);

    expect(results).toMatchSnapshot('deployment-scenario-execution-results');

    expect(results.every(r => r.success)).toBe(true);
  });

  test('executes script commands with various flags', async () => {
    const script = `
      # This is a comment
      lql deploy --recursive --fast
      lql revert --recursive --toChange my-first:@v1.0.0
      lql verify --recursive
    `;

    const commands = fixture.parseScript(script);
    
    expect(commands).toHaveLength(3);
    
    const results = await fixture.getSnapshottableResults(commands);

    expect(results.map(r => r.command)).toEqual(['deploy', 'revert', 'verify']);

    expect(results).toMatchSnapshot('script-commands-execution-results');

    expect(results.every(r => r.success)).toBe(true);
  });

  test('executes commands with boolean negation flags', async () => {
    const script = `
      lql deploy --recursive --no-fast --project my-app
      lql verify --no-tx --database ${db.name}
    `;

    const commands = fixture.parseScript(script);
    
    expect(commands).toHaveLength(2);
    
    expect(commands[0].args.fast).toBe(false);
    expect(commands[1].args.tx).toBe(false);
    
    const results = await fixture.getSnapshottableResults(commands);

    expect(results.map(r => r.command)).toEqual(['deploy', 'verify']);

    expect(results).toMatchSnapshot('boolean-negation-execution-results');

    expect(results.every(r => r.success)).toBe(true);
  });
});
