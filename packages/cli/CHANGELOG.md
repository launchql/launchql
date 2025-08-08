# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.7.1](https://github.com/launchql/launchql/compare/@launchql/cli@4.7.0...@launchql/cli@4.7.1) (2025-08-08)

**Note:** Version bump only for package @launchql/cli





# [4.7.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.6.0...@launchql/cli@4.7.0) (2025-08-08)


### Bug Fixes

* **cli:** use exact cwd handling pattern in lql plan command ([dca0e50](https://github.com/launchql/launchql/commit/dca0e5030bb5e2ae81eab3e9c6b0977ed2cd3ddc))
* update tags test expectation for CHANGE_NOT_FOUND error format ([df1f383](https://github.com/launchql/launchql/commit/df1f383a7578bc5275d41e7e0908e9a5f232b715)), closes [#200](https://github.com/launchql/launchql/issues/200)


### Features

* add bootstrap-db-roles CLI command with username/password parameters ([81e88ee](https://github.com/launchql/launchql/commit/81e88ee9352ca1edd7a8229a6e70d3e5e308a167))
* add LaunchQLInit class and CLI commands for bootstrap roles ([202fb2c](https://github.com/launchql/launchql/commit/202fb2cd312de3416521366b2e4ecdfa77a5ab63))
* add lql bootstrap command that calls both bootstrap-roles and bootstrap-test-roles ([65d2cae](https://github.com/launchql/launchql/commit/65d2caebd8ec7d711df0c68cded789a8417dad0d))
* **cli): default lql plan to include packages and prefer tags via non-blocking prompts; update usage text; keep advanced tags internal\n\nfix(core:** only prefer package tags when explicitly enabled; preserve prior default behavior in core API ([b770560](https://github.com/launchql/launchql/commit/b77056050337fad4f6387b78a79032a88a95e964))
* **core/cli:** simplify plan options to useTags; default CLI to packages+useTags (non-blocking). Keep preferPackageTags/tags as aliases for backward compatibility; update usage text ([f3db407](https://github.com/launchql/launchql/commit/f3db407c93f9f48bb57e7a2c9ac153dc30c5ce7c))
* expand error system with templated error types ([e08e1c1](https://github.com/launchql/launchql/commit/e08e1c1b3c4925807d59831695591a53ca8ebb9b))





# [4.6.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.5.0...@launchql/cli@4.6.0) (2025-07-31)


### Bug Fixes

* correct tag command logic to handle workspace vs module scenarios properly ([84833a6](https://github.com/launchql/launchql/commit/84833a6031e8b962e126e1d783a99decf70ca861))
* replace workspace:* with specific version ^2.1.13 for @launchql/env dependencies ([2fb68f2](https://github.com/launchql/launchql/commit/2fb68f247fd2aa9d966bafe19986db016c2be3c3))
* resolve tag command path issues and update test data for proper test isolation ([6bc6fae](https://github.com/launchql/launchql/commit/6bc6fae3f1f1f1207fed64deb8df35ca58f0cf42))
* resolve TypeScript errors in CLI tests and add core tests for tag functionality ([44fc18d](https://github.com/launchql/launchql/commit/44fc18dc6865e34cc6a9455bcb922b17ced5eb4e))
* restructure tag command logic to properly handle --package flag in workspace scenarios ([7612519](https://github.com/launchql/launchql/commit/76125193d9e451b1b9b1154b4a13cb60cd2c4a12))
* update package selection logic and add tests for tag command ([a7ff548](https://github.com/launchql/launchql/commit/a7ff54899804cda653c963c60930054fafdb253e))


### Features

* add --log-only flag for deployment logging ([a3071ee](https://github.com/launchql/launchql/commit/a3071ee03780f5d40e772594159840c973f95a85))
* add tag functionality to LaunchQL packages ([bd1ebaa](https://github.com/launchql/launchql/commit/bd1ebaa0c94552a1210378c103e78a8bc4843d14))
* create @launchql/env package for consolidated environment management ([004c78e](https://github.com/launchql/launchql/commit/004c78e87ceddfc2d0a3f74e79affe13c8a628d1))
* merge packages/migrate into packages/core ([0a615a7](https://github.com/launchql/launchql/commit/0a615a7ea28b42bb37b611364384a2e39ac8dfaf))





# [4.5.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.4.0...@launchql/cli@4.5.0) (2025-07-15)

**Note:** Version bump only for package @launchql/cli





# [4.4.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.3.1...@launchql/cli@4.4.0) (2025-06-30)

**Note:** Version bump only for package @launchql/cli





## [4.3.1](https://github.com/launchql/launchql/compare/@launchql/cli@4.3.0...@launchql/cli@4.3.1) (2025-06-28)

**Note:** Version bump only for package @launchql/cli





# [4.3.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.2.0...@launchql/cli@4.3.0) (2025-06-27)

**Note:** Version bump only for package @launchql/cli





# [4.2.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.31...@launchql/cli@4.2.0) (2025-06-25)


### Bug Fixes

* add function delimeter ([e099e39](https://github.com/launchql/launchql/commit/e099e3935412fba88fc74325d7cb7013cfe60336))





## [4.1.31](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.30...@launchql/cli@4.1.31) (2025-06-21)

**Note:** Version bump only for package @launchql/cli





## [4.1.30](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.29...@launchql/cli@4.1.30) (2025-05-30)

**Note:** Version bump only for package @launchql/cli





## [4.1.29](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.28...@launchql/cli@4.1.29) (2025-05-30)

**Note:** Version bump only for package @launchql/cli





## [4.1.28](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.27...@launchql/cli@4.1.28) (2025-05-30)

**Note:** Version bump only for package @launchql/cli





## [4.1.27](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.26...@launchql/cli@4.1.27) (2025-05-29)

**Note:** Version bump only for package @launchql/cli





## [4.1.26](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.25...@launchql/cli@4.1.26) (2025-05-27)

**Note:** Version bump only for package @launchql/cli





## [4.1.25](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.24...@launchql/cli@4.1.25) (2025-05-25)

**Note:** Version bump only for package @launchql/cli





## [4.1.24](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.23...@launchql/cli@4.1.24) (2025-05-24)

**Note:** Version bump only for package @launchql/cli





## [4.1.23](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.22...@launchql/cli@4.1.23) (2025-05-24)

**Note:** Version bump only for package @launchql/cli





## [4.1.22](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.21...@launchql/cli@4.1.22) (2025-05-24)

**Note:** Version bump only for package @launchql/cli





## [4.1.21](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.20...@launchql/cli@4.1.21) (2025-05-22)

**Note:** Version bump only for package @launchql/cli





## [4.1.20](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.18...@launchql/cli@4.1.20) (2025-05-22)

**Note:** Version bump only for package @launchql/cli





## [4.1.18](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.17...@launchql/cli@4.1.18) (2025-05-21)

**Note:** Version bump only for package @launchql/cli





## [4.1.17](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.16...@launchql/cli@4.1.17) (2025-05-21)

**Note:** Version bump only for package @launchql/cli





## [4.1.16](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.15...@launchql/cli@4.1.16) (2025-05-20)

**Note:** Version bump only for package @launchql/cli





## [4.1.15](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.14...@launchql/cli@4.1.15) (2025-05-20)

**Note:** Version bump only for package @launchql/cli





## [4.1.14](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.13...@launchql/cli@4.1.14) (2025-05-20)

**Note:** Version bump only for package @launchql/cli





## [4.1.13](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.12...@launchql/cli@4.1.13) (2025-05-20)

**Note:** Version bump only for package @launchql/cli





## [4.1.12](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.11...@launchql/cli@4.1.12) (2025-05-20)

**Note:** Version bump only for package @launchql/cli





## [4.1.11](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.10...@launchql/cli@4.1.11) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.10](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.9...@launchql/cli@4.1.10) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.9](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.8...@launchql/cli@4.1.9) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.8](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.7...@launchql/cli@4.1.8) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.7](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.6...@launchql/cli@4.1.7) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.6](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.5...@launchql/cli@4.1.6) (2025-05-19)

**Note:** Version bump only for package @launchql/cli





## [4.1.5](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.4...@launchql/cli@4.1.5) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.1.4](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.3...@launchql/cli@4.1.4) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.1.3](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.2...@launchql/cli@4.1.3) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.1.2](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.1...@launchql/cli@4.1.2) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.1.1](https://github.com/launchql/launchql/compare/@launchql/cli@4.1.0...@launchql/cli@4.1.1) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





# [4.1.0](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.20...@launchql/cli@4.1.0) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.0.20](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.19...@launchql/cli@4.0.20) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.0.19](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.18...@launchql/cli@4.0.19) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.0.18](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.17...@launchql/cli@4.0.18) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.0.17](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.16...@launchql/cli@4.0.17) (2025-05-18)

**Note:** Version bump only for package @launchql/cli





## [4.0.16](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.15...@launchql/cli@4.0.16) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.15](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.14...@launchql/cli@4.0.15) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.14](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.13...@launchql/cli@4.0.14) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.13](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.12...@launchql/cli@4.0.13) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.12](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.11...@launchql/cli@4.0.12) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.11](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.10...@launchql/cli@4.0.11) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.10](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.9...@launchql/cli@4.0.10) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.9](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.8...@launchql/cli@4.0.9) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.8](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.7...@launchql/cli@4.0.8) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.7](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.6...@launchql/cli@4.0.7) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.6](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.5...@launchql/cli@4.0.6) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.5](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.4...@launchql/cli@4.0.5) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.4](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.3...@launchql/cli@4.0.4) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.3](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.2...@launchql/cli@4.0.3) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.2](https://github.com/launchql/launchql/compare/@launchql/cli@4.0.1...@launchql/cli@4.0.2) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [4.0.1](https://github.com/launchql/launchql/compare/@launchql/cli@3.1.4...@launchql/cli@4.0.1) (2025-05-16)

**Note:** Version bump only for package @launchql/cli





## [2.0.1](https://github.com/launchql/launchql/compare/@launchql/cli@3.1.4...@launchql/cli@2.0.1) (2025-05-16)

**Note:** Version bump only for package @launchql/cli
