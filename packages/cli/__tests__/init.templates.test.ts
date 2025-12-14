jest.setTimeout(30000);

import fs from 'fs';
import os from 'os';
import path from 'path';

import { scaffoldTemplate } from '@pgpmjs/core';

const TEMPLATE_REPO = 'https://github.com/constructive-io/pgpm-boilerplates.git';

describe('Template scaffolding', () => {
  it('processes workspace template from default repo', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-workspace-'));

    await scaffoldTemplate({
      type: 'workspace',
      outputDir: outDir,
      templateRepo: TEMPLATE_REPO,
      branch: 'restructuring', // TODO: remove after merging restructuring to main
      templatePath: 'default/workspace',
      answers: { 
        name: 'demo-workspace',
        fullName: 'Tester',
        email: 'tester@example.com',
        moduleName: 'demo-module',
        username: 'tester',
        repoName: 'demo-module',
        license: 'MIT'
      },
      noTty: true
    });

    expect(fs.existsSync(outDir)).toBe(true);
    fs.rmSync(outDir, { recursive: true, force: true });
  });

  it('processes module template from default repo', async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-module-'));

    await scaffoldTemplate({
      type: 'module',
      outputDir: outDir,
      templateRepo: TEMPLATE_REPO,
      branch: 'restructuring', // TODO: remove after merging restructuring to main
      templatePath: 'default/module',
      answers: { 
        name: 'demo-module',
        description: 'demo module',
        author: 'tester',
        fullName: 'Tester',
        email: 'tester@example.com',
        moduleDesc: 'demo module',
        moduleName: 'demo-module',
        repoName: 'demo-module',
        access: 'public',
        license: 'MIT',
        username: 'tester',
        packageIdentifier: 'demo-module'
      },
      noTty: true
    });

    expect(fs.existsSync(outDir)).toBe(true);
    fs.rmSync(outDir, { recursive: true, force: true });
  });
});
