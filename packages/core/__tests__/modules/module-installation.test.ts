import fs from 'fs';
import path from 'path';
import { LaunchQLProject } from '../../src/core/class/launchql';
import { TestFixture } from '../../test-utils';
import * as glob from 'glob';

let fixture: TestFixture;
let mod: LaunchQLProject;

beforeEach(() => {
    fixture = new TestFixture('migrate', 'simple');
    mod = fixture.getModuleProject(['.'], 'my-first')!;
});

afterEach(() => {
    fixture.cleanup();
});

describe('installModule()', () => {
    it('installs a package and updates package.json dependencies', async () => {
        await mod.installModules('@webql/base32@1.2.1');

        const extDir = path.join(
            mod.getWorkspacePath()!,
            'extensions/@webql/base32'
        );

        const files = glob.sync('**/*', {
            cwd: extDir,
            nodir: true
        });

        expect(files.sort()).toMatchSnapshot();
        expect(fs.existsSync(path.join(extDir, 'launchql.plan'))).toBe(true);

        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(mod.getModulePath()!, 'package.json'), 'utf-8')
        );
        expect(pkgJson.dependencies).toBeDefined();
        expect(pkgJson.dependencies['@webql/base32']).toBe('1.2.1');

        const controlFileContent = mod.getModuleControlFile();
        expect(controlFileContent).toMatchSnapshot();
    });

    it('throws if package.json does not exist in module', async () => {
        fs.rmSync(path.join(mod.getModulePath()!, 'package.json'));
        await expect(
            mod.installModules('@webql/base32@1.2.1')
        ).rejects.toThrow(/No package\.json found/);
    });
});
