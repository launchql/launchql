# @launchql/create-gen-app

A TypeScript library for cloning and customizing template repositories with variable replacement.

## Features

- Clone GitHub repositories or any git URL
- Extract template variables from filenames and file contents using `__VARIABLE__` syntax
- Load custom questions from `.questions.json` or `.questions.js` files
- Interactive prompts using inquirerer with CLI argument support
- Stream-based file processing for efficient variable replacement

## Installation

```bash
npm install @launchql/create-gen-app
```

## Usage

### Basic Usage

```typescript
import { createGen } from '@launchql/create-gen-app';

await createGen({
  templateUrl: 'https://github.com/user/template-repo',
  outputDir: './my-new-project',
  argv: {
    PROJECT_NAME: 'my-project',
    AUTHOR: 'John Doe'
  }
});
```

### Template Variables

Variables in your template should be wrapped in double underscores:

**Filename variables:**
```
__PROJECT_NAME__/
  __MODULE_NAME__.ts
```

**Content variables:**
```typescript
// __MODULE_NAME__.ts
export const projectName = "__PROJECT_NAME__";
export const author = "__AUTHOR__";
```

### Custom Questions

Create a `.questions.json` file in your template repository:

```json
{
  "questions": [
    {
      "name": "PROJECT_NAME",
      "type": "text",
      "message": "What is your project name?",
      "required": true
    },
    {
      "name": "AUTHOR",
      "type": "text",
      "message": "Who is the author?"
    }
  ]
}
```

Or use `.questions.js` for dynamic questions:

```javascript
/**
 * @typedef {Object} Questions
 * @property {Array} questions - Array of question objects
 */

module.exports = {
  questions: [
    {
      name: 'PROJECT_NAME',
      type: 'text',
      message: 'What is your project name?',
      required: true
    }
  ]
};
```

## API

### `createGen(options: CreateGenOptions): Promise<string>`

Main function to create a project from a template.

**Options:**
- `templateUrl` (string): URL or path to the template repository
- `outputDir` (string): Destination directory for the generated project
- `argv` (Record<string, any>): Command-line arguments to pre-populate answers
- `noTty` (boolean): Whether to disable TTY mode for non-interactive usage

### `extractVariables(templateDir: string): Promise<ExtractedVariables>`

Extract all variables from a template directory.

### `promptUser(extractedVariables: ExtractedVariables, argv?: Record<string, any>, noTty?: boolean): Promise<Record<string, any>>`

Prompt the user for variable values using inquirerer.

### `replaceVariables(templateDir: string, outputDir: string, extractedVariables: ExtractedVariables, answers: Record<string, any>): Promise<void>`

Replace variables in all files and filenames.

## Variable Naming Rules

Variables can contain:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscores (_)
- Must start with a letter or underscore

Examples of valid variables:
- `__PROJECT_NAME__`
- `__author__`
- `__CamelCase__`
- `__snake_case__`
- `__VERSION_1__`

## License

MIT
