# LaunchQL Init System: pgpm init and pgpm init --workspace

## Introduction

The LaunchQL init system provides scaffolding commands for creating new workspaces and modules within the LaunchQL framework. The `pgpm init` command creates individual database modules within an existing workspace, while `pgpm init --workspace` initializes a complete workspace structure that can contain multiple modules. These commands automate the creation of boilerplate files, directory structures, and configuration files needed for LaunchQL development.

It's important to distinguish `pgpm init` (scaffolding) from `pgpm migrate init` (migration schema bootstrap). The former creates project structure and files, while the latter initializes the `launchql_migrate` schema in a PostgreSQL database for tracking deployment history. This document focuses exclusively on the scaffolding commands.

The init system is accessible through both the `pgpm` and `lql` command-line tools. The `lql` CLI delegates to `pgpm` commands via `createPgpmCommandMap` in packages/cli/src/commands.ts:11-17, so `lql init` and `pgpm init` are functionally identical.

## Command Entry and Routing

The entry point for the init system is located at packages/pgpm/src/commands/init/index.ts. When a user runs `pgpm init` or `lql init`, the command dispatcher examines the `--workspace` flag to determine which initialization flow to execute. The routing logic at packages/pgpm/src/commands/init/index.ts:43-53 implements a simple switch statement: if `workspace` is explicitly `true`, the system invokes `runWorkspaceSetup` from workspace.ts; otherwise, it defaults to `runModuleSetup` from module.ts.

This design means that `pgpm init` without any flags will attempt to create a module in the current directory, which requires being inside an existing workspace. Users who want to create a new workspace must explicitly pass the `--workspace` flag.

## Template System Overview

The LaunchQL init system uses the `@launchql/templatizer` package to manage template compilation and rendering. Templates are stored by default in the repository's `boilerplates/` directory, with separate subdirectories for workspace and module templates at boilerplates/workspace/ and boilerplates/module/ respectively.

The templatizer package converts template files into executable JavaScript functions that perform variable substitution. This compilation process is handled by `compileTemplatesToFunctions` at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:28-63. The function scans all files in a template directory (including hidden files starting with a dot) and processes both filenames and file contents for variable replacement.

Variable substitution uses the `__VARIABLE__` format, where double underscores surround uppercase variable names. For example, `__MODULENAME__` in a template will be replaced with the actual module name provided by the user. The replacement mechanism at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:22-24 converts these placeholders into JavaScript template literal syntax by transforming `__VARNAME__` into `${vars.VARNAME}`. This means that both filenames and file contents can contain variables that will be substituted at render time.

The rendering process uses JavaScript's `new Function()` constructor to create functions that evaluate template literals with the provided variables. This approach at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:50-54 means that missing variables will render as the string "undefined" rather than throwing an error. This behavior is a critical consideration when creating or debugging templates, as typos or missing variable definitions will silently produce incorrect output rather than failing loudly.

## Workspace Init Flow

When a user runs `pgpm init --workspace`, the system begins by prompting for a workspace name. The workspace initialization logic at packages/pgpm/src/commands/init/workspace.ts:11-57 handles this flow. After collecting the workspace name through the inquirer prompt system, the name is slugified using the `sluggify` utility to ensure it's safe for use as a directory name. The slugified name becomes the directory name for the new workspace, created as a subdirectory of the current working directory.

The system then determines which template source to use. Template source selection follows a specific precedence order. If the user provides the `--repo` flag with a GitHub repository reference (like `owner/repo`), the system will clone that repository and load templates from its boilerplates/ directory. If the user provides `--template-path` with a local filesystem path, the system will load templates from that location. If neither flag is provided, the system uses pre-compiled default templates that are bundled with the `@launchql/templatizer` package.

The template source precedence is implemented at packages/pgpm/src/commands/init/workspace.ts:34-51. When using `--repo`, the system creates a `TemplateSource` object with type 'github' and passes it to `loadTemplates`, which clones the repository to a temporary directory using a shallow clone with depth 1. The clone operation at packages/templatizer/src/loadTemplates.ts:40-47 disables interactive prompts by setting `GIT_TERMINAL_PROMPT=0` and `GIT_ASKPASS=echo`, which allows public repositories to be cloned without authentication. The optional `--from-branch` flag specifies which branch to clone, defaulting to 'main' if not provided.

For local template paths specified with `--template-path`, the system at packages/templatizer/src/loadTemplates.ts:64-84 first checks whether the path points directly to a template directory by looking for a `.questions.json` file. If found, it uses that directory directly. Otherwise, it treats the path as a boilerplates root directory and appends the template type ('workspace' or 'module') to construct the full template path. This dual-mode resolution allows users to point either to a specific template directory or to a boilerplates root containing multiple template types.

Once templates are loaded and compiled, the system renders them with the provided variables using `writeRenderedTemplates` at packages/templatizer/src/templatize/generateFromCompiled.ts:6-17. This function iterates through each compiled template function, calls it with the variables object, and writes the resulting files to the target directory. The rendering process creates any necessary parent directories recursively before writing each file.

For workspace initialization, no additional post-render steps occur beyond writing the template files. The workspace is immediately ready for use after the files are written. Users can then navigate into the workspace directory and begin creating modules with `pgpm init`.

## Module Init Flow

Module initialization follows a more complex flow than workspace initialization because it must validate the current location and integrate with an existing workspace structure. The module init logic at packages/pgpm/src/commands/init/module.ts:10-86 begins by retrieving git configuration information using `getGitConfigInfo` from packages/types/src/launchql.ts:322-347. This function reads the user's global git config to extract `user.name` and `user.email`, which will be used to populate author information in generated files.

The system then creates a `LaunchQLPackage` instance with the current working directory and performs workspace detection. If no workspace is found (indicated by `!project.workspacePath` at packages/pgpm/src/commands/init/module.ts:19-22), the system throws a `NOT_IN_WORKSPACE` error and exits. This requirement ensures that modules are always created within a workspace context.

Beyond workspace detection, the system validates that the current directory is an allowed location for module creation. The validation logic at packages/pgpm/src/commands/init/module.ts:24-27 checks three conditions using `LaunchQLPackage` methods. The current directory must be inside an allowed directory (like packages/), be the workspace root itself, or be a parent of allowed directories. This validation prevents modules from being created in arbitrary locations within the workspace.

The actual directory creation logic at packages/core/src/core/class/launchql.ts:185-209 implements specific behavior based on the current location. If the current directory is the workspace root (determined by comparing resolved paths), the system creates a packages/ subdirectory if it doesn't exist and places the new module there. If the current directory is a parent of allowed directories (like packages/ itself), the module is created directly in the current directory. If the current directory is inside an existing module, the system prints an error message using chalk.red and calls `process.exit(1)`, explicitly preventing nested module creation. This guardrail ensures that the workspace structure remains clean and predictable.

After location validation, the system prompts the user for module-specific information. The prompts at packages/pgpm/src/commands/init/module.ts:31-46 request a module name and a list of extensions. The module name is required and will be slugified before use. The extensions prompt presents a checkbox list of available extensions, which includes both PostgreSQL native extensions and other LaunchQL modules found in the workspace. Users can also enter custom extension names that aren't in the list.

The system extracts the selected extensions from the prompt results at packages/pgpm/src/commands/init/module.ts:51-53 by filtering for options marked as selected and mapping to their names. These extensions will be written to the module's .control file to declare dependencies.

Template source selection for modules follows the same precedence as workspace initialization. The logic at packages/pgpm/src/commands/init/module.ts:55-71 checks for `--repo` first, then `--template-path`, and falls back to default templates if neither is provided. The template loading mechanism is identical to workspace initialization, using the same `loadTemplates` function from the templatizer package.

Once templates are loaded, the system calls `project.initModule` at packages/pgpm/src/commands/init/module.ts:73-82 with a variables object that includes all prompt answers, the slugified module name, git configuration values mapped to `USERFULLNAME` and `USEREMAIL`, the extensions list, and the template source if provided. The `initModule` method at packages/core/src/core/class/launchql.ts:423-437 handles the actual template rendering and post-render initialization steps.

The post-render steps for module initialization are more extensive than workspace initialization. After rendering template files with `writeRenderedTemplates`, the system calls `initModuleSqitch` at packages/core/src/core/class/launchql.ts:404-421 to create the LaunchQL migration structure. This function generates a launchql.plan file using the plan generator from the package-files package, creating an empty plan with the module name and URI. It then creates three directories: deploy/, revert/, and verify/, which will contain SQL migration scripts as the module evolves.

Finally, the system calls `writeExtensions` at packages/core/src/core/class/launchql.ts:436 to write the module's .control file with the selected extension dependencies. This control file is used by the LaunchQL dependency resolution system to determine the correct order for deploying modules and their dependencies.

## Template Sources in Depth

The LaunchQL init system supports three distinct template sources, each with specific resolution rules and behaviors. Understanding these sources is essential for customizing the initialization process or debugging template-related issues.

Default pre-compiled templates are exported by the `@launchql/templatizer` package as `moduleTemplate` and `workspaceTemplate` at packages/templatizer/src/index.ts:1-18. These templates are generated during the templatizer package's build process by running the `makeTemplates` script, which compiles the boilerplates/ directory into TypeScript files in src/generated/. This pre-compilation means that the default templates are always available without requiring filesystem access to the boilerplates directory at runtime.

Local template sources specified with `--template-path` undergo a two-stage resolution process. The `loadTemplates` function at packages/templatizer/src/loadTemplates.ts:64-84 first checks whether the provided path contains a `.questions.json` file. The presence of this file indicates that the path points directly to a template directory (either workspace or module). If the file exists, the system uses that directory as-is. If the file doesn't exist, the system treats the path as a boilerplates root directory and appends the template type ('workspace' or 'module') to construct the full path. This dual-mode resolution provides flexibility: users can point to a complete boilerplates directory structure or directly to a specific template subdirectory.

If the resolved path doesn't exist or doesn't contain valid template files, the system throws an error indicating that the template directory was not found. This error handling at packages/templatizer/src/loadTemplates.ts:76-83 provides clear feedback when paths are incorrect or template structures are malformed.

GitHub template sources specified with `--repo` trigger a repository cloning process. The system at packages/templatizer/src/loadTemplates.ts:24-63 creates a temporary directory using `mkdtempSync` in the system's temp directory with a prefix of 'lql-template-'. It then constructs a repository URL, either using the provided URL directly if it starts with 'http' or constructing a GitHub URL from an owner/repo format. The clone operation uses `git clone --depth 1` to perform a shallow clone, which downloads only the latest commit from the specified branch (defaulting to 'main' if `--from-branch` is not provided).

The clone command sets environment variables `GIT_TERMINAL_PROMPT=0` and `GIT_ASKPASS=echo` to disable interactive authentication prompts. This configuration allows public repositories to be cloned without user interaction but means that private repositories requiring authentication will fail. After cloning, the system checks for a boilerplates/ directory at the repository root. If this directory doesn't exist, the system throws an error indicating that the repository structure is invalid. The system then looks for the specific template type subdirectory (workspace or module) within boilerplates/. If that subdirectory doesn't exist, another error is thrown.

The temporary directory is automatically cleaned up after template compilation, regardless of success or failure. This cleanup at packages/templatizer/src/loadTemplates.ts:86-92 ensures that temporary files don't accumulate in the system's temp directory.

## Variables and Prompting

The init system uses two mechanisms to populate template variables: explicit prompts defined in `.questions.json` files and automatic injection of derived or system values. Understanding which variables come from which source is crucial for creating custom templates or debugging variable-related issues.

Workspace templates define their prompt requirements in boilerplates/workspace/.questions.json. This file specifies four variables: `__USERFULLNAME__`, `__USEREMAIL__`, `__MODULENAME__`, and `__USERNAME__`. However, the actual workspace initialization flow at packages/pgpm/src/commands/init/workspace.ts:15-24 only prompts for the workspace name, passing all argv values and prompt answers to the template renderer at line 53. This means that workspace templates expecting `__USERFULLNAME__`, `__USEREMAIL__`, or `__USERNAME__` will receive "undefined" unless these values are provided via command-line arguments or other means.

Additionally, workspace templates reference `__MODULEDESC__` in the README.md file at boilerplates/workspace/README.md:5, but this variable is not defined in .questions.json and is not automatically injected. This discrepancy will cause "undefined" to appear in the rendered README unless the variable is provided externally.

Module templates define their prompt requirements in boilerplates/module/.questions.json, specifying seven variables: `__USERFULLNAME__`, `__USEREMAIL__`, `__MODULENAME__`, `__MODULEDESC__`, `__REPONAME__`, `__USERNAME__`, and `__ACCESS__`. The module initialization flow at packages/pgpm/src/commands/init/module.ts:31-48 prompts only for `MODULENAME` and `extensions`, but then automatically injects additional variables at lines 73-82.

The automatic variable injection for modules includes several derived and system values. The `name` variable receives the slugified version of the user-provided module name. The `USERFULLNAME` variable is populated from the git config's `user.name` field via `getGitConfigInfo`. The `USEREMAIL` variable comes from the git config's `user.email` field. The `extensions` variable contains the array of selected extension names. All prompt answers are also spread into the variables object, which means that any command-line arguments passed via argv are available to templates.

However, module templates reference `__PACKAGE_IDENTIFIER__` in package.json at boilerplates/module/package.json:2, but this variable is not defined in .questions.json and is not automatically injected by the module initialization code. This missing variable will render as "undefined" in the generated package.json unless it's provided via command-line arguments or the template is modified.

The variables object passed to `writeRenderedTemplates` contains all these values merged together. The rendering process at packages/templatizer/src/templatize/generateFromCompiled.ts:11-15 calls each template function with this variables object, and the template functions use JavaScript template literals to substitute values. Because the substitution uses `${vars.VARNAME}` syntax evaluated by `new Function()`, missing variables don't throw errors—they simply render as the string "undefined".

## File and Content Generation Rules

The template compilation and rendering system applies variable substitution to both filenames and file contents, enabling dynamic generation of project structures. The compilation process at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:28-63 treats filenames and contents as separate template strings, both subject to the same variable replacement rules.

For filenames, the relative path from the template directory root is treated as a template string. If a template directory contains a file at `__MODULENAME__/package.json`, the `__MODULENAME__` portion will be replaced with the actual module name, creating a directory named after the module. This path templating at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:40 enables templates to create module-specific directory structures.

For file contents, the entire file is read as UTF-8 text and processed for variable replacement. The system at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:36-39 first escapes special characters that would interfere with JavaScript template literal syntax. Backslashes are escaped as `\\`, backticks as `\``, and template literal expressions `${` as `\${`. This escaping ensures that the file content can be safely embedded in a template literal string without triggering premature evaluation.

After escaping, the `replaceDoubleUnderscoreVars` function at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:22-24 uses a regular expression to find all occurrences of the `__VARNAME__` pattern and replace them with `${vars.VARNAME}`. The regular expression `/__(A-Z0-9_]+)__/g` matches double underscores surrounding one or more uppercase letters, digits, or underscores. This pattern means that variable names must be uppercase and can include numbers and underscores, but cannot include lowercase letters or other characters.

The rendering process creates a JavaScript function for each template file using `new Function('vars', 'return `${templateString}`;')` at packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:51-52. This function takes a variables object as its parameter and returns an object containing the rendered relative path and content. When the function is called during rendering, the JavaScript engine evaluates the template literal, substituting all `${vars.VARNAME}` expressions with their corresponding values from the variables object.

The use of `new Function()` for rendering has important implications. If a variable referenced in a template doesn't exist in the variables object, JavaScript's property access returns `undefined`, which is then coerced to the string "undefined" when interpolated into the template literal. This behavior means that typos in variable names or missing variable definitions will silently produce incorrect output rather than throwing errors. Template authors must be careful to ensure that all referenced variables are properly defined and provided.

## Guardrails and Errors

The init system implements several guardrails to prevent invalid workspace and module structures. These guardrails provide clear error messages and exit the process when violations are detected, ensuring that users understand what went wrong and how to fix it.

The primary workspace detection guardrail at packages/pgpm/src/commands/init/module.ts:19-22 checks whether the current directory is inside a LaunchQL workspace. If `project.workspacePath` is undefined, indicating no workspace was found by walking up the directory tree, the system throws a `NOT_IN_WORKSPACE` error. This error prevents modules from being created outside of workspace contexts, which would result in orphaned modules without proper workspace configuration.

The allowed location validation at packages/pgpm/src/commands/init/module.ts:24-27 ensures that modules are created in appropriate locations within the workspace. The validation uses three methods from `LaunchQLPackage`: `isInsideAllowedDirs`, `isInWorkspace`, and `isParentOfAllowedDirs`. If none of these conditions are true, the system throws a `NOT_IN_WORKSPACE_MODULE` error. This validation prevents modules from being created in arbitrary workspace subdirectories that aren't designated for module storage.

The nested module prevention guardrail at packages/core/src/core/class/launchql.ts:199-201 explicitly checks whether the current directory is inside an existing module. If `isInsideModule` returns true, the system prints a red error message using chalk: "Error: Cannot create a module inside an existing module. Please run 'lql init' from the workspace root or from a parent directory like 'packages/'." The system then calls `process.exit(1)` to terminate with a non-zero exit code. This guardrail prevents deeply nested module structures that would complicate dependency resolution and workspace management.

The directory creation logic at packages/core/src/core/class/launchql.ts:185-209 also includes a fallback error case at lines 202-205. If the current directory doesn't match any of the expected patterns (workspace root, parent directory, or inside allowed directory), the system prints an error message listing the allowed directories and exits. This error provides actionable feedback by showing users exactly where they can create modules.

Template loading errors occur when template sources are invalid or inaccessible. For GitHub sources, if the cloned repository doesn't contain a boilerplates/ directory, the system throws an error at packages/templatizer/src/loadTemplates.ts:52 indicating that the boilerplates directory was not found. If the specific template type subdirectory (workspace or module) doesn't exist within boilerplates/, another error is thrown at line 58. These errors help users understand that their repository structure doesn't match the expected layout.

For local template paths, if the resolved path doesn't exist, the system throws an error at packages/templatizer/src/loadTemplates.ts:77 or 82 indicating that the template directory was not found. This error includes the full resolved path, making it easier to diagnose path-related issues.

Git configuration errors occur when `getGitConfigInfo` cannot retrieve user information. If the git config commands fail (for example, if git is not installed or not configured), the function at packages/types/src/launchql.ts:344-346 throws an error with the message "Failed to retrieve global git config. Ensure git is configured." This error prevents module initialization from proceeding with missing author information.

## Testing and Verification

The init system includes comprehensive test coverage that exercises both workspace and module initialization flows with various template sources and edge cases. These tests serve as both verification of system behavior and documentation of expected usage patterns.

The primary test suite is located at packages/cli/__tests__/init.test.ts and covers workspace initialization, module initialization, custom template sources, and error cases. The test suite at lines 63-73 verifies basic workspace initialization by running `pgpm init --workspace` with a workspace name and checking that the expected files are created. Module initialization tests at lines 75-92 verify that modules can be created within workspaces and that the generated files match expected snapshots.

Custom template source tests at lines 94-240 verify that both local paths and GitHub repositories can be used as template sources. The local path tests at lines 95-169 use the `--template-path` flag to point to the boilerplates directory and verify that templates are loaded correctly. The GitHub repository tests at lines 174-239 use the `--repo` flag with the launchql/launchql repository and verify that templates are cloned and loaded. These tests are conditionally skipped in CI environments unless the `ALLOW_NETWORK_TESTS` environment variable is set, preventing network-dependent tests from causing CI failures.

Edge case tests at lines 242-473 verify behavior in various scenarios. Tests at lines 243-288 verify that modules can be initialized from the packages/ directory itself, not just from the workspace root. Tests at lines 290-350 verify that modules can be initialized when other modules already exist in the workspace. Tests at lines 353-425 verify that nested module creation is prevented with appropriate error messages. Tests at lines 428-472 verify that modules can be initialized from the workspace root and are placed in the packages/ directory.

Template loading tests are located at packages/cli/__tests__/init.templates.test.ts and focus specifically on the template loading mechanism. Tests at lines 11-61 verify local template loading with various path configurations. Tests at lines 64-141 verify GitHub template loading with different repository and branch configurations, including error cases for invalid repositories and branches.

For local verification of the init system, developers can follow these steps to mirror the test suite:

First, create a temporary directory and initialize a workspace: `mkdir /tmp/test-workspace && cd /tmp/test-workspace && pgpm init --workspace --name my-workspace`. Verify that the workspace directory is created with expected files including package.json, launchql.json, pnpm-workspace.yaml, and the packages/ directory.

Next, navigate into the workspace and create a module: `cd my-workspace && pgpm init --name my-module --extensions plpgsql`. Verify that the module is created in packages/my-module/ with expected files including package.json, launchql.plan, my-module.control, and the deploy/, revert/, and verify/ directories.

Test custom local templates by creating a custom template directory and using `--template-path`: `pgpm init --workspace --name custom-workspace --template-path /path/to/custom/templates`. Verify that files from the custom template are used instead of default templates.

Test GitHub templates by using `--repo` with a repository containing boilerplates: `pgpm init --workspace --name github-workspace --repo launchql/launchql`. Verify that templates are cloned from the repository and used for initialization. Note that this requires network access and will fail if the repository is inaccessible.

Test error cases by attempting to create a module outside a workspace, inside an existing module, or with invalid template paths. Verify that appropriate error messages are displayed and the process exits with a non-zero exit code.

## Known Pitfalls and Improvements

The init system has several known issues and areas for improvement that users and developers should be aware of when working with templates or debugging initialization problems.

The most significant pitfall is the silent rendering of undefined variables as the string "undefined". Because the template rendering system uses JavaScript template literals evaluated with `new Function()`, missing variables don't throw errors—they simply render as "undefined" in the output. This behavior can lead to subtle bugs where generated files contain the literal string "undefined" instead of the expected values. Template authors must carefully verify that all variables referenced in templates are properly defined in .questions.json or automatically injected by the initialization code.

Several variables used in templates are not properly defined or injected. The `__PACKAGE_IDENTIFIER__` variable appears in module templates at boilerplates/module/package.json:2 but is not defined in .questions.json and is not automatically injected by the module initialization code. This will cause "undefined" to appear in the generated package.json. Similarly, `__MODULEDESC__` appears in workspace templates at boilerplates/workspace/README.md:5 but is not defined in the workspace .questions.json file, causing "undefined" to appear in workspace READMEs.

The workspace initialization flow does not automatically inject git configuration values like `USERFULLNAME` and `USEREMAIL`, even though these variables are defined in boilerplates/workspace/.questions.json. This means that workspace templates expecting these values will receive "undefined" unless they are provided via command-line arguments. The module initialization flow does inject these values, creating an inconsistency between workspace and module initialization.

The mapping from git config to template variables uses `username` from `getGitConfigInfo`, which comes from `git config user.name`. This is typically a full name like "John Doe" rather than a username like "johndoe". The variable name `USERFULLNAME` reflects this, but templates that expect a GitHub username should use `__USERNAME__` instead, which must be provided via prompts or command-line arguments.

The template compilation process does not validate that all variables referenced in templates are defined in .questions.json or will be automatically injected. This lack of validation means that template authors can easily introduce undefined variable references that won't be caught until templates are rendered. A validation step during template compilation or before rendering could catch these issues early and provide clear error messages.

The init system does not support a dry-run mode that would show what files would be created and what variables would be used without actually writing files. Such a mode would be valuable for debugging template issues and verifying that variables are correctly populated before committing to file creation.

The sluggify function used to transform user-provided names into directory names is not well-documented in terms of its exact behavior. Users may be surprised by how their input is transformed, especially if they use special characters or non-ASCII characters. Clearer documentation of sluggify behavior or validation of user input before slugification would improve the user experience.

The GitHub template loading mechanism requires network access and only works with public repositories or repositories where the user has already configured authentication. Private repositories requiring authentication will fail because the clone operation disables interactive prompts. Supporting authenticated repository access would require additional configuration or credential management.

The error messages for nested module creation and invalid locations are helpful, but they could be improved by suggesting specific corrective actions. For example, when preventing nested module creation, the error could suggest navigating to the workspace root or packages/ directory and provide the exact command to run.

The template system does not support conditional file generation based on variable values. For example, it's not possible to include or exclude certain files based on whether specific extensions are selected. This limitation means that templates must include all possible files, even if some are not relevant for certain configurations.

## Debugging Checklist

When encountering issues with the init system, developers can follow this systematic debugging checklist to identify and resolve problems.

First, verify that you're in the correct location for the operation you're attempting. For workspace initialization, you can run `pgpm init --workspace` from any directory. For module initialization, verify that you're inside a workspace by checking for a launchql.json file in the current directory or parent directories. Use `find . -name launchql.json` to locate workspace configuration files.

Second, check that all required variables are defined and will be populated. For custom templates, compare the variables referenced in template files (using `grep -r "__[A-Z_]*__" /path/to/templates`) against the variables defined in .questions.json and the variables automatically injected by the initialization code. Any variables that appear in templates but not in .questions.json or automatic injection will render as "undefined".

Third, verify template source accessibility. For local templates with `--template-path`, ensure the path exists and contains either a .questions.json file (for direct template directories) or workspace/ and module/ subdirectories (for boilerplates root directories). Use `ls -la /path/to/templates` to verify directory contents. For GitHub templates with `--repo`, ensure you have network access and the repository is public or you have authentication configured. Test repository access with `git clone --depth 1 https://github.com/owner/repo /tmp/test-clone`.

Fourth, examine the generated files for "undefined" strings. After running init, use `grep -r "undefined" /path/to/generated/files` to find any instances where variables were not properly substituted. This will reveal which variables are missing or incorrectly named.

Fifth, review the test suite at packages/cli/__tests__/init.test.ts to see examples of correct usage. The test cases show exactly what arguments are passed and what files are expected to be generated. Running the tests locally with `cd packages/cli && pnpm test init.test.ts` can help verify that the init system is working correctly in your environment.

Sixth, check git configuration if module initialization fails with git config errors. Run `git config --global user.name` and `git config --global user.email` to verify that git is configured. If these commands fail or return empty values, configure git with `git config --global user.name "Your Name"` and `git config --global user.email "your@email.com"`.

Seventh, verify workspace configuration if module initialization fails with location errors. Check the launchql.json file in the workspace root to see which directories are configured as package directories. The `packages` field should contain glob patterns like `["packages/*"]`. Ensure your current directory matches one of these patterns or is the workspace root itself.

Eighth, examine the exact error messages and exit codes. The init system uses `process.exit(1)` for error cases and prints specific error messages using chalk.red. These messages indicate exactly what validation failed and often suggest corrective actions. Don't ignore these messages—they provide crucial debugging information.

## Cross-References and Code Locations

For developers who need to examine or modify the init system, here are the key code locations with line number references:

Command entry and routing: packages/pgpm/src/commands/init/index.ts:43-53 handles the workspace vs module dispatch based on the --workspace flag.

Workspace initialization: packages/pgpm/src/commands/init/workspace.ts:11-57 implements the complete workspace init flow including prompting, directory creation, template loading, and rendering.

Module initialization: packages/pgpm/src/commands/init/module.ts:10-86 implements the module init flow including workspace detection, location validation, prompting, template loading, and post-render steps.

Module directory creation and validation: packages/core/src/core/class/launchql.ts:185-209 implements the logic for determining where to create modules and preventing nested modules.

Module post-render initialization: packages/core/src/core/class/launchql.ts:423-437 calls template rendering and post-render steps, and packages/core/src/core/class/launchql.ts:404-421 implements launchql.plan creation and directory structure initialization.

Template compilation: packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:28-63 converts template directories into executable functions with variable substitution.

Variable replacement: packages/templatizer/src/templatize/compileTemplatesToFunctions.ts:22-24 transforms __VAR__ syntax into template literal expressions.

Template rendering: packages/templatizer/src/templatize/generateFromCompiled.ts:6-17 executes compiled template functions and writes files to disk.

Template loading: packages/templatizer/src/loadTemplates.ts:17-93 handles loading templates from local paths or GitHub repositories with appropriate resolution rules.

Git configuration retrieval: packages/types/src/launchql.ts:322-347 reads git config values for author information.

Test suite: packages/cli/__tests__/init.test.ts contains comprehensive tests for workspace and module initialization with various configurations and edge cases.

Template loading tests: packages/cli/__tests__/init.templates.test.ts contains tests specifically for template loading from local and GitHub sources.

Default templates: boilerplates/workspace/ and boilerplates/module/ contain the default template files used when no custom template source is specified.

These references enable developers to quickly navigate to relevant code when investigating issues or implementing enhancements to the init system.
