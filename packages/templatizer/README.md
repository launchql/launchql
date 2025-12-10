# @launchql/templatizer

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/@launchql/templatizer"><img height="20" src="https://img.shields.io/github/package-json/v/launchql/launchql?filename=packages%2Ftemplatizer%2Fpackage.json"/></a>
</p>

Template compilation and rendering system for LaunchQL boilerplates. Compiles template directories into executable function arrays with variable substitution support.

This package is used by the `lql init` command to generate new workspace and module projects from boilerplate templates. It supports loading templates from local paths or GitHub repositories.

## Installation

```sh
npm install @launchql/templatizer
```

## Features

- **Template Compilation**: Convert boilerplate directories into compiled template functions
- **Variable Substitution**: Support for `__VARIABLE__` style placeholders in file paths and content
- **Custom Template Sources**: Load templates from local paths or GitHub repositories
- **Type Safety**: Full TypeScript support with type definitions

## Usage

### Using Pre-compiled Templates

```typescript
import { workspaceTemplate, writeRenderedTemplates } from '@launchql/templatizer';

const vars = {
  MODULENAME: 'my-workspace',
  USERNAME: 'myuser',
  USERFULLNAME: 'My Name',
  USEREMAIL: 'my@email.com'
};

writeRenderedTemplates(workspaceTemplate, './output-dir', vars);
```

### Loading Templates from Custom Sources

```typescript
import { loadTemplates, writeRenderedTemplates, TemplateSource } from '@launchql/templatizer';

// Load from local path
const localSource: TemplateSource = {
  type: 'local',
  path: './custom-templates/workspace'
};

const templates = loadTemplates(localSource, 'workspace');
const rendered = templates.map(t => t.render);
writeRenderedTemplates(rendered, './output-dir', vars);

// Load from GitHub repository
const githubSource: TemplateSource = {
  type: 'github',
  path: 'owner/repo',
  branch: 'main' // optional, defaults to 'main'
};

const githubTemplates = loadTemplates(githubSource, 'workspace');
const githubRendered = githubTemplates.map(t => t.render);
writeRenderedTemplates(githubRendered, './output-dir', vars);
```

### Compiling Templates

```typescript
import { compileTemplatesToFunctions } from '@launchql/templatizer';

const templates = compileTemplatesToFunctions('./boilerplates/module');
// Returns CompiledTemplate[] with render functions
```

## Template Variable Format

Templates use the `__VARIABLE__` format for variable substitution in both file paths and content:

- **File paths**: `__MODULENAME__/package.json` → `my-module/package.json`
- **File content**: `"name": "__MODULENAME__"` → `"name": "my-module"`

Variables are replaced at render time with values from the `vars` object passed to `writeRenderedTemplates()`.

## API

### `compileTemplatesToFunctions(srcDir: string): CompiledTemplate[]`

Compiles all files in a directory into template functions.

### `writeRenderedTemplates(templates: Func[], outDir: string, vars: Record<string, any>): void`

Renders compiled templates and writes them to the output directory.

### `loadTemplates(source: TemplateSource, templateType: 'workspace' | 'module'): CompiledTemplate[]`

Loads templates from a local path or GitHub repository.

### `TemplateSource`

```typescript
interface TemplateSource {
  type: 'local' | 'github';
  path: string;
  branch?: string; // Optional, for GitHub sources
}
```

## Scripts

- `makeTemplates`: Compiles boilerplates from `boilerplates/` directory into `src/generated/` TypeScript files
- `generate`: Test script to render templates with sample variables
