import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { extractVariables } from '../src/extract';
import { promptUser } from '../src/prompt';
import { ExtractedVariables } from '../src/types';

jest.mock('inquirerer', () => {
  return {
    Inquirerer: jest.fn().mockImplementation(() => {
      return {
        prompt: jest.fn().mockResolvedValue({})
      };
    })
  };
});

describe('create-gen-app', () => {
  let testTempDir: string;
  let testOutputDir: string;

  beforeEach(() => {
    testTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-template-'));
    testOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-output-'));
  });

  afterEach(() => {
    if (fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('extractVariables', () => {
    it('should extract variables from filenames', async () => {
      fs.writeFileSync(path.join(testTempDir, '__PROJECT_NAME__.txt'), 'content');
      fs.writeFileSync(path.join(testTempDir, '__AUTHOR__.md'), 'content');

      const result = await extractVariables(testTempDir);

      expect(result.fileReplacers).toHaveLength(2);
      expect(result.fileReplacers.map(r => r.variable)).toContain('PROJECT_NAME');
      expect(result.fileReplacers.map(r => r.variable)).toContain('AUTHOR');
    });

    it('should extract variables from file contents', async () => {
      fs.writeFileSync(
        path.join(testTempDir, 'test.txt'),
        'Hello __USER_NAME__, welcome to __PROJECT_NAME__!'
      );

      const result = await extractVariables(testTempDir);

      expect(result.contentReplacers.length).toBeGreaterThanOrEqual(2);
      expect(result.contentReplacers.map(r => r.variable)).toContain('USER_NAME');
      expect(result.contentReplacers.map(r => r.variable)).toContain('PROJECT_NAME');
    });

    it('should extract variables from nested directories', async () => {
      const nestedDir = path.join(testTempDir, 'src', '__MODULE_NAME__');
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedDir, '__FILE_NAME__.ts'),
        'export const __CONSTANT__ = "value";'
      );

      const result = await extractVariables(testTempDir);

      expect(result.fileReplacers.map(r => r.variable)).toContain('MODULE_NAME');
      expect(result.fileReplacers.map(r => r.variable)).toContain('FILE_NAME');
      expect(result.contentReplacers.map(r => r.variable)).toContain('CONSTANT');
    });

    it('should load questions from .questions.json', async () => {
      const questions = {
        questions: [
          {
            name: 'projectName',
            type: 'text',
            message: 'What is your project name?'
          },
          {
            name: 'author',
            type: 'text',
            message: 'Who is the author?'
          }
        ]
      };

      fs.writeFileSync(
        path.join(testTempDir, '.questions.json'),
        JSON.stringify(questions, null, 2)
      );

      const result = await extractVariables(testTempDir);

      expect(result.projectQuestions).not.toBeNull();
      expect(result.projectQuestions?.questions).toHaveLength(2);
      expect(result.projectQuestions?.questions[0].name).toBe('projectName');
    });

    it('should load questions from .questions.js', async () => {
      const questionsContent = `
module.exports = {
  questions: [
    {
      name: 'projectName',
      type: 'text',
      message: 'What is your project name?'
    }
  ]
};
`;

      fs.writeFileSync(path.join(testTempDir, '.questions.js'), questionsContent);

      const result = await extractVariables(testTempDir);

      expect(result.projectQuestions).not.toBeNull();
      expect(result.projectQuestions?.questions).toHaveLength(1);
      expect(result.projectQuestions?.questions[0].name).toBe('projectName');
    });

    it('should handle templates with no variables', async () => {
      fs.writeFileSync(path.join(testTempDir, 'README.md'), 'Simple readme');

      const result = await extractVariables(testTempDir);

      expect(result.fileReplacers).toHaveLength(0);
      expect(result.contentReplacers).toHaveLength(0);
      expect(result.projectQuestions).toBeNull();
    });

    it('should skip .questions.json and .questions.js from variable extraction', async () => {
      fs.writeFileSync(
        path.join(testTempDir, '.questions.json'),
        '{"questions": [{"name": "__SHOULD_NOT_EXTRACT__"}]}'
      );

      const result = await extractVariables(testTempDir);

      expect(result.fileReplacers.map(r => r.variable)).not.toContain('SHOULD_NOT_EXTRACT');
    });

    it('should handle variables with different casings', async () => {
      fs.writeFileSync(
        path.join(testTempDir, 'test.txt'),
        '__lowercase__ __UPPERCASE__ __CamelCase__ __snake_case__'
      );

      const result = await extractVariables(testTempDir);

      expect(result.contentReplacers.map(r => r.variable)).toContain('lowercase');
      expect(result.contentReplacers.map(r => r.variable)).toContain('UPPERCASE');
      expect(result.contentReplacers.map(r => r.variable)).toContain('CamelCase');
      expect(result.contentReplacers.map(r => r.variable)).toContain('snake_case');
    });
  });

  describe('promptUser', () => {
    it('should generate questions for file and content replacers', async () => {
      const { Inquirerer } = require('inquirerer');
      const mockPrompt = jest.fn().mockResolvedValue({
        PROJECT_NAME: 'my-project',
        AUTHOR: 'John Doe'
      });

      Inquirerer.mockImplementation(() => ({
        prompt: mockPrompt
      }));

      const extractedVariables: ExtractedVariables = {
        fileReplacers: [
          { variable: 'PROJECT_NAME', pattern: /__PROJECT_NAME__/g }
        ],
        contentReplacers: [
          { variable: 'AUTHOR', pattern: /__AUTHOR__/g }
        ],
        projectQuestions: null
      };

      await promptUser(extractedVariables, {}, false);

      expect(mockPrompt).toHaveBeenCalled();
      const questions = mockPrompt.mock.calls[0][1];
      expect(questions).toHaveLength(2);
      expect(questions.map((q: any) => q.name)).toContain('PROJECT_NAME');
      expect(questions.map((q: any) => q.name)).toContain('AUTHOR');
    });

    it('should prioritize project questions over auto-generated ones', async () => {
      const { Inquirerer } = require('inquirerer');
      const mockPrompt = jest.fn().mockResolvedValue({
        projectName: 'my-project'
      });

      Inquirerer.mockImplementation(() => ({
        prompt: mockPrompt
      }));

      const extractedVariables: ExtractedVariables = {
        fileReplacers: [
          { variable: 'projectName', pattern: /__projectName__/g }
        ],
        contentReplacers: [],
        projectQuestions: {
          questions: [
            {
              name: 'projectName',
              type: 'text' as const,
              message: 'Custom question for project name'
            }
          ]
        }
      };

      await promptUser(extractedVariables, {}, false);

      expect(mockPrompt).toHaveBeenCalled();
      const questions = mockPrompt.mock.calls[0][1];
      expect(questions).toHaveLength(1);
      expect(questions[0].message).toBe('Custom question for project name');
    });

    it('should use argv to pre-populate answers', async () => {
      const { Inquirerer } = require('inquirerer');
      const mockPrompt = jest.fn().mockResolvedValue({
        PROJECT_NAME: 'my-project',
        AUTHOR: 'John Doe'
      });

      Inquirerer.mockImplementation(() => ({
        prompt: mockPrompt
      }));

      const extractedVariables: ExtractedVariables = {
        fileReplacers: [
          { variable: 'PROJECT_NAME', pattern: /__PROJECT_NAME__/g }
        ],
        contentReplacers: [],
        projectQuestions: null
      };

      const argv = { PROJECT_NAME: 'pre-filled-project' };
      await promptUser(extractedVariables, argv, false);

      expect(mockPrompt).toHaveBeenCalledWith(
        argv,
        expect.any(Array)
      );
    });
  });

  describe('variable replacement', () => {
    it('should replace variables in file contents', async () => {
      fs.writeFileSync(
        path.join(testTempDir, 'README.md'),
        '# __PROJECT_NAME__\n\nBy __AUTHOR__'
      );

      const extractedVariables = await extractVariables(testTempDir);
      const answers = {
        PROJECT_NAME: 'My Awesome Project',
        AUTHOR: 'Jane Smith'
      };

      const { replaceVariables } = require('../src/replace');
      await replaceVariables(testTempDir, testOutputDir, extractedVariables, answers);

      const content = fs.readFileSync(path.join(testOutputDir, 'README.md'), 'utf8');
      expect(content).toBe('# My Awesome Project\n\nBy Jane Smith');
    });

    it('should replace variables in filenames', async () => {
      fs.writeFileSync(
        path.join(testTempDir, '__PROJECT_NAME__.config.js'),
        'module.exports = {};'
      );

      const extractedVariables = await extractVariables(testTempDir);
      const answers = {
        PROJECT_NAME: 'myproject'
      };

      const { replaceVariables } = require('../src/replace');
      await replaceVariables(testTempDir, testOutputDir, extractedVariables, answers);

      expect(fs.existsSync(path.join(testOutputDir, 'myproject.config.js'))).toBe(true);
    });

    it('should replace variables in nested directory names', async () => {
      const nestedDir = path.join(testTempDir, 'src', '__MODULE_NAME__');
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(
        path.join(nestedDir, 'index.ts'),
        'export const name = "__MODULE_NAME__";'
      );

      const extractedVariables = await extractVariables(testTempDir);
      const answers = {
        MODULE_NAME: 'auth'
      };

      const { replaceVariables } = require('../src/replace');
      await replaceVariables(testTempDir, testOutputDir, extractedVariables, answers);

      const outputFile = path.join(testOutputDir, 'src', 'auth', 'index.ts');
      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf8');
      expect(content).toBe('export const name = "auth";');
    });

    it('should skip .questions.json and .questions.js files', async () => {
      fs.writeFileSync(
        path.join(testTempDir, '.questions.json'),
        '{"questions": []}'
      );
      fs.writeFileSync(
        path.join(testTempDir, 'README.md'),
        'Regular file'
      );

      const extractedVariables = await extractVariables(testTempDir);
      const { replaceVariables } = require('../src/replace');
      await replaceVariables(testTempDir, testOutputDir, extractedVariables, {});

      expect(fs.existsSync(path.join(testOutputDir, '.questions.json'))).toBe(false);
      expect(fs.existsSync(path.join(testOutputDir, 'README.md'))).toBe(true);
    });

    it('should handle multiple occurrences of the same variable', async () => {
      fs.writeFileSync(
        path.join(testTempDir, 'test.txt'),
        '__NAME__ loves __NAME__ and __NAME__ is great!'
      );

      const extractedVariables = await extractVariables(testTempDir);
      const answers = {
        NAME: 'Alice'
      };

      const { replaceVariables } = require('../src/replace');
      await replaceVariables(testTempDir, testOutputDir, extractedVariables, answers);

      const content = fs.readFileSync(path.join(testOutputDir, 'test.txt'), 'utf8');
      expect(content).toBe('Alice loves Alice and Alice is great!');
    });
  });
});
