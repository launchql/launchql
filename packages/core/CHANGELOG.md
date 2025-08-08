# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.7.1](https://github.com/launchql/launchql/compare/@launchql/core@2.7.0...@launchql/core@2.7.1) (2025-08-08)

**Note:** Version bump only for package @launchql/core





# [2.7.0](https://github.com/launchql/launchql/compare/@launchql/core@2.6.0...@launchql/core@2.7.0) (2025-08-08)


### Bug Fixes

* copy init SQL files to dist directory during build ([e124f09](https://github.com/launchql/launchql/commit/e124f091f5d22c82447c4bf049981a90795999ef))
* **core:** honor plan order in plan mode; ensure dist-safe comments; update stage snapshots ([f88b8c8](https://github.com/launchql/launchql/commit/f88b8c89b378206b32776cab5a557946b350a76a))
* **core:** replace glob in JSDoc with line comments; add stage fixture tests for resolveDependencies (plan/sql) and update snapshots ([7552cba](https://github.com/launchql/launchql/commit/7552cba5df242f47cfb19ecd2877e2a6b1452cc9))
* update snapshots for GraphQL dependency changes ([c107b55](https://github.com/launchql/launchql/commit/c107b553733ad98ebfac595550c6bdcded2058ea))
* update test expectations for new templated error message formats ([0e895a7](https://github.com/launchql/launchql/commit/0e895a780307f903458f063952fad1587dbedc4d)), closes [#200](https://github.com/launchql/launchql/issues/200)
* update verification error message test expectation ([01ccb46](https://github.com/launchql/launchql/commit/01ccb46d142e428ffd36719952e4a80d3f59f4f7)), closes [#200](https://github.com/launchql/launchql/issues/200)
* use IF NOT EXISTS for app_user and app_admin role creation ([5328758](https://github.com/launchql/launchql/commit/532875830cbc199b60a63ffcaa10badb8b21c4f3))


### Features

* add bootstrapDbRoles method with custom username and password ([ecab17d](https://github.com/launchql/launchql/commit/ecab17d16fd430e36df8214316e08f8a9d162193))
* add LaunchQLInit class and CLI commands for bootstrap roles ([202fb2c](https://github.com/launchql/launchql/commit/202fb2cd312de3416521366b2e4ecdfa77a5ab63))
* **cli): default lql plan to include packages and prefer tags via non-blocking prompts; update usage text; keep advanced tags internal\n\nfix(core:** only prefer package tags when explicitly enabled; preserve prior default behavior in core API ([b770560](https://github.com/launchql/launchql/commit/b77056050337fad4f6387b78a79032a88a95e964))
* **core/cli:** simplify plan options to useTags; default CLI to packages+useTags (non-blocking). Keep preferPackageTags/tags as aliases for backward compatibility; update usage text ([f3db407](https://github.com/launchql/launchql/commit/f3db407c93f9f48bb57e7a2c9ac153dc30c5ce7c))
* **core:** plan-only dependency resolution; thread usePlan through DeployOptions and LaunchQLMigrate; use plan graph when usePlan=true ([571f37f](https://github.com/launchql/launchql/commit/571f37f5bdc1128398d8750b0bbe6261c31516ac))
* **core:** prefer [@latest](https://github.com/latest) tag for external packages in plan generation; expose tags option; add stage fixture test (unique-names) for packages+tags ([8656acb](https://github.com/launchql/launchql/commit/8656acb6af508561b616c96422660577eeb50902))
* **core:** thread usePlan into DeployOptions and LaunchQLMigrate; add plan-only mode to resolveDependencies to avoid SQL scanning when requested ([9c9e4e3](https://github.com/launchql/launchql/commit/9c9e4e3523d220b4b96bbc360dfb50789d69d8e2))
* expand error system with templated error types ([e08e1c1](https://github.com/launchql/launchql/commit/e08e1c1b3c4925807d59831695591a53ca8ebb9b))





# [2.6.0](https://github.com/launchql/launchql/compare/@launchql/core@2.5.0...@launchql/core@2.6.0) (2025-07-31)


### Bug Fixes

* add circular dependency detection to setModuleDependencies ([dd3cfe7](https://github.com/launchql/launchql/commit/dd3cfe7524e87848529180f2b714094a64fc911e))
* add explicit type casting to deploy procedure call parameters ([7dd527a](https://github.com/launchql/launchql/commit/7dd527a88da9ff90351c72700f8a447d68c934da))
* add missing afterAll teardown hooks to prevent database connection leaks ([e720460](https://github.com/launchql/launchql/commit/e72046021eb17a2e5a475267aac0075a8b0d829d))
* add TEXT casting to is_deployed function calls to resolve PostgreSQL parameter type inference ([320c11b](https://github.com/launchql/launchql/commit/320c11be0d01108d97e41b12318a1298c176437e))
* address event logging and verify method issues ([e325488](https://github.com/launchql/launchql/commit/e325488002472ce5ffee74d6faf0bd4de0997848))
* address feedback on test style and event logging ([21939af](https://github.com/launchql/launchql/commit/21939af2b5f581388bdc76f71aa32952e8189f99))
* address user feedback - use process.cwd() in sanitizeStackTrace and add verify event logging ([d8fed1c](https://github.com/launchql/launchql/commit/d8fed1ce12f59bbda870a9abc825c12505c847f9))
* address user feedback on event logging ([f6c9391](https://github.com/launchql/launchql/commit/f6c93915b9de3b781eb410aa94cfc52d69c3e40c))
* apply CWD fix to revertProject and verifyProject ([89b3b02](https://github.com/launchql/launchql/commit/89b3b0284d788b7f4744aa8b898c0e41e5fafc02))
* change extension dropping from CASCADE to RESTRICT with dependency handling ([eeffebe](https://github.com/launchql/launchql/commit/eeffebe8128c29ffa605a51cdc7d16958135b6fb))
* correct import path for resolveDependencies ([ae28ef9](https://github.com/launchql/launchql/commit/ae28ef9e52fe19d005cbba9eb998407eb8ce7a0f))
* improve stack trace sanitization for CI compatibility ([de66d56](https://github.com/launchql/launchql/commit/de66d56fdce626a74063ac8820207ccd5b6e5111))
* improve stack trace sanitization for CI environment ([2d6bc27](https://github.com/launchql/launchql/commit/2d6bc275eef1538ec6692b0d3e33903dae2230f1))
* make verify failures throw with rich error logging ([b50a5a6](https://github.com/launchql/launchql/commit/b50a5a62312a286fe6ecd7379d80bf24acb3b47b))
* move tag tests to separate file to avoid pg-cache conflicts ([b789dab](https://github.com/launchql/launchql/commit/b789dab934255a050dad01170ee42bc0fd86e321))
* pass logOnly parameter through deployment chain and simplify test ([6adca3a](https://github.com/launchql/launchql/commit/6adca3a4cae3934c48d379089dd30851c8ba7e41))
* properly handle database connection cleanup in tests to prevent Jest open handles ([40d08bc](https://github.com/launchql/launchql/commit/40d08bc563d02a909d0e516b0227af4c184a2ba4))
* remove obsolete snapshots after test separation ([a1f27d5](https://github.com/launchql/launchql/commit/a1f27d5fd79724a976566b46e122f229d0d8c1b3))
* remove stack_trace from event logging and clean up related code ([f6f25c5](https://github.com/launchql/launchql/commit/f6f25c56b76629e01342dd424d54aa22816cd660))
* remove teardownPgPools from individual test cleanup to prevent cache conflicts ([7d59495](https://github.com/launchql/launchql/commit/7d59495139eb034cf4739a7c5177f568faf8e1c3))
* remove timestamps from snapshots and fix ordering expectations ([37fe832](https://github.com/launchql/launchql/commit/37fe8321e11d3032a4162b6114cf3ad61302348d))
* remove unused deepmerge import from LaunchQLProject class ([05636fc](https://github.com/launchql/launchql/commit/05636fc046914399e4984cc105591c43a4e4f24c))
* remove unused deepmerge import from LaunchQLProject class ([30d9370](https://github.com/launchql/launchql/commit/30d93704afcdb9659bb8222f553315ddaab20974))
* remove useSqitch property from test fixtures ([e0abfc9](https://github.com/launchql/launchql/commit/e0abfc91e3ab63790df38420ed183ad55e1dc728))
* replace hardcoded 'packages' path with LaunchQLProject workspace resolution ([e720fd0](https://github.com/launchql/launchql/commit/e720fd07d4a7359a727dea14eb35b42ddfd70aa2))
* replace workspace:* with specific version ^2.1.13 for @launchql/env dependencies ([2fb68f2](https://github.com/launchql/launchql/commit/2fb68f247fd2aa9d966bafe19986db016c2be3c3))
* resolve database connection leaks in CoreDeployTestFixture ([93b0f88](https://github.com/launchql/launchql/commit/93b0f885e29fc045180066d6638c401f9acd892c))
* resolve TypeScript errors in CLI tests and add core tests for tag functionality ([44fc18d](https://github.com/launchql/launchql/commit/44fc18dc6865e34cc6a9455bcb922b17ced5eb4e))
* sanitize stack traces for environment-agnostic snapshots ([42cbf53](https://github.com/launchql/launchql/commit/42cbf5395f056c7b552ec67e5291d07f6d7cc769))
* update CoreDeployTestFixture import to use merged test-utils ([cfa3f1c](https://github.com/launchql/launchql/commit/cfa3f1c81933dbdd25d9f612e91e4a60b05b67de))
* update snapshot files to match renamed test files ([b06f945](https://github.com/launchql/launchql/commit/b06f945f74d1db669e1dedfa33ee7414341580b7))
* update snapshots for resolvedTags field in dependency resolution ([3a1e720](https://github.com/launchql/launchql/commit/3a1e7207b47107f752bd78cc1bda9cc8c565bd52))
* update tag test to use valid change name from plan file ([2dcb3d7](https://github.com/launchql/launchql/commit/2dcb3d759724d62bf0e728a425c8d9c89d421bf7))
* update tag tests to use non-conflicting names and remove snapshots ([50dd3bf](https://github.com/launchql/launchql/commit/50dd3bff5ea7c2b89af19c5f477a93b959d80600))
* update test expectations and snapshots for chronological ordering ([3784e04](https://github.com/launchql/launchql/commit/3784e04d4a1670350e4045a56553611c12c85312))
* update test imports to use merged test-utils ([393045d](https://github.com/launchql/launchql/commit/393045d2976a919121e55ee30c78ae5c279d4cd2))
* update test to expect correct schema name 'otherschema' instead of 'metaschema' ([bade572](https://github.com/launchql/launchql/commit/bade57293b451a474bac04963b91b3be9aa3ba4b))
* use sanitized events in getMigrationState return value ([d16658a](https://github.com/launchql/launchql/commit/d16658a4744f712e74dcecb8d86fdb8e05e4c4ec))
* use unique tag name v2.2.0 to avoid conflict with existing v2.1.0 tag ([f862cac](https://github.com/launchql/launchql/commit/f862cac246bf4993ddac1cadfdc6305b461d7e2c))


### Features

* add --log-only flag for deployment logging ([c1919cc](https://github.com/launchql/launchql/commit/c1919ccb10828ad7f89ff3667225fdd7c935982c))
* add cross-module tag resolution to revert functionality ([21c5477](https://github.com/launchql/launchql/commit/21c547739e62b7191560c45a340971cb82116783))
* add deployment failure scenarios test ([0eb1f4e](https://github.com/launchql/launchql/commit/0eb1f4ed71acb3e75a7a725a35479b91df11f394))
* add deployModules tests with tag dependencies and cross-project scenarios ([bc1fe9c](https://github.com/launchql/launchql/commit/bc1fe9c0e2d4ef9d983ddc1697644cef680066c3))
* add forked deployment test for my-third project ([36b27fc](https://github.com/launchql/launchql/commit/36b27fc839d255938569fce8e42ec5db670437c1))
* add getModuleProject helper method to eliminate repetitive module retrieval ([189c908](https://github.com/launchql/launchql/commit/189c9086f17c15875d2566edb2cf958b44f1d102))
* add migration state snapshots for deployment failure scenarios ([97b95a1](https://github.com/launchql/launchql/commit/97b95a104bbbb3d096ca71eb852cfa3ddab70ed1))
* add missing migrate test files from packages/migrate ([d4f95ff](https://github.com/launchql/launchql/commit/d4f95ff3d8c615b3b5f8aac235e6d23ece74eb9c))
* add tag functionality to LaunchQL packages ([bd1ebaa](https://github.com/launchql/launchql/commit/bd1ebaa0c94552a1210378c103e78a8bc4843d14))
* add toChange parameter support to verify method and create verify-modules test ([e38ea45](https://github.com/launchql/launchql/commit/e38ea45dd59986bb600bc0dbb3423d2e86344353))
* add verify failure test and remove duplicate event logging ([642d25d](https://github.com/launchql/launchql/commit/642d25d3b27c270fa8ba148674bbd6778a0581c6))
* complete migration cleanup - add migrate index.ts and remove packages/migrate directory ([800dede](https://github.com/launchql/launchql/commit/800dede97b2ee39f8d2dd0f4013ed9db2578d76c))
* create @launchql/env package for consolidated environment management ([004c78e](https://github.com/launchql/launchql/commit/004c78e87ceddfc2d0a3f74e79affe13c8a628d1))
* enhance event logging to persist outside transactions ([12c20ad](https://github.com/launchql/launchql/commit/12c20ad6cc8b17c564b4b19cf9531f8eca8cc8cf))
* merge packages/migrate into packages/core ([0a615a7](https://github.com/launchql/launchql/commit/0a615a7ea28b42bb37b611364384a2e39ac8dfaf))





# [2.5.0](https://github.com/launchql/launchql/compare/@launchql/core@2.4.0...@launchql/core@2.5.0) (2025-07-15)


### Features

* remove all sqitch.conf references, use launchql.plan for module discovery ([59c5003](https://github.com/launchql/launchql/commit/59c500304da69efc3cdb8111ffbac22af80e3189))


### BREAKING CHANGES

* Modules are now identified by launchql.plan files instead of sqitch.conf





# [2.4.0](https://github.com/launchql/launchql/compare/@launchql/core@2.3.1...@launchql/core@2.4.0) (2025-06-30)

**Note:** Version bump only for package @launchql/core





## [2.3.1](https://github.com/launchql/launchql/compare/@launchql/core@2.3.0...@launchql/core@2.3.1) (2025-06-28)

**Note:** Version bump only for package @launchql/core





# [2.3.0](https://github.com/launchql/launchql/compare/@launchql/core@2.2.0...@launchql/core@2.3.0) (2025-06-27)

**Note:** Version bump only for package @launchql/core





# [2.2.0](https://github.com/launchql/launchql/compare/@launchql/core@2.1.20...@launchql/core@2.2.0) (2025-06-25)


### Bug Fixes

* add function delimeter ([e099e39](https://github.com/launchql/launchql/commit/e099e3935412fba88fc74325d7cb7013cfe60336))





## [2.1.20](https://github.com/launchql/launchql/compare/@launchql/core@2.1.19...@launchql/core@2.1.20) (2025-05-30)

**Note:** Version bump only for package @launchql/core





## [2.1.19](https://github.com/launchql/launchql/compare/@launchql/core@2.1.18...@launchql/core@2.1.19) (2025-05-30)

**Note:** Version bump only for package @launchql/core





## [2.1.18](https://github.com/launchql/launchql/compare/@launchql/core@2.1.17...@launchql/core@2.1.18) (2025-05-29)

**Note:** Version bump only for package @launchql/core





## [2.1.17](https://github.com/launchql/launchql/compare/@launchql/core@2.1.16...@launchql/core@2.1.17) (2025-05-27)

**Note:** Version bump only for package @launchql/core





## [2.1.16](https://github.com/launchql/launchql/compare/@launchql/core@2.1.15...@launchql/core@2.1.16) (2025-05-25)

**Note:** Version bump only for package @launchql/core





## 2.1.15 (2025-05-24)

**Note:** Version bump only for package @launchql/core





## [2.1.14](https://github.com/launchql/launchql/compare/@launchql/core@2.1.13...@launchql/core@2.1.14) (2025-05-24)

**Note:** Version bump only for package @launchql/core





## [2.1.13](https://github.com/launchql/launchql/compare/@launchql/core@2.1.12...@launchql/core@2.1.13) (2025-05-20)

**Note:** Version bump only for package @launchql/core





## [2.1.12](https://github.com/launchql/launchql/compare/@launchql/core@2.1.11...@launchql/core@2.1.12) (2025-05-20)

**Note:** Version bump only for package @launchql/core





## [2.1.11](https://github.com/launchql/launchql/compare/@launchql/core@2.1.10...@launchql/core@2.1.11) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.10](https://github.com/launchql/launchql/compare/@launchql/core@2.1.9...@launchql/core@2.1.10) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.9](https://github.com/launchql/launchql/compare/@launchql/core@2.1.8...@launchql/core@2.1.9) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.8](https://github.com/launchql/launchql/compare/@launchql/core@2.1.7...@launchql/core@2.1.8) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.7](https://github.com/launchql/launchql/compare/@launchql/core@2.1.6...@launchql/core@2.1.7) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.6](https://github.com/launchql/launchql/compare/@launchql/core@2.1.5...@launchql/core@2.1.6) (2025-05-19)

**Note:** Version bump only for package @launchql/core





## [2.1.5](https://github.com/launchql/launchql/compare/@launchql/core@2.1.4...@launchql/core@2.1.5) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.1.4](https://github.com/launchql/launchql/compare/@launchql/core@2.1.3...@launchql/core@2.1.4) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.1.3](https://github.com/launchql/launchql/compare/@launchql/core@2.1.2...@launchql/core@2.1.3) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.1.2](https://github.com/launchql/launchql/compare/@launchql/core@2.1.1...@launchql/core@2.1.2) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.1.1](https://github.com/launchql/launchql/compare/@launchql/core@2.1.0...@launchql/core@2.1.1) (2025-05-18)

**Note:** Version bump only for package @launchql/core





# [2.1.0](https://github.com/launchql/launchql/compare/@launchql/core@2.0.15...@launchql/core@2.1.0) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.0.15](https://github.com/launchql/launchql/compare/@launchql/core@2.0.14...@launchql/core@2.0.15) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.0.14](https://github.com/launchql/launchql/compare/@launchql/core@2.0.13...@launchql/core@2.0.14) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.0.13](https://github.com/launchql/launchql/compare/@launchql/core@2.0.12...@launchql/core@2.0.13) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.0.12](https://github.com/launchql/launchql/compare/@launchql/core@2.0.11...@launchql/core@2.0.12) (2025-05-18)

**Note:** Version bump only for package @launchql/core





## [2.0.11](https://github.com/launchql/launchql/compare/@launchql/core@2.0.10...@launchql/core@2.0.11) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.10](https://github.com/launchql/launchql/compare/@launchql/core@2.0.9...@launchql/core@2.0.10) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.9](https://github.com/launchql/launchql/compare/@launchql/core@2.0.8...@launchql/core@2.0.9) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.8](https://github.com/launchql/launchql/compare/@launchql/core@2.0.7...@launchql/core@2.0.8) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.7](https://github.com/launchql/launchql/compare/@launchql/core@2.0.6...@launchql/core@2.0.7) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.6](https://github.com/launchql/launchql/compare/@launchql/core@2.0.5...@launchql/core@2.0.6) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.5](https://github.com/launchql/launchql/compare/@launchql/core@2.0.4...@launchql/core@2.0.5) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.4](https://github.com/launchql/launchql/compare/@launchql/core@2.0.3...@launchql/core@2.0.4) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.3](https://github.com/launchql/launchql/compare/@launchql/core@2.0.2...@launchql/core@2.0.3) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## [2.0.2](https://github.com/launchql/launchql/compare/@launchql/core@2.0.1...@launchql/core@2.0.2) (2025-05-16)

**Note:** Version bump only for package @launchql/core





## 2.0.1 (2025-05-16)

**Note:** Version bump only for package @launchql/core
