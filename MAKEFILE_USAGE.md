# Makefile Usage in LaunchQL Modules

This document explains where Makefiles are used in LaunchQL modules, when they are optional, and why.

- The module-level Makefile typically contains targets that reference the generated SQL artifact (e.g., extname--X.Y.Z.sql) and can be helpful for local workflows.
- As of this change, the Makefile is optional in packaging and publishing flows. If present, it will be read, updated, and copied as before. If absent, those flows will proceed without it.

What remains required:
- The launchql.plan file is required and must exist. Errors are thrown if it is missing or invalid.
- The .control file for the extension is required and must exist. Errors are thrown if it is missing.

Areas affected by this behavior:
- Packaging (lql package):
  - When building the SQL artifact, if the Makefile exists it will be updated to point to the new SQL filename. If the Makefile does not exist, the process continues without error.
- Publishing to a dist folder:
  - Required files (package.json, launchql.plan, and the module’s .control file) must exist and will be copied.
  - The Makefile, if present, will be copied; if it does not exist, publishing continues without error.
- Direct Makefile reads:
  - Calls that read the Makefile will return an empty string if it does not exist, instead of throwing, so that non-essential flows do not fail purely due to a missing Makefile.

Rationale:
- Extension generation and packaging can function without a Makefile. Making it optional avoids unnecessary failures in workflows where the Makefile is not needed.
- The launchql.plan and .control files define core schema and extension metadata, and must remain mandatory for correct operation.
