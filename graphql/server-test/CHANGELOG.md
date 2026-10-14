# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.33.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.32.1...graphql-server-test@3.33.0) (2026-10-14)

**Note:** Version bump only for package graphql-server-test

## [3.32.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.32.0...graphql-server-test@3.32.1) (2026-10-14)

**Note:** Version bump only for package graphql-server-test

# [3.32.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.31.0...graphql-server-test@3.32.0) (2026-10-14)

### Bug Fixes

- reconcile pgpm login passwords and test direct server login ([6350e2a](https://github.com/constructive-io/constructive/commit/6350e2ac7f4f303865371a9efcffb48c42b1740b))

### Features

- opt in to login RLS bypass through pgpm user provisioning ([c637b77](https://github.com/constructive-io/constructive/commit/c637b77f75659a0fd5ef75ea3434c2fe7012d063))

# [3.31.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.30.2...graphql-server-test@3.31.0) (2026-10-14)

### Bug Fixes

- **server:** function-bindings gather read runs as the control role; strict test connects as the login ([21e08ea](https://github.com/constructive-io/constructive/commit/21e08ea6e16780c3221beff5d6899ba81b1947f7))

### Features

- **server:** run every control-plane query as api.controlRole (SET LOCAL ROLE) ([0c06623](https://github.com/constructive-io/constructive/commit/0c06623fd6796c37e19c962fb29e11fe88b733cc))

## [3.30.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.30.1...graphql-server-test@3.30.2) (2026-10-14)

### Bug Fixes

- **webauthn:** pass the verified challenge to webauthn_finish_registration ([2278e45](https://github.com/constructive-io/constructive/commit/2278e457fc2160e5914ffee29f6208d024739858))

## [3.30.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.30.0...graphql-server-test@3.30.1) (2026-10-13)

**Note:** Version bump only for package graphql-server-test

# [3.30.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.9...graphql-server-test@3.30.0) (2026-10-13)

### Bug Fixes

- **graphql-server:** never mask errors; same formatting in every environment ([783dfac](https://github.com/constructive-io/constructive/commit/783dfacef5254db8975756ddc243a7f423b6f245))
- **presigned-url:** refuse storage_module rows that name their own endpoint/provider/region for the platform credentials ([16d15f4](https://github.com/constructive-io/constructive/commit/16d15f480265de3bb54b052fea0b2d76200d10c0))
- **webauthn:** persist a verified registration through the verifier lane ([e8fdba8](https://github.com/constructive-io/constructive/commit/e8fdba80d076fc88287e1cb31f07c1a917d4bd24))

### Features

- **graphql-server:** WebAuthn passkey ceremony as GraphQL mutations ([46c4920](https://github.com/constructive-io/constructive/commit/46c492050a5c406f7ed85f303ccf3400260e2552))
- **storage:** storage coordinates come only from storage_module; STORAGE_* credentials are the only env ([44c4516](https://github.com/constructive-io/constructive/commit/44c4516f347e7021067914f1148ebd87cb2131fb))

## [3.29.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.8...graphql-server-test@3.29.9) (2026-10-13)

### Bug Fixes

- **csrf,graphql-server:** one-day CSRF cookie, session-cookie opt-out for native clients, signOut always clears the cookie ([d8d6c9c](https://github.com/constructive-io/constructive/commit/d8d6c9c0c912c96b2aa3aeb9a952807cbd45848c))
- **graphql-server:** only count auth mutations of the operation that executes ([b3a4628](https://github.com/constructive-io/constructive/commit/b3a462853cd210771f8faaebafd86b411631d7b7))

## [3.29.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.7...graphql-server-test@3.29.8) (2026-10-13)

**Note:** Version bump only for package graphql-server-test

## [3.29.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.6...graphql-server-test@3.29.7) (2026-10-12)

**Note:** Version bump only for package graphql-server-test

## [3.29.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.5...graphql-server-test@3.29.6) (2026-10-07)

**Note:** Version bump only for package graphql-server-test

## [3.29.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.4...graphql-server-test@3.29.5) (2026-10-02)

**Note:** Version bump only for package graphql-server-test

## [3.29.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.3...graphql-server-test@3.29.4) (2026-09-30)

**Note:** Version bump only for package graphql-server-test

## [3.29.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.2...graphql-server-test@3.29.3) (2026-09-24)

**Note:** Version bump only for package graphql-server-test

## [3.29.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.1...graphql-server-test@3.29.2) (2026-09-19)

**Note:** Version bump only for package graphql-server-test

## [3.29.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.29.0...graphql-server-test@3.29.1) (2026-09-17)

**Note:** Version bump only for package graphql-server-test

# [3.29.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.28.1...graphql-server-test@3.29.0) (2026-09-17)

**Note:** Version bump only for package graphql-server-test

## [3.28.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.28.0...graphql-server-test@3.28.1) (2026-09-17)

**Note:** Version bump only for package graphql-server-test

# [3.28.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.27.0...graphql-server-test@3.28.0) (2026-09-17)

**Note:** Version bump only for package graphql-server-test

# [3.27.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.26.3...graphql-server-test@3.27.0) (2026-09-17)

**Note:** Version bump only for package graphql-server-test

## [3.26.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.26.2...graphql-server-test@3.26.3) (2026-09-15)

**Note:** Version bump only for package graphql-server-test

## [3.26.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.26.1...graphql-server-test@3.26.2) (2026-09-08)

**Note:** Version bump only for package graphql-server-test

## [3.26.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.26.0...graphql-server-test@3.26.1) (2026-09-08)

**Note:** Version bump only for package graphql-server-test

# [3.26.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.25.0...graphql-server-test@3.26.0) (2026-09-06)

### Features

- **graphql-server:** record refusals as their error code via events record_error ([c0a1208](https://github.com/constructive-io/constructive/commit/c0a1208e83052dd28c819a15c68b906aac1af32a))

# [3.25.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.6...graphql-server-test@3.25.0) (2026-09-05)

### Features

- **graphql-server:** record principal.widening_refused after PRINCIPAL_CHILD_WIDENS ([37a6476](https://github.com/constructive-io/constructive/commit/37a64763a01485677fb89dc7de77b1c0473f87fc))

## [3.24.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.5...graphql-server-test@3.24.6) (2026-09-04)

**Note:** Version bump only for package graphql-server-test

## [3.24.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.4...graphql-server-test@3.24.5) (2026-09-03)

**Note:** Version bump only for package graphql-server-test

## [3.24.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.3...graphql-server-test@3.24.4) (2026-09-02)

### Bug Fixes

- **server:** attribute anonymous requests to the database they address ([ba2c055](https://github.com/constructive-io/constructive/commit/ba2c055893980b3b196c1f7d63a6c95fd0041cd9))

## [3.24.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.2...graphql-server-test@3.24.3) (2026-09-01)

**Note:** Version bump only for package graphql-server-test

## [3.24.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.1...graphql-server-test@3.24.2) (2026-09-01)

**Note:** Version bump only for package graphql-server-test

## [3.24.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.24.0...graphql-server-test@3.24.1) (2026-08-31)

**Note:** Version bump only for package graphql-server-test

# [3.24.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.23.1...graphql-server-test@3.24.0) (2026-08-28)

### Bug Fixes

- **storage:** align integration fixtures with reconciliation ([50c2322](https://github.com/constructive-io/constructive/commit/50c232207dc1377eac169d1ec7626e65999a9713))

### Features

- **storage:** make reconciler sole bucket minting driver ([e15c7b5](https://github.com/constructive-io/constructive/commit/e15c7b58e46490e157542874c07de0adb2d96479))

## [3.23.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.23.0...graphql-server-test@3.23.1) (2026-08-28)

**Note:** Version bump only for package graphql-server-test

# [3.23.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.22.1...graphql-server-test@3.23.0) (2026-08-28)

### Bug Fixes

- **storage:** validate recorder capabilities ([fb0bb59](https://github.com/constructive-io/constructive/commit/fb0bb59bfebdc44fe87a137d37a4ea5cebb05acd))

### Features

- **storage:** use generated file recorder for uploads ([52f26b9](https://github.com/constructive-io/constructive/commit/52f26b9584e7491e95794c6102606f6697e5d218))

## [3.22.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.22.0...graphql-server-test@3.22.1) (2026-08-27)

**Note:** Version bump only for package graphql-server-test

# [3.22.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.21.0...graphql-server-test@3.22.0) (2026-08-25)

**Note:** Version bump only for package graphql-server-test

# [3.21.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.20.3...graphql-server-test@3.21.0) (2026-08-24)

### Bug Fixes

- **graphql-server:** surface csrf errors as json ([4db3124](https://github.com/constructive-io/constructive/commit/4db3124dd737b04d2c406dee6b404d6fbdd8fee4))

## [3.20.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.20.2...graphql-server-test@3.20.3) (2026-08-19)

### Bug Fixes

- **uploads:** default an unregistered upload column by plane shape, not scope name ([1e32120](https://github.com/constructive-io/constructive/commit/1e32120e423d0893fd73e5fc4bbfec66d95dd9f0))

## [3.20.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.20.1...graphql-server-test@3.20.2) (2026-08-19)

**Note:** Version bump only for package graphql-server-test

## [3.20.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.20.0...graphql-server-test@3.20.1) (2026-08-18)

### Bug Fixes

- **uploads:** accept underscore-led keys, bound bucket names, dedup only live objects ([d10c9c3](https://github.com/constructive-io/constructive/commit/d10c9c3e68c376c8c197bf5f4b0c6f7af633f561))

# [3.20.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.19.3...graphql-server-test@3.20.0) (2026-08-18)

**Note:** Version bump only for package graphql-server-test

## [3.19.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.19.2...graphql-server-test@3.19.3) (2026-08-15)

**Note:** Version bump only for package graphql-server-test

## [3.19.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.19.1...graphql-server-test@3.19.2) (2026-08-15)

**Note:** Version bump only for package graphql-server-test

## [3.19.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.19.0...graphql-server-test@3.19.1) (2026-08-15)

**Note:** Version bump only for package graphql-server-test

# [3.19.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.18.0...graphql-server-test@3.19.0) (2026-08-14)

**Note:** Version bump only for package graphql-server-test

# [3.18.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.10...graphql-server-test@3.18.0) (2026-08-14)

### Features

- **coerce:** add domain coercers and route 12factor-env's validators through them ([b95329c](https://github.com/constructive-io/constructive/commit/b95329cea8d659bfa2672d30da2d71d251aa7c9b))

## [3.17.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.9...graphql-server-test@3.17.10) (2026-08-13)

**Note:** Version bump only for package graphql-server-test

## [3.17.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.8...graphql-server-test@3.17.9) (2026-08-13)

**Note:** Version bump only for package graphql-server-test

## [3.17.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.7...graphql-server-test@3.17.8) (2026-08-13)

### Bug Fixes

- **graphql-server:** attach the notify client's error handler before the LISTEN ([7de64ae](https://github.com/constructive-io/constructive/commit/7de64ae4e50df894d1d6df5bf4f4a63a1fce13e6))

## [3.17.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.6...graphql-server-test@3.17.7) (2026-08-10)

**Note:** Version bump only for package graphql-server-test

## [3.17.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.5...graphql-server-test@3.17.6) (2026-08-08)

**Note:** Version bump only for package graphql-server-test

## [3.17.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.4...graphql-server-test@3.17.5) (2026-08-07)

**Note:** Version bump only for package graphql-server-test

## [3.17.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.3...graphql-server-test@3.17.4) (2026-08-07)

**Note:** Version bump only for package graphql-server-test

## [3.17.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.2...graphql-server-test@3.17.3) (2026-08-06)

**Note:** Version bump only for package graphql-server-test

## [3.17.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.1...graphql-server-test@3.17.2) (2026-08-06)

**Note:** Version bump only for package graphql-server-test

## [3.17.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.17.0...graphql-server-test@3.17.1) (2026-08-05)

**Note:** Version bump only for package graphql-server-test

# [3.17.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.16.2...graphql-server-test@3.17.0) (2026-08-04)

### Features

- **cli:** one shared Constructive login store ([20cb70d](https://github.com/constructive-io/constructive/commit/20cb70ded9bc03f69613e8b5bcd0cb2174c03373))

## [3.16.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.16.1...graphql-server-test@3.16.2) (2026-08-03)

**Note:** Version bump only for package graphql-server-test

## [3.16.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.16.0...graphql-server-test@3.16.1) (2026-08-03)

**Note:** Version bump only for package graphql-server-test

# [3.16.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.15.1...graphql-server-test@3.16.0) (2026-08-02)

**Note:** Version bump only for package graphql-server-test

## [3.15.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.15.0...graphql-server-test@3.15.1) (2026-08-02)

**Note:** Version bump only for package graphql-server-test

# [3.15.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.14.0...graphql-server-test@3.15.0) (2026-08-01)

### Features

- **storage:** make bucket provisioning lazy by default (autoProvision: false) ([bf88496](https://github.com/constructive-io/constructive/commit/bf8849651a31b3031082f56981e9ed7038fe02b3))
- **storage:** tenant-aware eager bucket provisioning ([2f00655](https://github.com/constructive-io/constructive/commit/2f0065515206c3ed69debfdf105f8bf84d1237c0))

# [3.14.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.9...graphql-server-test@3.14.0) (2026-08-01)

### Features

- persist physical S3 bucket name on the bucket row at provision time ([c1ac393](https://github.com/constructive-io/constructive/commit/c1ac3936bc3b2b46bb721afcf778e500e2278862))

## [3.13.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.8...graphql-server-test@3.13.9) (2026-08-01)

**Note:** Version bump only for package graphql-server-test

## [3.13.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.7...graphql-server-test@3.13.8) (2026-08-01)

**Note:** Version bump only for package graphql-server-test

## [3.13.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.6...graphql-server-test@3.13.7) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.13.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.5...graphql-server-test@3.13.6) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.13.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.4...graphql-server-test@3.13.5) (2026-07-31)

### Bug Fixes

- **graphile-meta:** align metadata with final schema ([78b73eb](https://github.com/constructive-io/constructive/commit/78b73eb541ae0f4389bfb14619848dcebd9c78bf))

## [3.13.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.3...graphql-server-test@3.13.4) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.13.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.2...graphql-server-test@3.13.3) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.13.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.1...graphql-server-test@3.13.2) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.13.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.13.0...graphql-server-test@3.13.1) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

# [3.13.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.9...graphql-server-test@3.13.0) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.12.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.8...graphql-server-test@3.12.9) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.12.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.7...graphql-server-test@3.12.8) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.12.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.6...graphql-server-test@3.12.7) (2026-07-31)

**Note:** Version bump only for package graphql-server-test

## [3.12.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.5...graphql-server-test@3.12.6) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

## [3.12.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.4...graphql-server-test@3.12.5) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

## [3.12.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.3...graphql-server-test@3.12.4) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

## [3.12.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.2...graphql-server-test@3.12.3) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

## [3.12.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.1...graphql-server-test@3.12.2) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

## [3.12.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.12.0...graphql-server-test@3.12.1) (2026-07-30)

**Note:** Version bump only for package graphql-server-test

# [3.12.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.11.0...graphql-server-test@3.12.0) (2026-07-29)

**Note:** Version bump only for package graphql-server-test

# [3.11.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.10.1...graphql-server-test@3.11.0) (2026-07-29)

**Note:** Version bump only for package graphql-server-test

## [3.10.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.10.0...graphql-server-test@3.10.1) (2026-07-29)

**Note:** Version bump only for package graphql-server-test

# [3.10.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.9.0...graphql-server-test@3.10.0) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

# [3.9.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.7...graphql-server-test@3.9.0) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.6...graphql-server-test@3.8.7) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.5...graphql-server-test@3.8.6) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.4...graphql-server-test@3.8.5) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.3...graphql-server-test@3.8.4) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.2...graphql-server-test@3.8.3) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.1...graphql-server-test@3.8.2) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

## [3.8.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.8.0...graphql-server-test@3.8.1) (2026-07-28)

**Note:** Version bump only for package graphql-server-test

# [3.8.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.7.0...graphql-server-test@3.8.0) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

# [3.7.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.6.0...graphql-server-test@3.7.0) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

# [3.6.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.5.2...graphql-server-test@3.6.0) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

## [3.5.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.5.1...graphql-server-test@3.5.2) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

## [3.5.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.5.0...graphql-server-test@3.5.1) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

# [3.5.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.4.1...graphql-server-test@3.5.0) (2026-07-27)

### Bug Fixes

- **fixtures:** pin schema+grants-only plane packages (routing@4, catalog/apps@3.1, routing-platform@3) ([f2e640c](https://github.com/constructive-io/constructive/commit/f2e640c4bd3d3f0f50f2413e339ee0a975b6dcac))

### Features

- **fixtures:** install logical-name plane packages and drop legacy routing schema overrides ([b3a99ee](https://github.com/constructive-io/constructive/commit/b3a99ee95cb501a582b70612dfc29f3c423fe4dd))

## [3.4.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.4.0...graphql-server-test@3.4.1) (2026-07-27)

**Note:** Version bump only for package graphql-server-test

# [3.4.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.3.3...graphql-server-test@3.4.0) (2026-07-27)

### Features

- **server:** default the scoped routing plane to logical routing_public ([08ef699](https://github.com/constructive-io/constructive/commit/08ef699a1155788e58a840e9a624329ab095fca7))

## [3.3.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.3.2...graphql-server-test@3.3.3) (2026-07-26)

**Note:** Version bump only for package graphql-server-test

## [3.3.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.3.1...graphql-server-test@3.3.2) (2026-07-26)

**Note:** Version bump only for package graphql-server-test

## [3.3.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.3.0...graphql-server-test@3.3.1) (2026-07-26)

**Note:** Version bump only for package graphql-server-test

# [3.3.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.2.0...graphql-server-test@3.3.0) (2026-07-26)

**Note:** Version bump only for package graphql-server-test

# [3.2.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.1.1...graphql-server-test@3.2.0) (2026-07-26)

### Features

- install @constructive-db/routing-functions and drop the copied resolver fixture ([5221149](https://github.com/constructive-io/constructive/commit/522114904ad70014bf01b0793003c6d2ce9acb5c))
- remove default database; require an explicit database id ([31390df](https://github.com/constructive-io/constructive/commit/31390df350a6e5b816f402d19b29e9420bf2def9))
- split single-tenant dev server out of production graphql-server ([0709556](https://github.com/constructive-io/constructive/commit/070955672decec77d8de1919b9b0adb4ec615e5d))

## [3.1.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.1.0...graphql-server-test@3.1.1) (2026-07-26)

**Note:** Version bump only for package graphql-server-test

# [3.1.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.0.4...graphql-server-test@3.1.0) (2026-07-25)

### Features

- **server:** hard-break GraphQL runtime off services_public onto scoped routing plane ([d3059ef](https://github.com/constructive-io/constructive/commit/d3059efecb32fc128da04059688bd48ad24b74a5))

## [3.0.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.0.3...graphql-server-test@3.0.4) (2026-07-23)

**Note:** Version bump only for package graphql-server-test

## [3.0.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.0.2...graphql-server-test@3.0.3) (2026-07-23)

**Note:** Version bump only for package graphql-server-test

## [3.0.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.0.1...graphql-server-test@3.0.2) (2026-07-23)

**Note:** Version bump only for package graphql-server-test

## [3.0.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@3.0.0...graphql-server-test@3.0.1) (2026-07-22)

**Note:** Version bump only for package graphql-server-test

# [3.0.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.36.3...graphql-server-test@3.0.0) (2026-07-21)

**Note:** Version bump only for package graphql-server-test

## [2.36.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.36.2...graphql-server-test@2.36.3) (2026-07-21)

**Note:** Version bump only for package graphql-server-test

## [2.36.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.36.1...graphql-server-test@2.36.2) (2026-07-20)

**Note:** Version bump only for package graphql-server-test

## [2.36.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.36.0...graphql-server-test@2.36.1) (2026-07-20)

**Note:** Version bump only for package graphql-server-test

# [2.36.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.35.2...graphql-server-test@2.36.0) (2026-07-20)

### Features

- **meta:** add scalar encoding contracts to \_meta field types ([987aa87](https://github.com/constructive-io/constructive/commit/987aa8783166e8e8bf6afa61ae6f2164321e13b7))

## [2.35.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.35.1...graphql-server-test@2.35.2) (2026-07-18)

**Note:** Version bump only for package graphql-server-test

## [2.35.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.35.0...graphql-server-test@2.35.1) (2026-07-18)

**Note:** Version bump only for package graphql-server-test

# [2.35.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.34.0...graphql-server-test@2.35.0) (2026-07-18)

### Bug Fixes

- **fixtures:** remove anonymous grants shim; scope anonymous grants to the storage test scenario ([0190a8c](https://github.com/constructive-io/constructive/commit/0190a8c2652e134f6296d4704638c1427beb3729))
- **presigned-url:** resolve storage module config without the request role ([3996de5](https://github.com/constructive-io/constructive/commit/3996de5b083374d8beea9915b50608200aa3c2d5))

### Features

- **pgpm:** workspace-level install + ephemeral pgpm fixtures workspace ([b245b11](https://github.com/constructive-io/constructive/commit/b245b11ecc47710b832232189e1e6cfc9803f3cb))

# [2.34.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.33.3...graphql-server-test@2.34.0) (2026-07-18)

**Note:** Version bump only for package graphql-server-test

## [2.33.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.33.2...graphql-server-test@2.33.3) (2026-07-17)

**Note:** Version bump only for package graphql-server-test

## [2.33.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.33.1...graphql-server-test@2.33.2) (2026-07-17)

**Note:** Version bump only for package graphql-server-test

## [2.33.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.33.0...graphql-server-test@2.33.1) (2026-07-15)

**Note:** Version bump only for package graphql-server-test

# [2.33.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.32.1...graphql-server-test@2.33.0) (2026-07-14)

**Note:** Version bump only for package graphql-server-test

## [2.32.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.32.0...graphql-server-test@2.32.1) (2026-07-14)

**Note:** Version bump only for package graphql-server-test

# [2.32.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.31.1...graphql-server-test@2.32.0) (2026-07-13)

### Features

- inject jwt.claims.api_id provenance claim and add REST /fn routes ([0aa60ee](https://github.com/constructive-io/constructive/commit/0aa60ee7ccf2066a419301e1ec553119cde61bfb)), closes [constructive-io/constructive-planning#1149](https://github.com/constructive-io/constructive-planning/issues/1149)

## [2.31.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.31.0...graphql-server-test@2.31.1) (2026-07-13)

**Note:** Version bump only for package graphql-server-test

# [2.31.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.9...graphql-server-test@2.31.0) (2026-07-12)

**Note:** Version bump only for package graphql-server-test

## [2.30.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.8...graphql-server-test@2.30.9) (2026-07-12)

**Note:** Version bump only for package graphql-server-test

## [2.30.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.7...graphql-server-test@2.30.8) (2026-07-12)

**Note:** Version bump only for package graphql-server-test

## [2.30.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.6...graphql-server-test@2.30.7) (2026-07-11)

**Note:** Version bump only for package graphql-server-test

## [2.30.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.5...graphql-server-test@2.30.6) (2026-07-11)

**Note:** Version bump only for package graphql-server-test

## [2.30.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.4...graphql-server-test@2.30.5) (2026-07-10)

**Note:** Version bump only for package graphql-server-test

## [2.30.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.3...graphql-server-test@2.30.4) (2026-07-10)

**Note:** Version bump only for package graphql-server-test

## [2.30.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.2...graphql-server-test@2.30.3) (2026-07-08)

**Note:** Version bump only for package graphql-server-test

## [2.30.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.1...graphql-server-test@2.30.2) (2026-07-05)

**Note:** Version bump only for package graphql-server-test

## [2.30.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.30.0...graphql-server-test@2.30.1) (2026-06-28)

**Note:** Version bump only for package graphql-server-test

# [2.30.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.29.0...graphql-server-test@2.30.0) (2026-06-28)

**Note:** Version bump only for package graphql-server-test

# [2.29.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.28.0...graphql-server-test@2.29.0) (2026-06-28)

**Note:** Version bump only for package graphql-server-test

# [2.28.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.27.0...graphql-server-test@2.28.0) (2026-06-27)

**Note:** Version bump only for package graphql-server-test

# [2.27.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.26.3...graphql-server-test@2.27.0) (2026-06-27)

**Note:** Version bump only for package graphql-server-test

## [2.26.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.26.2...graphql-server-test@2.26.3) (2026-06-23)

**Note:** Version bump only for package graphql-server-test

## [2.26.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.26.1...graphql-server-test@2.26.2) (2026-06-22)

**Note:** Version bump only for package graphql-server-test

## [2.26.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.26.0...graphql-server-test@2.26.1) (2026-06-18)

**Note:** Version bump only for package graphql-server-test

# [2.26.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.14...graphql-server-test@2.26.0) (2026-06-17)

### Bug Fixes

- reorder MetaEnum type after MetaType in introspection snapshots ([7dc2afe](https://github.com/constructive-io/constructive/commit/7dc2afea6794ee96792995042daee6497e40994b))
- update introspection and schema snapshots for new meta types ([db76434](https://github.com/constructive-io/constructive/commit/db764344dd7891f5bd2a97f3ce12582ab5a6a556))

### Features

- **meta-schema:** expose enum metadata in \_meta field-level introspection ([06137fc](https://github.com/constructive-io/constructive/commit/06137fc18db4291dffb47d42513ed553e955e347))
- **meta-schema:** expose i18n and realtime metadata in \_meta query ([8b6b459](https://github.com/constructive-io/constructive/commit/8b6b459236611524b9e8be20f6fd51930fcfb508))

## [2.25.14](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.13...graphql-server-test@2.25.14) (2026-06-14)

**Note:** Version bump only for package graphql-server-test

## [2.25.13](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.12...graphql-server-test@2.25.13) (2026-06-14)

**Note:** Version bump only for package graphql-server-test

## [2.25.12](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.11...graphql-server-test@2.25.12) (2026-06-14)

**Note:** Version bump only for package graphql-server-test

## [2.25.11](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.10...graphql-server-test@2.25.11) (2026-06-14)

**Note:** Version bump only for package graphql-server-test

## [2.25.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.9...graphql-server-test@2.25.10) (2026-06-12)

**Note:** Version bump only for package graphql-server-test

## [2.25.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.8...graphql-server-test@2.25.9) (2026-06-11)

**Note:** Version bump only for package graphql-server-test

## [2.25.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.7...graphql-server-test@2.25.8) (2026-06-07)

**Note:** Version bump only for package graphql-server-test

## [2.25.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.6...graphql-server-test@2.25.7) (2026-06-06)

**Note:** Version bump only for package graphql-server-test

## [2.25.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.5...graphql-server-test@2.25.6) (2026-06-06)

**Note:** Version bump only for package graphql-server-test

## [2.25.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.4...graphql-server-test@2.25.5) (2026-06-05)

**Note:** Version bump only for package graphql-server-test

## [2.25.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.3...graphql-server-test@2.25.4) (2026-06-01)

**Note:** Version bump only for package graphql-server-test

## [2.25.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.2...graphql-server-test@2.25.3) (2026-06-01)

**Note:** Version bump only for package graphql-server-test

## [2.25.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.1...graphql-server-test@2.25.2) (2026-05-31)

**Note:** Version bump only for package graphql-server-test

## [2.25.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.25.0...graphql-server-test@2.25.1) (2026-05-31)

**Note:** Version bump only for package graphql-server-test

# [2.25.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.24.4...graphql-server-test@2.25.0) (2026-05-30)

### Bug Fixes

- add scope/prefix columns to storage_module test fixture ([5afb93f](https://github.com/constructive-io/constructive/commit/5afb93f6756a9dd181c4945b37697dd463f64f66))

## [2.24.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.24.3...graphql-server-test@2.24.4) (2026-05-29)

**Note:** Version bump only for package graphql-server-test

## [2.24.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.24.2...graphql-server-test@2.24.3) (2026-05-29)

**Note:** Version bump only for package graphql-server-test

## [2.24.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.24.1...graphql-server-test@2.24.2) (2026-05-24)

**Note:** Version bump only for package graphql-server-test

## [2.24.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.24.0...graphql-server-test@2.24.1) (2026-05-23)

**Note:** Version bump only for package graphql-server-test

# [2.24.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.23.0...graphql-server-test@2.24.0) (2026-05-23)

**Note:** Version bump only for package graphql-server-test

# [2.23.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.6...graphql-server-test@2.23.0) (2026-05-21)

### Features

- use real embedding token counts from @agentic-kit/ollama@2.0.0 ([1e84f7f](https://github.com/constructive-io/constructive/commit/1e84f7f8d5ea4440174aefb565ddc385e0f7285f))

## [2.22.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.5...graphql-server-test@2.22.6) (2026-05-21)

**Note:** Version bump only for package graphql-server-test

## [2.22.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.4...graphql-server-test@2.22.5) (2026-05-20)

**Note:** Version bump only for package graphql-server-test

## [2.22.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.3...graphql-server-test@2.22.4) (2026-05-19)

**Note:** Version bump only for package graphql-server-test

## [2.22.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.2...graphql-server-test@2.22.3) (2026-05-17)

**Note:** Version bump only for package graphql-server-test

## [2.22.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.1...graphql-server-test@2.22.2) (2026-05-15)

**Note:** Version bump only for package graphql-server-test

## [2.22.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.22.0...graphql-server-test@2.22.1) (2026-05-14)

**Note:** Version bump only for package graphql-server-test

# [2.22.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.10...graphql-server-test@2.22.0) (2026-05-14)

**Note:** Version bump only for package graphql-server-test

## [2.21.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.9...graphql-server-test@2.21.10) (2026-05-14)

**Note:** Version bump only for package graphql-server-test

## [2.21.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.8...graphql-server-test@2.21.9) (2026-05-14)

**Note:** Version bump only for package graphql-server-test

## [2.21.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.7...graphql-server-test@2.21.8) (2026-05-13)

**Note:** Version bump only for package graphql-server-test

## [2.21.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.6...graphql-server-test@2.21.7) (2026-05-13)

### Bug Fixes

- **codegen:** findFirst/findOne return single object ([#752](https://github.com/constructive-io/constructive/issues/752)) ([006b869](https://github.com/constructive-io/constructive/commit/006b869ef305dffc568a463789f428c8b0733958))

## [2.21.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.5...graphql-server-test@2.21.6) (2026-05-13)

### Bug Fixes

- add enable_bulk column to server-test seed fixture ([c4f0f2c](https://github.com/constructive-io/constructive/commit/c4f0f2c1476003768ad57bb8e4f3196077de6859))

## [2.21.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.4...graphql-server-test@2.21.5) (2026-05-12)

**Note:** Version bump only for package graphql-server-test

## [2.21.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.3...graphql-server-test@2.21.4) (2026-05-12)

**Note:** Version bump only for package graphql-server-test

## [2.21.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.2...graphql-server-test@2.21.3) (2026-05-11)

**Note:** Version bump only for package graphql-server-test

## [2.21.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.1...graphql-server-test@2.21.2) (2026-05-11)

**Note:** Version bump only for package graphql-server-test

## [2.21.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.21.0...graphql-server-test@2.21.1) (2026-05-11)

### Bug Fixes

- add enable_realtime column to test seed database_settings and api_settings ([def6aa9](https://github.com/constructive-io/constructive/commit/def6aa906ee9022d4cbc74ce60d3f6ec0a3b2b67))
- move async hashContent calls into beforeAll blocks ([2e11ee3](https://github.com/constructive-io/constructive/commit/2e11ee32bb88d20fb00410c712a176c13279e9cf))

# [2.21.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.20.1...graphql-server-test@2.21.0) (2026-05-11)

**Note:** Version bump only for package graphql-server-test

## [2.20.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.20.0...graphql-server-test@2.20.1) (2026-05-10)

**Note:** Version bump only for package graphql-server-test

# [2.20.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.5...graphql-server-test@2.20.0) (2026-05-10)

### Bug Fixes

- correct Alice API is_public, rename allAppFiles to appFiles, pre-seed private file for RLS test ([f93dc1d](https://github.com/constructive-io/constructive/commit/f93dc1de75ed95b02f8b782f1f82e9ca5ba38b67))
- correct mutation variable shapes and expand expectRlsDenied patterns ([3c71d06](https://github.com/constructive-io/constructive/commit/3c71d060665ce5a70715bed3acfed65e5808d433))
- handle masked errors and nested null in expectRlsDenied ([8c0d743](https://github.com/constructive-io/constructive/commit/8c0d743ba3e1ecea8c0817421fcb903eec41c086))
- replace invalid Mallory UUIDs (m is not hex) with valid fa-prefix UUIDs ([13e6b48](https://github.com/constructive-io/constructive/commit/13e6b4843e3bd582dee89c5c580d571434486cbc))
- revert superuser verification to use same HTTP path (addresses connection isolation concern) ([36ad127](https://github.com/constructive-io/constructive/commit/36ad127f85a8dec71db150d1e4274d5afb06740b))

### Features

- add Alice/Bob RLS + feature flag integration tests ([455ed81](https://github.com/constructive-io/constructive/commit/455ed816baf287a005f33c843bfb65e2aecc046a))
- expand integration tests with Mallory (3rd actor) and comprehensive RLS/attack scenarios ([e10c1cc](https://github.com/constructive-io/constructive/commit/e10c1cc87e490804307afd458c5ec6e0d801bc3c))

## [2.19.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.4...graphql-server-test@2.19.5) (2026-05-10)

**Note:** Version bump only for package graphql-server-test

## [2.19.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.3...graphql-server-test@2.19.4) (2026-05-09)

**Note:** Version bump only for package graphql-server-test

## [2.19.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.2...graphql-server-test@2.19.3) (2026-05-09)

**Note:** Version bump only for package graphql-server-test

## [2.19.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.1...graphql-server-test@2.19.2) (2026-05-09)

**Note:** Version bump only for package graphql-server-test

## [2.19.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.19.0...graphql-server-test@2.19.1) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

# [2.19.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.18.2...graphql-server-test@2.19.0) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

## [2.18.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.18.1...graphql-server-test@2.18.2) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

## [2.18.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.18.0...graphql-server-test@2.18.1) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

# [2.18.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.17.3...graphql-server-test@2.18.0) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

## [2.17.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.17.2...graphql-server-test@2.17.3) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

## [2.17.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.17.1...graphql-server-test@2.17.2) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

## [2.17.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.17.0...graphql-server-test@2.17.1) (2026-05-08)

**Note:** Version bump only for package graphql-server-test

# [2.17.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.16.0...graphql-server-test@2.17.0) (2026-05-07)

### Bug Fixes

- use collection query in upload test, regenerate snapshots ([9d5b071](https://github.com/constructive-io/constructive/commit/9d5b07174e59d8caa0b11992bfaefdbdc18b05e1))
- use where filter in upload test, regenerate snapshots ([ab4a772](https://github.com/constructive-io/constructive/commit/ab4a772a1c7d8b9141a53fdc084c24d9cf28b7b9))

### Features

- per-table storage middleware — upload fields on bucket types, delete middleware on file tables ([5003dc5](https://github.com/constructive-io/constructive/commit/5003dc5d85d21d5042572071b22fad1654f36881))

# [2.16.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.15.4...graphql-server-test@2.16.0) (2026-05-06)

**Note:** Version bump only for package graphql-server-test

## [2.15.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.15.3...graphql-server-test@2.15.4) (2026-05-06)

**Note:** Version bump only for package graphql-server-test

## [2.15.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.15.2...graphql-server-test@2.15.3) (2026-05-05)

### Bug Fixes

- update snapshots and test seeds for allow_custom_keys + content_hash columns ([87385a9](https://github.com/constructive-io/constructive/commit/87385a9be4510e836157c5d8bc7e3b9a096fc192))

## [2.15.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.15.1...graphql-server-test@2.15.2) (2026-05-05)

**Note:** Version bump only for package graphql-server-test

## [2.15.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.15.0...graphql-server-test@2.15.1) (2026-05-05)

**Note:** Version bump only for package graphql-server-test

# [2.15.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.14.1...graphql-server-test@2.15.0) (2026-05-04)

**Note:** Version bump only for package graphql-server-test

## [2.14.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.14.0...graphql-server-test@2.14.1) (2026-05-03)

### Bug Fixes

- update snapshots, tests, and seeds for storage simplification ([9b1a48a](https://github.com/constructive-io/constructive/commit/9b1a48ae65add780c0d005f8912cf70a4d7af078))

# [2.14.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.13.0...graphql-server-test@2.14.0) (2026-04-30)

**Note:** Version bump only for package graphql-server-test

# [2.13.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.12...graphql-server-test@2.13.0) (2026-04-29)

### Bug Fixes

- update server-test schema snapshot with status field ([47cc9b8](https://github.com/constructive-io/constructive/commit/47cc9b8ab7e45294212fc52b061ac6bc124194be))

### Features

- add status field to RequestUploadUrlPayload ([c61b5e9](https://github.com/constructive-io/constructive/commit/c61b5e9eef9a4e2f86ab859bd7f599f4abf8264d))

## [2.12.12](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.11...graphql-server-test@2.12.12) (2026-04-28)

**Note:** Version bump only for package graphql-server-test

## [2.12.11](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.10...graphql-server-test@2.12.11) (2026-04-27)

**Note:** Version bump only for package graphql-server-test

## [2.12.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.9...graphql-server-test@2.12.10) (2026-04-27)

### Bug Fixes

- add ./cli sub-path export to graphql-codegen and update imports ([0973c54](https://github.com/constructive-io/constructive/commit/0973c54331809ff848372f50b1210791e799906e))
- add graphql-query as devDependency of server-test for runtime sub-path resolution ([7993fb7](https://github.com/constructive-io/constructive/commit/7993fb758d4a5856f3fb41948ee867ef34c0ce00))
- add graphql-query to cli-e2e NODE_PATH for runtime sub-path resolution ([d4e917d](https://github.com/constructive-io/constructive/commit/d4e917d6777f18deba6c15eed9977ff3ab30dd82))
- remove exports map anti-pattern, use deep path imports per Constructive standard ([8b62982](https://github.com/constructive-io/constructive/commit/8b629820d641f20c5c90a2ad79f77ff84c3c15b1))

## [2.12.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.8...graphql-server-test@2.12.9) (2026-04-20)

**Note:** Version bump only for package graphql-server-test

## [2.12.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.7...graphql-server-test@2.12.8) (2026-04-20)

**Note:** Version bump only for package graphql-server-test

## [2.12.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.6...graphql-server-test@2.12.7) (2026-04-20)

**Note:** Version bump only for package graphql-server-test

## [2.12.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.5...graphql-server-test@2.12.6) (2026-04-19)

### Bug Fixes

- remove non-existent 'size' column from upload_requests INSERT ([da7d796](https://github.com/constructive-io/constructive/commit/da7d796be36a054864dc5bfa78c19f1c96e62dc2))

## [2.12.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.4...graphql-server-test@2.12.5) (2026-04-19)

### Bug Fixes

- update test fixture files table to use mime_type (no content_hash) ([7c1abf9](https://github.com/constructive-io/constructive/commit/7c1abf9293115589b381cc875c461bd1b92d630c))

## [2.12.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.3...graphql-server-test@2.12.4) (2026-04-19)

### Bug Fixes

- add membership_type column to test fixture storage_module table ([f3bd2fc](https://github.com/constructive-io/constructive/commit/f3bd2fc89b13faf511e807d4e1d93b80109661ca))
- correct snapshot UUID position and ProvisionBucketInput description ([37b5856](https://github.com/constructive-io/constructive/commit/37b5856e2a3a6661c51210960a4949158fc7710e))
- update introspection snapshots for ownerId field additions ([da81af9](https://github.com/constructive-io/constructive/commit/da81af952bd417d1022ee08e2051bc4943e28d92))

## [2.12.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.2...graphql-server-test@2.12.3) (2026-04-18)

**Note:** Version bump only for package graphql-server-test

## [2.12.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.1...graphql-server-test@2.12.2) (2026-04-18)

**Note:** Version bump only for package graphql-server-test

## [2.12.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.12.0...graphql-server-test@2.12.1) (2026-04-18)

**Note:** Version bump only for package graphql-server-test

# [2.12.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.11.4...graphql-server-test@2.12.0) (2026-04-18)

**Note:** Version bump only for package graphql-server-test

## [2.11.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.11.3...graphql-server-test@2.11.4) (2026-04-16)

**Note:** Version bump only for package graphql-server-test

## [2.11.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.11.2...graphql-server-test@2.11.3) (2026-04-14)

**Note:** Version bump only for package graphql-server-test

## [2.11.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.11.1...graphql-server-test@2.11.2) (2026-04-11)

**Note:** Version bump only for package graphql-server-test

## [2.11.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.11.0...graphql-server-test@2.11.1) (2026-04-10)

**Note:** Version bump only for package graphql-server-test

# [2.11.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.12...graphql-server-test@2.11.0) (2026-04-09)

**Note:** Version bump only for package graphql-server-test

## [2.10.12](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.11...graphql-server-test@2.10.12) (2026-04-04)

**Note:** Version bump only for package graphql-server-test

## [2.10.11](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.10...graphql-server-test@2.10.11) (2026-04-03)

**Note:** Version bump only for package graphql-server-test

## [2.10.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.9...graphql-server-test@2.10.10) (2026-04-02)

**Note:** Version bump only for package graphql-server-test

## [2.10.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.8...graphql-server-test@2.10.9) (2026-04-02)

**Note:** Version bump only for package graphql-server-test

## [2.10.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.7...graphql-server-test@2.10.8) (2026-04-02)

**Note:** Version bump only for package graphql-server-test

## [2.10.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.6...graphql-server-test@2.10.7) (2026-04-01)

**Note:** Version bump only for package graphql-server-test

## [2.10.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.5...graphql-server-test@2.10.6) (2026-03-31)

**Note:** Version bump only for package graphql-server-test

## [2.10.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.4...graphql-server-test@2.10.5) (2026-03-31)

**Note:** Version bump only for package graphql-server-test

## [2.10.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.3...graphql-server-test@2.10.4) (2026-03-31)

**Note:** Version bump only for package graphql-server-test

## [2.10.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.2...graphql-server-test@2.10.3) (2026-03-30)

**Note:** Version bump only for package graphql-server-test

## [2.10.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.1...graphql-server-test@2.10.2) (2026-03-30)

**Note:** Version bump only for package graphql-server-test

## [2.10.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.10.0...graphql-server-test@2.10.1) (2026-03-30)

**Note:** Version bump only for package graphql-server-test

# [2.10.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.7...graphql-server-test@2.10.0) (2026-03-28)

### Bug Fixes

- address PR feedback — type Table, clean imports, use APPSTASH_BASE_DIR, bump appstash 0.7.0 ([41c629a](https://github.com/constructive-io/constructive/commit/41c629a0bfd1bb327afc9f82673f08bb9da257e0))
- **server-test:** fix pgvector and \_meta test failures in CLI e2e ([62ac909](https://github.com/constructive-io/constructive/commit/62ac90905c7059c22108306ce6b024659f56fb07))
- **server-test:** pgvector test checks ok:false instead of rejection ([a4ea714](https://github.com/constructive-io/constructive/commit/a4ea7145959d4ded4a5680ba8a82d1053c93e2e8))

### Features

- **codegen:** pluggable embedding system with --auto-embed flag ([4665bb8](https://github.com/constructive-io/constructive/commit/4665bb879046074d86c8130096746562233809ee))

## [2.9.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.6...graphql-server-test@2.9.7) (2026-03-27)

**Note:** Version bump only for package graphql-server-test

## [2.9.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.5...graphql-server-test@2.9.6) (2026-03-27)

**Note:** Version bump only for package graphql-server-test

## [2.9.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.4...graphql-server-test@2.9.5) (2026-03-27)

**Note:** Version bump only for package graphql-server-test

## [2.9.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.3...graphql-server-test@2.9.4) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.9.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.2...graphql-server-test@2.9.3) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.9.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.1...graphql-server-test@2.9.2) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.9.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.9.0...graphql-server-test@2.9.1) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

# [2.9.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.6...graphql-server-test@2.9.0) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.8.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.5...graphql-server-test@2.8.6) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.8.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.4...graphql-server-test@2.8.5) (2026-03-26)

**Note:** Version bump only for package graphql-server-test

## [2.8.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.3...graphql-server-test@2.8.4) (2026-03-25)

**Note:** Version bump only for package graphql-server-test

## [2.8.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.2...graphql-server-test@2.8.3) (2026-03-25)

**Note:** Version bump only for package graphql-server-test

## [2.8.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.1...graphql-server-test@2.8.2) (2026-03-25)

**Note:** Version bump only for package graphql-server-test

## [2.8.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.8.0...graphql-server-test@2.8.1) (2026-03-24)

**Note:** Version bump only for package graphql-server-test

# [2.8.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.7.2...graphql-server-test@2.8.0) (2026-03-24)

**Note:** Version bump only for package graphql-server-test

## [2.7.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.7.1...graphql-server-test@2.7.2) (2026-03-21)

**Note:** Version bump only for package graphql-server-test

## [2.7.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.7.0...graphql-server-test@2.7.1) (2026-03-21)

**Note:** Version bump only for package graphql-server-test

# [2.7.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.10...graphql-server-test@2.7.0) (2026-03-20)

**Note:** Version bump only for package graphql-server-test

## [2.6.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.9...graphql-server-test@2.6.10) (2026-03-20)

**Note:** Version bump only for package graphql-server-test

## [2.6.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.8...graphql-server-test@2.6.9) (2026-03-20)

**Note:** Version bump only for package graphql-server-test

## [2.6.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.7...graphql-server-test@2.6.8) (2026-03-20)

**Note:** Version bump only for package graphql-server-test

## [2.6.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.6...graphql-server-test@2.6.7) (2026-03-19)

**Note:** Version bump only for package graphql-server-test

## [2.6.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.5...graphql-server-test@2.6.6) (2026-03-17)

**Note:** Version bump only for package graphql-server-test

## [2.6.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.4...graphql-server-test@2.6.5) (2026-03-17)

### Bug Fixes

- correct typo in server-test snapshot (extra period) ([0b77a70](https://github.com/constructive-io/constructive/commit/0b77a70843939388a3d5e526891c3e4179dd267b))
- remove TrgmSearchInput type from snapshots (no longer registered without intentional search) ([63e5593](https://github.com/constructive-io/constructive/commit/63e5593e03a3fd9df0431a70d0ea48c6ec188a1c))
- update snapshots to reflect trgm operators removed from StringFilter ([f08a328](https://github.com/constructive-io/constructive/commit/f08a328bf4c3d0e0a59ac9253d1ecb9f7772a355))
- use unicode smart quotes in BooleanFilter snapshot description ([f47c0c5](https://github.com/constructive-io/constructive/commit/f47c0c5399b4b3cb7f6d98be01c90ff47a4f229c))

## [2.6.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.3...graphql-server-test@2.6.4) (2026-03-16)

**Note:** Version bump only for package graphql-server-test

## [2.6.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.2...graphql-server-test@2.6.3) (2026-03-15)

**Note:** Version bump only for package graphql-server-test

## [2.6.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.1...graphql-server-test@2.6.2) (2026-03-15)

**Note:** Version bump only for package graphql-server-test

## [2.6.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.6.0...graphql-server-test@2.6.1) (2026-03-15)

**Note:** Version bump only for package graphql-server-test

# [2.6.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.5.4...graphql-server-test@2.6.0) (2026-03-14)

### Bug Fixes

- add missing blank line between UsersEdge and UserOrderBy in snapshot ([48c8332](https://github.com/constructive-io/constructive/commit/48c8332423e3a91976fc9aecb60053f887108c7b))
- add missing TagOrderBy enums to server-test snapshot ([1056255](https://github.com/constructive-io/constructive/commit/105625574982326c2098062dec4feb88fda8e038))
- allow empty filter objects in pgvector test, add relation filter types to schema snapshot ([8191c00](https://github.com/constructive-io/constructive/commit/8191c00846d1641d984d37514b46841a6755ce51))
- correct schema snapshot with relation filter types, smart quotes, and proper type ordering ([11f8873](https://github.com/constructive-io/constructive/commit/11f887330f975213d5e9d8f096813ef904197bdc))
- delete snapshot to let Jest regenerate with correct relation filter types ([e6bc127](https://github.com/constructive-io/constructive/commit/e6bc1272b480144ef5b472e3848ea73882426252))
- migrate remaining condition queries to filter, register filterBy behavior for pgCodecRelation, update schema snapshot with relation filter types ([5207254](https://github.com/constructive-io/constructive/commit/5207254ad96ec30100e93f6268137eaede1e4387))
- provide correct snapshot content for CI (no condition fields) ([eb9e5b8](https://github.com/constructive-io/constructive/commit/eb9e5b83954a79194e27f49bd1e612402d0251d4))
- update schema snapshot for {column}TrgmSimilarity naming convention ([a21fe61](https://github.com/constructive-io/constructive/commit/a21fe61a6a7896e011cad557211b33c53557b73f))
- update schema snapshots for pg_trgm plugin additions ([df3d6ce](https://github.com/constructive-io/constructive/commit/df3d6ceaee6a551fe7a3966f5f477ec18f28cc4d))
- update SIMILARITY_EMAIL orderBy enums in schema snapshot ([6789edd](https://github.com/constructive-io/constructive/commit/6789edd1ee793f3b26703ca9520dee02f0045081))
- update snapshots and test assertions for filter→where argument rename ([c3b4990](https://github.com/constructive-io/constructive/commit/c3b4990a02e7462e0421ca8635f6cfcd1e350670))
- update snapshots for unified search consolidation ([82d92a8](https://github.com/constructive-io/constructive/commit/82d92a86fa07bf25fad1e7363171dc0230594b82))
- update test references for unified search consolidation ([8fc3314](https://github.com/constructive-io/constructive/commit/8fc33147a5e803e366c4b3a513ea31918d072733))
- update tests and snapshots for condition deprecation ([10ed4c4](https://github.com/constructive-io/constructive/commit/10ed4c485e01cf7e8e964498b996494ea4345dcf))
- update tsvector filter test and server-test snapshot for new naming convention ([f9cd669](https://github.com/constructive-io/constructive/commit/f9cd669e27a0fe4baa08463725ad6773d514cf9b))

### Features

- rename filter argument to where (configurable via connectionFilterArgumentName) ([10b4fc6](https://github.com/constructive-io/constructive/commit/10b4fc6360774cd79fa936d442dfef4fa9e5f252))

## [2.5.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.5.3...graphql-server-test@2.5.4) (2026-03-13)

**Note:** Version bump only for package graphql-server-test

## [2.5.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.5.2...graphql-server-test@2.5.3) (2026-03-13)

**Note:** Version bump only for package graphql-server-test

## [2.5.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.5.1...graphql-server-test@2.5.2) (2026-03-12)

**Note:** Version bump only for package graphql-server-test

## [2.5.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.4.0...graphql-server-test@2.5.1) (2026-03-12)

**Note:** Version bump only for package graphql-server-test

# [2.5.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.4.0...graphql-server-test@2.5.0) (2026-03-12)

**Note:** Version bump only for package graphql-server-test

# [2.4.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.5...graphql-server-test@2.4.0) (2026-03-12)

**Note:** Version bump only for package graphql-server-test

## [2.3.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.4...graphql-server-test@2.3.5) (2026-03-12)

**Note:** Version bump only for package graphql-server-test

## [2.3.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.3...graphql-server-test@2.3.4) (2026-03-04)

**Note:** Version bump only for package graphql-server-test

## [2.3.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.2...graphql-server-test@2.3.3) (2026-03-04)

**Note:** Version bump only for package graphql-server-test

## [2.3.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.1...graphql-server-test@2.3.2) (2026-03-04)

**Note:** Version bump only for package graphql-server-test

## [2.3.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.3.0...graphql-server-test@2.3.1) (2026-03-03)

**Note:** Version bump only for package graphql-server-test

# [2.3.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.5...graphql-server-test@2.3.0) (2026-03-01)

**Note:** Version bump only for package graphql-server-test

## [2.2.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.4...graphql-server-test@2.2.5) (2026-03-01)

**Note:** Version bump only for package graphql-server-test

## [2.2.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.3...graphql-server-test@2.2.4) (2026-02-28)

**Note:** Version bump only for package graphql-server-test

## [2.2.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.2...graphql-server-test@2.2.3) (2026-02-28)

**Note:** Version bump only for package graphql-server-test

## [2.2.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.1...graphql-server-test@2.2.2) (2026-02-26)

**Note:** Version bump only for package graphql-server-test

## [2.2.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.2.0...graphql-server-test@2.2.1) (2026-02-25)

**Note:** Version bump only for package graphql-server-test

# [2.2.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.1.2...graphql-server-test@2.2.0) (2026-02-24)

**Note:** Version bump only for package graphql-server-test

## [2.1.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.1.1...graphql-server-test@2.1.2) (2026-02-24)

**Note:** Version bump only for package graphql-server-test

## [2.1.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.1.0...graphql-server-test@2.1.1) (2026-02-19)

**Note:** Version bump only for package graphql-server-test

# [2.1.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.0.1...graphql-server-test@2.1.0) (2026-02-19)

**Note:** Version bump only for package graphql-server-test

## [2.0.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@2.0.0...graphql-server-test@2.0.1) (2026-02-15)

**Note:** Version bump only for package graphql-server-test

# [2.0.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.1.1...graphql-server-test@2.0.0) (2026-02-13)

**Note:** Version bump only for package graphql-server-test

## [1.1.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.1.0...graphql-server-test@1.1.1) (2026-02-13)

**Note:** Version bump only for package graphql-server-test

# [1.1.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.5...graphql-server-test@1.1.0) (2026-02-09)

**Note:** Version bump only for package graphql-server-test

## [1.0.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.4...graphql-server-test@1.0.5) (2026-01-28)

**Note:** Version bump only for package graphql-server-test

## [1.0.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.3...graphql-server-test@1.0.4) (2026-01-27)

**Note:** Version bump only for package graphql-server-test

## [1.0.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.2...graphql-server-test@1.0.3) (2026-01-25)

**Note:** Version bump only for package graphql-server-test

## [1.0.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.1...graphql-server-test@1.0.2) (2026-01-24)

**Note:** Version bump only for package graphql-server-test

## [1.0.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@1.0.0...graphql-server-test@1.0.1) (2026-01-24)

**Note:** Version bump only for package graphql-server-test

# [1.0.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.10...graphql-server-test@1.0.0) (2026-01-24)

**Note:** Version bump only for package graphql-server-test

## [0.4.10](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.9...graphql-server-test@0.4.10) (2026-01-22)

**Note:** Version bump only for package graphql-server-test

## [0.4.9](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.8...graphql-server-test@0.4.9) (2026-01-22)

**Note:** Version bump only for package graphql-server-test

## [0.4.8](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.7...graphql-server-test@0.4.8) (2026-01-22)

**Note:** Version bump only for package graphql-server-test

## [0.4.7](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.6...graphql-server-test@0.4.7) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

## [0.4.6](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.5...graphql-server-test@0.4.6) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

## [0.4.5](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.4...graphql-server-test@0.4.5) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

## [0.4.4](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.3...graphql-server-test@0.4.4) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

## [0.4.3](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.2...graphql-server-test@0.4.3) (2026-01-21)

### Bug Fixes

- **graphql-server-test:** fix IPv6/IPv4 mismatch and update tests ([8aa6a92](https://github.com/constructive-io/constructive/commit/8aa6a923dbbad5f7c8f6ed8fb94369f3af8a6bc6))
- **graphql-server-test:** wait for server to be listening before getting address ([4dff024](https://github.com/constructive-io/constructive/commit/4dff024915662eada8218527936d23be7f6863fb))

## [0.4.2](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.1...graphql-server-test@0.4.2) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

## [0.4.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.4.0...graphql-server-test@0.4.1) (2026-01-21)

### Bug Fixes

- **graphql-server-test:** close caches on server stop to prevent test hanging ([47d961a](https://github.com/constructive-io/constructive/commit/47d961abdeb62703c1b91280a2eaed6150d85af8))

# [0.4.0](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.3.1...graphql-server-test@0.4.0) (2026-01-21)

### Features

- **graphql-server-test:** expose full ApiOptions for server configuration ([44d5fbe](https://github.com/constructive-io/constructive/commit/44d5fbe8d74745cc48dfaeec1eaded163cc29b17))

## [0.3.1](https://github.com/constructive-io/constructive/compare/graphql-server-test@0.3.0...graphql-server-test@0.3.1) (2026-01-21)

**Note:** Version bump only for package graphql-server-test

# 0.3.0 (2026-01-21)

### Features

- **graphql-server-test:** add new GraphQL server testing package with SuperTest ([32ace31](https://github.com/constructive-io/constructive/commit/32ace311ad6577be8fa6d176d2b3dd32ab79a03c))

# 0.2.0 (2026-01-21)

### Features

- **graphql-server-test:** add new GraphQL server testing package with SuperTest ([32ace31](https://github.com/constructive-io/constructive/commit/32ace311ad6577be8fa6d176d2b3dd32ab79a03c))
