import fs from 'fs';
import * as glob from 'glob';
import path from 'path';

import { PgpmPackage } from '../../src/core/class/pgpm';
import { TestFixture } from '../../test-utils';

let fixture: TestFixture;
let distDir: string;
let mod: PgpmPackage;

beforeEach(() => {
  fixture = new TestFixture('sqitch', 'publish', 'packages', 'totp');
  distDir = path.join(fixture.tempFixtureDir, 'dist');
  mod = new PgpmPackage(fixture.tempFixtureDir);
});

afterEach(() => {
  fixture.cleanup();
});

describe('publishToDist()', () => {
  it('copies all required folders and files to dist/', () => {
    mod.publishToDist();

    const structure = glob.sync('**/*', {
      cwd: distDir,
      nodir: true
    });

    expect(structure.sort()).toMatchSnapshot();
  });

  it('cleans up existing dist/ folder before copy', () => {
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'should-delete.txt'), 'old');

    mod.publishToDist();

    expect(fs.existsSync(path.join(distDir, 'should-delete.txt'))).toBe(false);
  });

  it('preserves file contents', () => {
    mod.publishToDist();

    const orig = fs.readFileSync(
      path.join(fixture.tempFixtureDir, 'pgpm.plan'),
      'utf-8'
    );
    const copied = fs.readFileSync(
      path.join(distDir, 'pgpm.plan'),
      'utf-8'
    );

    expect(copied).toEqual(orig);
  });

  it('throws if required file is missing', () => {
    fs.rmSync(path.join(fixture.tempFixtureDir, 'pgpm.plan'));
    expect(() => mod.publishToDist()).toThrow(/pgpm\.plan/);
  });

  it('skips extraneous files and folders', () => {
    const junkDir = path.join(fixture.tempFixtureDir, 'junk');
    fs.mkdirSync(junkDir, { recursive: true });
    fs.writeFileSync(path.join(junkDir, 'ignore.txt'), 'junk');

    mod.publishToDist();

    expect(fs.existsSync(path.join(distDir, 'junk'))).toBe(false);
  });
});
