import fs from 'fs';
import path from 'path';
import { LaunchQLProject } from '../src/class/launchql';
import { TestFixture } from '../test-utils';
import * as glob from 'glob';

let fixture: TestFixture;
let mod: LaunchQLProject;

beforeEach(() => {
    fixture = new TestFixture('sqitch', 'publish');
    mod = fixture.getModuleProject(['.'], 'totp')!;
});

afterEach(() => {
    fixture.cleanup();
});

describe('installModule()', () => {
    it('installs a package and updates package.json dependencies', async () => {
        await mod.installModules('@launchql/base32@0.4.6');

        const extDir = path.join(
            mod.getWorkspacePath()!,
            'extensions/@launchql/base32'
        );

        const files = glob.sync('**/*', {
            cwd: extDir,
            nodir: true
        });

        expect(files.sort()).toMatchSnapshot();
        expect(fs.existsSync(path.join(extDir, 'sqitch.conf'))).toBe(true);

        const pkgJson = JSON.parse(
            fs.readFileSync(path.join(mod.getModulePath()!, 'package.json'), 'utf-8')
        );
        expect(pkgJson.dependencies).toBeDefined();
        expect(pkgJson.dependencies['@launchql/base32']).toBe('0.4.6');

        const controlFileContent = mod.getModuleControlFile();
        expect(controlFileContent).toMatchSnapshot();
    });

    it('throws if package.json does not exist in module', async () => {
        fs.rmSync(path.join(mod.getModulePath()!, 'package.json'));
        await expect(
            mod.installModules('@launchql/base32@0.4.6')
        ).rejects.toThrow(/No package\.json found/);
    });
});
