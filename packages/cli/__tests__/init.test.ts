import { Inquirerer, Question, InquirererOptions } from 'inquirerer';
import { KEY_SEQUENCES, setupTests, TestEnvironment } from '../test-utils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { sync as glob } from 'glob';
import { commands } from '../src/commands';
import { options } from '../src';
import { ParsedArgs } from 'minimist';

const beforeEachSetup = setupTests();

describe('init', () => {
    let environment: TestEnvironment;
    let tempDir: string;

    beforeEach(() => {
        environment = beforeEachSetup();
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchql-init-test-'));
    });

    it('prompts user and correctly processes delayed input', async () => {
        const { mockInput, mockOutput, writeResults, transformResults } = environment;

        const inqOpts: InquirererOptions = {
            input: mockInput,
            output: mockOutput,
            noTty: true
        };

        const prompter = new Inquirerer(inqOpts);

        const argv: ParsedArgs = {
            _: ['init'],
            cwd: tempDir,
            name: 'myproject',
            workspace: true,
        };

        // @ts-ignore
        const result = await commands(argv, prompter, { });

        const absoluteFiles = glob('**/*', {
            cwd: tempDir,
            dot: true,
            nodir: true,
            absolute: true
        });

        const relativeFiles = absoluteFiles.map(file => path.relative(tempDir, file));

        argv.cwd = '<CWD>';
        expect(argv).toMatchSnapshot();
        expect(result).toMatchSnapshot();
        expect(writeResults).toMatchSnapshot();
        expect(transformResults).toMatchSnapshot();
        expect(relativeFiles).toMatchSnapshot(); // snapshot file list, cleaned
    });
});
