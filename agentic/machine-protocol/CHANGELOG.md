# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/constructive-io/constructive/compare/@constructive-db/machine-protocol@0.2.2...@constructive-db/machine-protocol@0.3.0) (2026-10-13)

### Bug Fixes

- **machine-runner:** re-check containment after open, cap path requests in flight ([45a67d5](https://github.com/constructive-io/constructive/commit/45a67d50027287ade5c1bd822ff544b2e417b112))

### Features

- **machine-runner:** list and read a path under the policy cwd, read-only ([bee596b](https://github.com/constructive-io/constructive/commit/bee596b23f3e81ac61352db157882a248fa0e632))

## [0.2.2](https://github.com/constructive-io/constructive/compare/@constructive-db/machine-protocol@0.2.1...@constructive-db/machine-protocol@0.2.2) (2026-09-25)

### Bug Fixes

- **agentic:** prepack builds machine-protocol/runner/agent-cli so lerna's workspace: rewrite reaches dist/package.json ([b5e3651](https://github.com/constructive-io/constructive/commit/b5e365162b39f72705d30a5b3cd05e333b05505b))

## [0.2.1](https://github.com/constructive-io/constructive/compare/@constructive-db/machine-protocol@0.2.0...@constructive-db/machine-protocol@0.2.1) (2026-09-25)

### Bug Fixes

- **agentic:** symlink-proof cwd confinement, terminal spawn failures, no CLI spawn after the session concludes, complete lines survive an oversized tail ([d5b9c27](https://github.com/constructive-io/constructive/commit/d5b9c278ae93c127e53b84a0d68d9d8c8716c277))

# 0.2.0 (2026-09-24)

### Bug Fixes

- **agentic:** machine-* use the root jest toolchain; register in the agentic test batch ([70c22f6](https://github.com/constructive-io/constructive/commit/70c22f62a305c01985c65e48eb09a83808ffad62))

### Features

- **agentic:** move @constructive-db/machine-protocol and machine-runner here so they publish ([4a341e6](https://github.com/constructive-io/constructive/commit/4a341e60751c4282f2d98adb9e6a3cba5def3d2d)), closes [constructive-planning#2102](https://github.com/constructive-planning/issues/2102)
