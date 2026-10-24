# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.33.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.7...@constructive-io/graphql-server@5.33.0) (2026-10-24)

### Bug Fixes

- **graphql-server:** declare cookie-parser as a runtime dependency ([4d195f0](https://github.com/constructive-io/constructive/commit/4d195f0bdabd38673cb76a708766700e73174b07))

## [5.32.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.6...@constructive-io/graphql-server@5.32.7) (2026-10-23)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.32.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.5...@constructive-io/graphql-server@5.32.6) (2026-10-22)

### Bug Fixes

- **graphql-server:** enforce CSRF on cookie-authenticated /fn and /v1 routes ([5290f78](https://github.com/constructive-io/constructive/commit/5290f78913dfd261b18db001565f0ff574eb9e2d))
- **graphql-server:** skip CSRF only when authenticate uses the Bearer token ([921fe56](https://github.com/constructive-io/constructive/commit/921fe568a9ee5c71f63e2a6c8383183484d41e94))

## [5.32.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.4...@constructive-io/graphql-server@5.32.5) (2026-10-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.32.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.3...@constructive-io/graphql-server@5.32.4) (2026-10-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.32.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.2...@constructive-io/graphql-server@5.32.3) (2026-10-16)

### Bug Fixes

- **graphql-server:** system lane runs as the service login; resolve hosts on tenant routing planes ([ae49734](https://github.com/constructive-io/constructive/commit/ae497343487430bb70b190c5b413b405eed0a0de)), closes [planning#2258](https://github.com/planning/issues/2258) [planning#2259](https://github.com/planning/issues/2259)
- login-side reads via login-only function_resolution readers; one routing schema (routing_public); generated provisioner on the request lane; server tests run as a NOBYPASSRLS login ([937c4fd](https://github.com/constructive-io/constructive/commit/937c4fd1e26b6ad3181d8d8ee3b0605e994d1245))
- no role switch anywhere; request-lane storage/i18n reads via claim-scoped SECURITY DEFINER readers; admin structure serves as the request role ([d41873d](https://github.com/constructive-io/constructive/commit/d41873d040aaecc3eba2ec48d85c7b045167c3a3))
- webauthn verifier lane runs as the service login; seed.sqlfile fails on fixture SQL errors ([d976b26](https://github.com/constructive-io/constructive/commit/d976b2623fdb1c44f293f2c1b026cad14844641c)), closes [constructive-planning#2260](https://github.com/constructive-planning/issues/2260) [constructive-planning#2261](https://github.com/constructive-planning/issues/2261)

## [5.32.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.1...@constructive-io/graphql-server@5.32.2) (2026-10-15)

### Bug Fixes

- **graphql-server:** admit handlers to the cache inside the shared single-flight promise ([4bb81d0](https://github.com/constructive-io/constructive/commit/4bb81d028c1b10e11c87fce7972e6a23f9362d79))
- **graphql-server:** scope handler introspection to API schemas and bound graphile cache by heap ([4460d89](https://github.com/constructive-io/constructive/commit/4460d89ec1d82beeeb95d38046b6613838e5a943))

## [5.32.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.32.0...@constructive-io/graphql-server@5.32.1) (2026-10-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.32.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.31.1...@constructive-io/graphql-server@5.32.0) (2026-10-14)

### Bug Fixes

- **storage:** invalidate schema metadata and allow private download CORS ([770f892](https://github.com/constructive-io/constructive/commit/770f892e5551245b738e3780942cb78aec6d138b))

## [5.31.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.31.0...@constructive-io/graphql-server@5.31.1) (2026-10-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.31.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.30.0...@constructive-io/graphql-server@5.31.0) (2026-10-14)

### Features

- opt in to login RLS bypass through pgpm user provisioning ([c637b77](https://github.com/constructive-io/constructive/commit/c637b77f75659a0fd5ef75ea3434c2fe7012d063))

# [5.30.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.29.2...@constructive-io/graphql-server@5.30.0) (2026-10-14)

### Bug Fixes

- **server:** function-bindings gather read runs as the control role; strict test connects as the login ([21e08ea](https://github.com/constructive-io/constructive/commit/21e08ea6e16780c3221beff5d6899ba81b1947f7))

### Features

- **server:** run every control-plane query as api.controlRole (SET LOCAL ROLE) ([0c06623](https://github.com/constructive-io/constructive/commit/0c06623fd6796c37e19c962fb29e11fe88b733cc))

## [5.29.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.29.1...@constructive-io/graphql-server@5.29.2) (2026-10-14)

### Bug Fixes

- **webauthn:** pass the verified challenge to webauthn_finish_registration ([2278e45](https://github.com/constructive-io/constructive/commit/2278e457fc2160e5914ffee29f6208d024739858))

## [5.29.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.29.0...@constructive-io/graphql-server@5.29.1) (2026-10-13)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.29.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.9...@constructive-io/graphql-server@5.29.0) (2026-10-13)

### Bug Fixes

- **graphql-server:** formatError keeps input values out of request-error messages ([ffd28f4](https://github.com/constructive-io/constructive/commit/ffd28f4dfcde257a2bb76d94799c8b472eb694ba))
- **graphql-server:** never mask errors; same formatting in every environment ([783dfac](https://github.com/constructive-io/constructive/commit/783dfacef5254db8975756ddc243a7f423b6f245))
- **webauthn:** persist a verified registration through the verifier lane ([e8fdba8](https://github.com/constructive-io/constructive/commit/e8fdba80d076fc88287e1cb31f07c1a917d4bd24))

### Features

- **graphql-server:** WebAuthn passkey ceremony as GraphQL mutations ([46c4920](https://github.com/constructive-io/constructive/commit/46c492050a5c406f7ed85f303ccf3400260e2552))
- **storage:** storage coordinates come only from storage_module; STORAGE_* credentials are the only env ([44c4516](https://github.com/constructive-io/constructive/commit/44c4516f347e7021067914f1148ebd87cb2131fb))

## [5.28.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.8...@constructive-io/graphql-server@5.28.9) (2026-10-13)

### Bug Fixes

- **csrf,graphql-server:** one-day CSRF cookie, session-cookie opt-out for native clients, signOut always clears the cookie ([d8d6c9c](https://github.com/constructive-io/constructive/commit/d8d6c9c0c912c96b2aa3aeb9a952807cbd45848c))
- **graphql-server:** only count auth mutations of the operation that executes ([b3a4628](https://github.com/constructive-io/constructive/commit/b3a462853cd210771f8faaebafd86b411631d7b7))

## [5.28.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.7...@constructive-io/graphql-server@5.28.8) (2026-10-13)

### Bug Fixes

- **graphql-server:** answer a malformed input without echoing the values it carried ([77c2c55](https://github.com/constructive-io/constructive/commit/77c2c5525db7bba2b2c522a8a16cf9b8520f2478))

## [5.28.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.6...@constructive-io/graphql-server@5.28.7) (2026-10-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.5...@constructive-io/graphql-server@5.28.6) (2026-10-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.4...@constructive-io/graphql-server@5.28.5) (2026-10-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.3...@constructive-io/graphql-server@5.28.4) (2026-09-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.2...@constructive-io/graphql-server@5.28.3) (2026-09-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.1...@constructive-io/graphql-server@5.28.2) (2026-09-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.28.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.28.0...@constructive-io/graphql-server@5.28.1) (2026-09-17)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.28.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.27.1...@constructive-io/graphql-server@5.28.0) (2026-09-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.27.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.27.0...@constructive-io/graphql-server@5.27.1) (2026-09-17)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.27.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.26.0...@constructive-io/graphql-server@5.27.0) (2026-09-17)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.26.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.25.2...@constructive-io/graphql-server@5.26.0) (2026-09-17)

### Features

- add scoped introspection aligned with Crystal configuration ([66c6bf8](https://github.com/constructive-io/constructive/commit/66c6bf8b7892a0a19169ddf9ae36b157707abef5))

## [5.25.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.25.1...@constructive-io/graphql-server@5.25.2) (2026-09-15)

### Bug Fixes

- **graphql-server:** bound introspection depth with its own fixed ceiling ([8d20e5c](https://github.com/constructive-io/constructive/commit/8d20e5c4f69bea16c5d02e35662a31dfce1a3ece))
- rely on merged CDN defaults ([9296f54](https://github.com/constructive-io/constructive/commit/9296f5435640f65d627615630c4a11b9061b8cc5))

## [5.25.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.25.0...@constructive-io/graphql-server@5.25.1) (2026-09-08)

### Bug Fixes

- **graphql-server:** exempt schema introspection from the depth and cost gate ([6c737cb](https://github.com/constructive-io/constructive/commit/6c737cb68e910ee450ea86e70a2752e69570ccbf))

# [5.25.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.24.0...@constructive-io/graphql-server@5.25.0) (2026-09-08)

### Features

- **graphql:** refuse requests to suspended databases via a standing loader ([ecb3659](https://github.com/constructive-io/constructive/commit/ecb3659a04c52c38e82cb28c1bd955ea8e43d071))

# [5.24.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.23.0...@constructive-io/graphql-server@5.24.0) (2026-09-06)

### Features

- **graphql-server:** record refusals as their error code via events record_error ([c0a1208](https://github.com/constructive-io/constructive/commit/c0a1208e83052dd28c819a15c68b906aac1af32a))

# [5.23.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.22.0...@constructive-io/graphql-server@5.23.0) (2026-09-05)

### Bug Fixes

- **graphql-server:** escape events module identifiers in record_event SQL ([706c4f2](https://github.com/constructive-io/constructive/commit/706c4f2eb742282a7320b4511bc6d1d1f5f41470))

### Features

- **graphql-server:** record principal.widening_refused after PRINCIPAL_CHILD_WIDENS ([37a6476](https://github.com/constructive-io/constructive/commit/37a64763a01485677fb89dc7de77b1c0473f87fc))

# [5.22.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.21.0...@constructive-io/graphql-server@5.22.0) (2026-09-04)

### Bug Fixes

- **graphql-server:** make introspection role opt-in, keep original error on rollback failure ([ce9c06e](https://github.com/constructive-io/constructive/commit/ce9c06e50bae85e72d9521160c60732bbdcbf2c0))

### Features

- **auth:** agent-auth error codes + intent/session-lineage claims ([2f53a6b](https://github.com/constructive-io/constructive/commit/2f53a6bf0083a59a69fe28cced0f8f3e3babbade)), closes [#3668](https://github.com/constructive-io/constructive/issues/3668)
- **graphql-server:** authenticate /flush, bound the system lane, name the introspection role ([6493c16](https://github.com/constructive-io/constructive/commit/6493c164479bcb8c75b27a8a10fa922b21a7260c))

# [5.21.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.8...@constructive-io/graphql-server@5.21.0) (2026-09-03)

### Bug Fixes

- **refusals:** target generated constructive_usage_private.record_refusals, flush as system role type ([74c9ce2](https://github.com/constructive-io/constructive/commit/74c9ce24b7729dee9be544aff8363a31c01011cf))
- **server:** a resolved API row with no served role is a visible failure, not a substituted default ([b82336b](https://github.com/constructive-io/constructive/commit/b82336b23898e5888d272457eda451cfd18895e2))

### Features

- **express-context:** bounded counter + batch flusher, RefusalRecorder; GraphQL refusal emitters ([#1950](https://github.com/constructive-io/constructive/issues/1950)) ([ede1788](https://github.com/constructive-io/constructive/commit/ede17888b4cd671e1cb3b9111a648178a1a3d521)), closes [#1947](https://github.com/constructive-io/constructive/issues/1947)
- **graphql:** admit GraphQL requests against the tenant's concurrency and rate bounds ([745f137](https://github.com/constructive-io/constructive/commit/745f1377949a1b2e1c217bc87f39bd0c4b5b36e9))

## [5.20.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.7...@constructive-io/graphql-server@5.20.8) (2026-09-02)

### Bug Fixes

- **server:** attribute anonymous requests to the database they address ([ba2c055](https://github.com/constructive-io/constructive/commit/ba2c055893980b3b196c1f7d63a6c95fd0041cd9))

## [5.20.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.6...@constructive-io/graphql-server@5.20.7) (2026-09-01)

### Bug Fixes

- a malformed graphql request is answered as bad input, not a server failure ([c1ae568](https://github.com/constructive-io/constructive/commit/c1ae568c2a99469eef1627ce103a662c93c0a59a))

## [5.20.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.5...@constructive-io/graphql-server@5.20.6) (2026-09-01)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.20.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.4...@constructive-io/graphql-server@5.20.5) (2026-08-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.20.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.3...@constructive-io/graphql-server@5.20.4) (2026-08-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.20.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.2...@constructive-io/graphql-server@5.20.3) (2026-08-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.20.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.1...@constructive-io/graphql-server@5.20.2) (2026-08-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.20.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.20.0...@constructive-io/graphql-server@5.20.1) (2026-08-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.20.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.19.0...@constructive-io/graphql-server@5.20.0) (2026-08-25)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.19.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.18.3...@constructive-io/graphql-server@5.19.0) (2026-08-24)

### Bug Fixes

- **graphql-server:** surface csrf errors as json ([4db3124](https://github.com/constructive-io/constructive/commit/4db3124dd737b04d2c406dee6b404d6fbdd8fee4))

## [5.18.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.18.2...@constructive-io/graphql-server@5.18.3) (2026-08-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.18.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.18.1...@constructive-io/graphql-server@5.18.2) (2026-08-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.18.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.18.0...@constructive-io/graphql-server@5.18.1) (2026-08-18)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.18.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.17.3...@constructive-io/graphql-server@5.18.0) (2026-08-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.17.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.17.2...@constructive-io/graphql-server@5.17.3) (2026-08-15)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.17.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.17.1...@constructive-io/graphql-server@5.17.2) (2026-08-15)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.17.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.17.0...@constructive-io/graphql-server@5.17.1) (2026-08-15)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.17.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.14...@constructive-io/graphql-server@5.17.0) (2026-08-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.14](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.13...@constructive-io/graphql-server@5.16.14) (2026-08-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.13](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.12...@constructive-io/graphql-server@5.16.13) (2026-08-13)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.12](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.11...@constructive-io/graphql-server@5.16.12) (2026-08-13)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.11](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.10...@constructive-io/graphql-server@5.16.11) (2026-08-13)

### Bug Fixes

- **graphql-server:** attach the notify client's error handler before the LISTEN ([7de64ae](https://github.com/constructive-io/constructive/commit/7de64ae4e50df894d1d6df5bf4f4a63a1fce13e6))

## [5.16.10](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.9...@constructive-io/graphql-server@5.16.10) (2026-08-10)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.8...@constructive-io/graphql-server@5.16.9) (2026-08-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.7...@constructive-io/graphql-server@5.16.8) (2026-08-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.6...@constructive-io/graphql-server@5.16.7) (2026-08-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.5...@constructive-io/graphql-server@5.16.6) (2026-08-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.4...@constructive-io/graphql-server@5.16.5) (2026-08-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.3...@constructive-io/graphql-server@5.16.4) (2026-08-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.2...@constructive-io/graphql-server@5.16.3) (2026-08-04)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.1...@constructive-io/graphql-server@5.16.2) (2026-08-03)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.16.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.16.0...@constructive-io/graphql-server@5.16.1) (2026-08-03)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.16.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.5...@constructive-io/graphql-server@5.16.0) (2026-08-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.15.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.4...@constructive-io/graphql-server@5.15.5) (2026-08-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.15.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.3...@constructive-io/graphql-server@5.15.4) (2026-08-01)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.15.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.2...@constructive-io/graphql-server@5.15.3) (2026-08-01)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.15.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.1...@constructive-io/graphql-server@5.15.2) (2026-08-01)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.15.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.15.0...@constructive-io/graphql-server@5.15.1) (2026-08-01)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.15.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.6...@constructive-io/graphql-server@5.15.0) (2026-07-31)

### Features

- **agentic-server:** make canonical package the OpenAI-compatible gateway ([fa3851c](https://github.com/constructive-io/constructive/commit/fa3851cfd36e64b5b101da03a66d734a2c267c0b))

## [5.14.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.5...@constructive-io/graphql-server@5.14.6) (2026-07-31)

### Bug Fixes

- **server:** route graphile middleware GraphQL errors through the error registry ([0704c21](https://github.com/constructive-io/constructive/commit/0704c2184ae139c1f4eb9611676c3fbcfb2e2860))

## [5.14.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.4...@constructive-io/graphql-server@5.14.5) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.14.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.3...@constructive-io/graphql-server@5.14.4) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.14.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.2...@constructive-io/graphql-server@5.14.3) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.14.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.1...@constructive-io/graphql-server@5.14.2) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.14.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.14.0...@constructive-io/graphql-server@5.14.1) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.14.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.5...@constructive-io/graphql-server@5.14.0) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.13.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.4...@constructive-io/graphql-server@5.13.5) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.13.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.3...@constructive-io/graphql-server@5.13.4) (2026-07-31)

### Bug Fixes

- **server:** route middleware GraphQL errors through the error registry ([4057d45](https://github.com/constructive-io/constructive/commit/4057d45929091ddc3c0a3a5be5d43c11984fd17b))

## [5.13.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.2...@constructive-io/graphql-server@5.13.3) (2026-07-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.13.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.1...@constructive-io/graphql-server@5.13.2) (2026-07-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.13.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.13.0...@constructive-io/graphql-server@5.13.1) (2026-07-30)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.13.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.12.3...@constructive-io/graphql-server@5.13.0) (2026-07-30)

### Bug Fixes

- **server:** fall back to serving database for NULL apis.dbname in loader context ([98b5bb2](https://github.com/constructive-io/constructive/commit/98b5bb27c1e0197411d1f22bee2c0c28b09fa257))

### Features

- **server:** map trusted internal identity headers to claims on the private surface ([bedacc1](https://github.com/constructive-io/constructive/commit/bedacc1b1638482d8a90853ff864b7e0e416a9bc))

## [5.12.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.12.2...@constructive-io/graphql-server@5.12.3) (2026-07-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.12.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.12.1...@constructive-io/graphql-server@5.12.2) (2026-07-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.12.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.12.0...@constructive-io/graphql-server@5.12.1) (2026-07-30)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.12.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.11.0...@constructive-io/graphql-server@5.12.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.11.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.10.1...@constructive-io/graphql-server@5.11.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.10.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.10.0...@constructive-io/graphql-server@5.10.1) (2026-07-29)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.10.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.9.0...@constructive-io/graphql-server@5.10.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.9.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.8.1...@constructive-io/graphql-server@5.9.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.8.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.8.0...@constructive-io/graphql-server@5.8.1) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.8.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.5...@constructive-io/graphql-server@5.8.0) (2026-07-28)

### Features

- **errors:** add @constructive-io/errors + server code normalization ([896ab3b](https://github.com/constructive-io/constructive/commit/896ab3b3d359731aafaaafeff1617e0e18ce205f))
- **errors:** client adapter + registry-based server masking ([ab48163](https://github.com/constructive-io/constructive/commit/ab48163f5430c3cc92374a4a9d3e05776b4928d2))

## [5.7.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.4...@constructive-io/graphql-server@5.7.5) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.7.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.3...@constructive-io/graphql-server@5.7.4) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.7.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.2...@constructive-io/graphql-server@5.7.3) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.7.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.1...@constructive-io/graphql-server@5.7.2) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.7.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.7.0...@constructive-io/graphql-server@5.7.1) (2026-07-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.7.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.6.0...@constructive-io/graphql-server@5.7.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.6.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.5.0...@constructive-io/graphql-server@5.6.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.5.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.4.3...@constructive-io/graphql-server@5.5.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.4.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.4.2...@constructive-io/graphql-server@5.4.3) (2026-07-27)

### Bug Fixes

- **routing:** fall back to server database when scoped route config lacks dbname ([47deea5](https://github.com/constructive-io/constructive/commit/47deea5c416952da7fe0b47297d95d661e32719d))
- **server:** X-Api-Name lookup no longer filters by is_published ([236ecf1](https://github.com/constructive-io/constructive/commit/236ecf1e513061a86c075da68ae5610557f54297))

## [5.4.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.4.1...@constructive-io/graphql-server@5.4.2) (2026-07-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.4.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.4.0...@constructive-io/graphql-server@5.4.1) (2026-07-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.4.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.3.3...@constructive-io/graphql-server@5.4.0) (2026-07-27)

### Features

- remove untyped api_modules fallback readers and dead CORS branch ([1d14751](https://github.com/constructive-io/constructive/commit/1d1475144716c4769d5677216788c574c33fe0ad))
- **server:** default the scoped routing plane to logical routing_public ([08ef699](https://github.com/constructive-io/constructive/commit/08ef699a1155788e58a840e9a624329ab095fca7))

## [5.3.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.3.2...@constructive-io/graphql-server@5.3.3) (2026-07-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.3.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.3.1...@constructive-io/graphql-server@5.3.2) (2026-07-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.3.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.3.0...@constructive-io/graphql-server@5.3.1) (2026-07-26)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.3.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.2.0...@constructive-io/graphql-server@5.3.0) (2026-07-26)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.2.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.1.1...@constructive-io/graphql-server@5.2.0) (2026-07-26)

### Features

- remove default database; require an explicit database id ([31390df](https://github.com/constructive-io/constructive/commit/31390df350a6e5b816f402d19b29e9420bf2def9))
- split single-tenant dev server out of production graphql-server ([0709556](https://github.com/constructive-io/constructive/commit/070955672decec77d8de1919b9b0adb4ec615e5d))

## [5.1.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.1.0...@constructive-io/graphql-server@5.1.1) (2026-07-26)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.1.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.0.4...@constructive-io/graphql-server@5.1.0) (2026-07-25)

### Features

- **server:** hard-break GraphQL runtime off services_public onto scoped routing plane ([d3059ef](https://github.com/constructive-io/constructive/commit/d3059efecb32fc128da04059688bd48ad24b74a5))

## [5.0.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.0.3...@constructive-io/graphql-server@5.0.4) (2026-07-23)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.0.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.0.2...@constructive-io/graphql-server@5.0.3) (2026-07-23)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.0.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.0.1...@constructive-io/graphql-server@5.0.2) (2026-07-23)

**Note:** Version bump only for package @constructive-io/graphql-server

## [5.0.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@5.0.0...@constructive-io/graphql-server@5.0.1) (2026-07-22)

**Note:** Version bump only for package @constructive-io/graphql-server

# [5.0.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.45.3...@constructive-io/graphql-server@5.0.0) (2026-07-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.45.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.45.2...@constructive-io/graphql-server@4.45.3) (2026-07-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.45.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.45.1...@constructive-io/graphql-server@4.45.2) (2026-07-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.45.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.45.0...@constructive-io/graphql-server@4.45.1) (2026-07-20)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.45.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.44.3...@constructive-io/graphql-server@4.45.0) (2026-07-20)

### Features

- narrow scoped-route resolution to host-only (path/method routing stays in Traefik) ([bc904fc](https://github.com/constructive-io/constructive/commit/bc904fcce11341798255c4ee501f11b673ac352d))
- scoped-routing resolution via resolve_route() in api middleware ([334ba21](https://github.com/constructive-io/constructive/commit/334ba213422e76297d211d9524e4926392930e30))

## [4.44.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.44.2...@constructive-io/graphql-server@4.44.3) (2026-07-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.44.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.44.1...@constructive-io/graphql-server@4.44.2) (2026-07-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.44.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.44.0...@constructive-io/graphql-server@4.44.1) (2026-07-18)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.44.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.43.3...@constructive-io/graphql-server@4.44.0) (2026-07-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.43.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.43.2...@constructive-io/graphql-server@4.43.3) (2026-07-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.43.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.43.1...@constructive-io/graphql-server@4.43.2) (2026-07-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.43.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.43.0...@constructive-io/graphql-server@4.43.1) (2026-07-15)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.43.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.42.1...@constructive-io/graphql-server@4.43.0) (2026-07-14)

### Bug Fixes

- migrate internal query-builder consumers to JSON where filters ([8a40624](https://github.com/constructive-io/constructive/commit/8a406247cbffaceeadbd9f59a00a700a36f2d9a5))

## [4.42.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.42.0...@constructive-io/graphql-server@4.42.1) (2026-07-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.42.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.41.1...@constructive-io/graphql-server@4.42.0) (2026-07-13)

### Features

- consume finalized DB invocation model (loader-resolved tables, provenance inserts) ([60a9b6e](https://github.com/constructive-io/constructive/commit/60a9b6e2347e286a68207f940a3384ede098734c))
- **graphile-function-bindings:** expose API-bound functions as GraphQL mutations ([fc2e708](https://github.com/constructive-io/constructive/commit/fc2e70813a3c87d03b1248ffa33487c483b18dfb)), closes [constructive-io/constructive-planning#1149](https://github.com/constructive-io/constructive-planning/issues/1149)
- inject jwt.claims.api_id provenance claim and add REST /fn routes ([0aa60ee](https://github.com/constructive-io/constructive/commit/0aa60ee7ccf2066a419301e1ec553119cde61bfb)), closes [constructive-io/constructive-planning#1149](https://github.com/constructive-io/constructive-planning/issues/1149)

## [4.41.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.41.0...@constructive-io/graphql-server@4.41.1) (2026-07-13)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.41.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.9...@constructive-io/graphql-server@4.41.0) (2026-07-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.8...@constructive-io/graphql-server@4.40.9) (2026-07-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.7...@constructive-io/graphql-server@4.40.8) (2026-07-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.6...@constructive-io/graphql-server@4.40.7) (2026-07-11)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.5...@constructive-io/graphql-server@4.40.6) (2026-07-11)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.4...@constructive-io/graphql-server@4.40.5) (2026-07-10)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.3...@constructive-io/graphql-server@4.40.4) (2026-07-10)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.2...@constructive-io/graphql-server@4.40.3) (2026-07-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.1...@constructive-io/graphql-server@4.40.2) (2026-07-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.40.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.40.0...@constructive-io/graphql-server@4.40.1) (2026-06-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.40.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.39.0...@constructive-io/graphql-server@4.40.0) (2026-06-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.39.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.38.0...@constructive-io/graphql-server@4.39.0) (2026-06-28)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.38.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.37.0...@constructive-io/graphql-server@4.38.0) (2026-06-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.37.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.36.4...@constructive-io/graphql-server@4.37.0) (2026-06-27)

### Bug Fixes

- add principal_id to local ConstructiveAPIToken type in graphql/server ([b9511e1](https://github.com/constructive-io/constructive/commit/b9511e11cc646471f5e03e287cf038ba37847770))
- remove speculative is_read_only checks from graphile middleware ([880712b](https://github.com/constructive-io/constructive/commit/880712b41013f87014d521d069a01d3d41ec22ff))

### Features

- always set jwt.claims.principal_id in pgSettings ([89daf56](https://github.com/constructive-io/constructive/commit/89daf56d00619df79f27912690765ba65c104215))
- propagate principal_id through Express middleware and PostGraphile pgSettings ([59e2eda](https://github.com/constructive-io/constructive/commit/59e2edae80134b8f5275ed699ba1eb57a199676d)), closes [constructive-planning#1074](https://github.com/constructive-planning/issues/1074)

## [4.36.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.36.3...@constructive-io/graphql-server@4.36.4) (2026-06-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.36.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.36.2...@constructive-io/graphql-server@4.36.3) (2026-06-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.36.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.36.1...@constructive-io/graphql-server@4.36.2) (2026-06-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.36.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.36.0...@constructive-io/graphql-server@4.36.1) (2026-06-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.36.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.6...@constructive-io/graphql-server@4.36.0) (2026-06-14)

### Bug Fixes

- **graphql/server:** add pgCache to pg-cache mock in upload test ([090a69b](https://github.com/constructive-io/constructive/commit/090a69b5040a714c07de2144b75da7329902d156))

### Features

- **graphile-settings:** wire GraphileLlmPreset into createConstructivePreset ([517ce84](https://github.com/constructive-io/constructive/commit/517ce845b2363bbdd3b3c8a18792d58117ab2c7c))

## [4.35.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.5...@constructive-io/graphql-server@4.35.6) (2026-06-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.35.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.4...@constructive-io/graphql-server@4.35.5) (2026-06-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.35.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.3...@constructive-io/graphql-server@4.35.4) (2026-06-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.35.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.2...@constructive-io/graphql-server@4.35.3) (2026-06-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.35.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.1...@constructive-io/graphql-server@4.35.2) (2026-06-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.35.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.35.0...@constructive-io/graphql-server@4.35.1) (2026-05-31)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.35.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.34.4...@constructive-io/graphql-server@4.35.0) (2026-05-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.34.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.34.3...@constructive-io/graphql-server@4.34.4) (2026-05-29)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.34.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.34.2...@constructive-io/graphql-server@4.34.3) (2026-05-29)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.34.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.34.1...@constructive-io/graphql-server@4.34.2) (2026-05-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.34.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.34.0...@constructive-io/graphql-server@4.34.1) (2026-05-23)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.34.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.33.0...@constructive-io/graphql-server@4.34.0) (2026-05-23)

### Bug Fixes

- restore original server types, remove re-exports from express-context ([f4e7624](https://github.com/constructive-io/constructive/commit/f4e7624a36145b01f5d438a6177bf389cba80ae6))

### Features

- add @constructive-io/express-context package + wire into server ([2d46e0b](https://github.com/constructive-io/constructive/commit/2d46e0b419654c161ae90140b47515df16897ae4)), closes [constructive-io/constructive-planning#917](https://github.com/constructive-io/constructive-planning/issues/917)

# [4.33.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.32.0...@constructive-io/graphql-server@4.33.0) (2026-05-21)

### Features

- replace placeholder token estimates with real counts from agentic-kit v1.2.1 ([d61e92b](https://github.com/constructive-io/constructive/commit/d61e92bf4345e887e326a4625dafc6fb4474376b))
- use real embedding token counts from @agentic-kit/ollama@2.0.0 ([1e84f7f](https://github.com/constructive-io/constructive/commit/1e84f7f8d5ea4440174aefb565ddc385e0f7285f))

# [4.32.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.5...@constructive-io/graphql-server@4.32.0) (2026-05-21)

### Features

- **graphile-llm:** add agent discovery plugin and REST streaming endpoint ([47dab61](https://github.com/constructive-io/constructive/commit/47dab619a536c136b0f100e3f682c2f2a1c9ce56))
- **llm-api:** add inference logging to usage_log_inference table ([10a1b4b](https://github.com/constructive-io/constructive/commit/10a1b4b125265ecc8c30cf73094f65918df38f6f))
- **llm-api:** wire metering + add global /v1/threads routes ([5d407c2](https://github.com/constructive-io/constructive/commit/5d407c2d93d6dc0df49afdbc652572b64214b53b))
- propagate request_id through pgSettings and metering context ([37c3cd1](https://github.com/constructive-io/constructive/commit/37c3cd186fc277776c196bcdf2bf1455f6954c2c))
- replace request_type with service + operation in inference log inserts ([01c98c7](https://github.com/constructive-io/constructive/commit/01c98c7d8882681a68f400556aa7d673d1cc2d47)), closes [#1281](https://github.com/constructive-io/constructive/issues/1281)

## [4.31.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.4...@constructive-io/graphql-server@4.31.5) (2026-05-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.31.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.3...@constructive-io/graphql-server@4.31.4) (2026-05-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.31.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.2...@constructive-io/graphql-server@4.31.3) (2026-05-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.31.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.1...@constructive-io/graphql-server@4.31.2) (2026-05-15)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.31.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.31.0...@constructive-io/graphql-server@4.31.1) (2026-05-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.31.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.30.2...@constructive-io/graphql-server@4.31.0) (2026-05-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.30.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.30.1...@constructive-io/graphql-server@4.30.2) (2026-05-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.30.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.30.0...@constructive-io/graphql-server@4.30.1) (2026-05-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.30.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.29.2...@constructive-io/graphql-server@4.30.0) (2026-05-13)

### Bug Fixes

- add backward-compatible fallback for enable_bulk column ([3458851](https://github.com/constructive-io/constructive/commit/3458851073bbc1fa75c33acd7ccff231e3891455))
- **auth-cookie:** parse grafserv body and set cookies correctly ([b1190bc](https://github.com/constructive-io/constructive/commit/b1190bc38924f607c7f3da5410fd402c2e69fd47))
- remove backward-compat fallback for enable_bulk ([c0a198f](https://github.com/constructive-io/constructive/commit/c0a198f4f28d7815c2b0b7fc766301578e217dae)), closes [constructive-db#1130](https://github.com/constructive-db/issues/1130)
- **server:** return 403 for CSRF errors instead of 500 ([b1a0c73](https://github.com/constructive-io/constructive/commit/b1a0c73170678ad000c0ad09a4e403cf05afa377))

### Features

- **server:** add AuthCookiePlugin for grafserv response interception ([d133c29](https://github.com/constructive-io/constructive/commit/d133c299c814acf931011d425ff74a62f20aeaec))
- **server:** add cookie utility module for auth cookie management ([7f9b7a4](https://github.com/constructive-io/constructive/commit/7f9b7a403b1b1f4085c7e13f4fb0920da6c1bb9a)), closes [#749](https://github.com/constructive-io/constructive/issues/749)
- **server:** add CSRF protection for cookie-authenticated requests ([960eefc](https://github.com/constructive-io/constructive/commit/960eefce8ac9879191a32e9c62a6ee948bb6fd1b))
- **server:** add rememberMeDuration to AuthSettings ([2f1f37b](https://github.com/constructive-io/constructive/commit/2f1f37b8f0a8f9a952d81a7dd6a9728c17b80489))
- **server:** read device token cookie and pass to GraphQL context ([c3310d2](https://github.com/constructive-io/constructive/commit/c3310d2c9f1bbfc0bf28b308aacb9b2efcadfeb0))
- **server:** wire AuthCookiePlugin and CSRF into middleware chain ([e393e6b](https://github.com/constructive-io/constructive/commit/e393e6ba0bc13725146a12257f4f0507ca216810))
- wire enable_bulk database setting into GraphQL server and graphile-settings ([d5ab604](https://github.com/constructive-io/constructive/commit/d5ab604955912f8c70a88bd9b9fe32b8f24c7981))

## [4.29.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.29.1...@constructive-io/graphql-server@4.29.2) (2026-05-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.29.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.29.0...@constructive-io/graphql-server@4.29.1) (2026-05-11)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.29.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.28.0...@constructive-io/graphql-server@4.29.0) (2026-05-11)

### Bug Fixes

- fall back to legacy rls_module when rls_settings has NULL function names ([87d3e23](https://github.com/constructive-io/constructive/commit/87d3e23735cd43953cc48f3fae27616c929d42fe))
- remove enable_realtime from database_settings SQL query ([f422075](https://github.com/constructive-io/constructive/commit/f422075bb9e6ddd38d78a621acbf87a83286674f))
- replace silent catch blocks with log.warn in settings query functions ([bb0c07d](https://github.com/constructive-io/constructive/commit/bb0c07d830e765f60e2ecef35677035827bb1c95))
- revert enable_realtime SQL wiring until constructive-db[#1105](https://github.com/constructive-io/constructive/issues/1105) is merged ([0d34dda](https://github.com/constructive-io/constructive/commit/0d34dda517f2bf2de63d228f905e07cfd9ab593c))

### Features

- integrate RealtimeManager into constructive preset and cache lifecycle ([a4dd5b9](https://github.com/constructive-io/constructive/commit/a4dd5b9e8b0440ed49749f0eac1b3d2f3841f4a5))
- wire enable_realtime into DATABASE_SETTINGS_SQL COALESCE cascade ([f13e76c](https://github.com/constructive-io/constructive/commit/f13e76cf9cca08166d2420456d7899b261a8c159)), closes [constructive-db#1105](https://github.com/constructive-db/issues/1105)
- wire enable_realtime into DATABASE_SETTINGS_SQL COALESCE cascade ([c6cc405](https://github.com/constructive-io/constructive/commit/c6cc405f8556820f7ef1e518c64df6c834d4ef85)), closes [constructive-db#1105](https://github.com/constructive-db/issues/1105)

# [4.28.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.27.1...@constructive-io/graphql-server@4.28.0) (2026-05-11)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.27.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.27.0...@constructive-io/graphql-server@4.27.1) (2026-05-10)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.27.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.26.1...@constructive-io/graphql-server@4.27.0) (2026-05-10)

### Features

- refactor ConstructivePreset into createConstructivePreset() factory ([b06968c](https://github.com/constructive-io/constructive/commit/b06968c25baef2d08d1a7fcadf07bfc5fbff5462))
- typed table reads for CORS, pubkey, webauthn, database_settings + Graphile feature flag wiring ([b4ee8ba](https://github.com/constructive-io/constructive/commit/b4ee8bab5dc216e0bca8d8ede2890e669508cd0f))

## [4.26.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.26.0...@constructive-io/graphql-server@4.26.1) (2026-05-09)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.26.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.25.2...@constructive-io/graphql-server@4.26.0) (2026-05-09)

### Bug Fixes

- update upload tests to account for typed rls_settings query calls ([cb5e3a0](https://github.com/constructive-io/constructive/commit/cb5e3a0e756a5f9304e35629f1ec56fd4391a27e))
- use apis.dbname join for RLS_SETTINGS_BY_DBNAME_SQL ([383dc94](https://github.com/constructive-io/constructive/commit/383dc945baa4873e3ce2e2160e247e65f508a6cd))

### Features

- read RLS config from typed rls_settings table with api_modules fallback ([9baaad5](https://github.com/constructive-io/constructive/commit/9baaad57c105ba0bb2d4f341fe027384ba229b07)), closes [constructive-planning#812](https://github.com/constructive-planning/issues/812)

## [4.25.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.25.1...@constructive-io/graphql-server@4.25.2) (2026-05-09)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.25.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.25.0...@constructive-io/graphql-server@4.25.1) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.25.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.24.2...@constructive-io/graphql-server@4.25.0) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.24.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.24.1...@constructive-io/graphql-server@4.24.2) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.24.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.24.0...@constructive-io/graphql-server@4.24.1) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.24.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.23.4...@constructive-io/graphql-server@4.24.0) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.23.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.23.3...@constructive-io/graphql-server@4.23.4) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.23.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.23.2...@constructive-io/graphql-server@4.23.3) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.23.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.23.1...@constructive-io/graphql-server@4.23.2) (2026-05-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.23.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.23.0...@constructive-io/graphql-server@4.23.1) (2026-05-07)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.23.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.22.4...@constructive-io/graphql-server@4.23.0) (2026-05-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.22.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.22.3...@constructive-io/graphql-server@4.22.4) (2026-05-06)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.22.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.22.2...@constructive-io/graphql-server@4.22.3) (2026-05-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.22.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.22.1...@constructive-io/graphql-server@4.22.2) (2026-05-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.22.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.22.0...@constructive-io/graphql-server@4.22.1) (2026-05-05)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.22.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.21.1...@constructive-io/graphql-server@4.22.0) (2026-05-04)

### Features

- add invite profile assignment error codes to SAFE_ERROR_CODES ([0e156a8](https://github.com/constructive-io/constructive/commit/0e156a8ae9007399f48359e86f573ba9f50941cb)), closes [#992](https://github.com/constructive-io/constructive/issues/992)

## [4.21.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.21.0...@constructive-io/graphql-server@4.21.1) (2026-05-03)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.21.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.20.3...@constructive-io/graphql-server@4.21.0) (2026-04-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.20.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.20.2...@constructive-io/graphql-server@4.20.3) (2026-04-29)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.20.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.20.1...@constructive-io/graphql-server@4.20.2) (2026-04-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.20.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.20.0...@constructive-io/graphql-server@4.20.1) (2026-04-27)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.20.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.19.2...@constructive-io/graphql-server@4.20.0) (2026-04-27)

### Features

- consolidate S3 client factory + presigned URL helpers into s3-utils ([cf436df](https://github.com/constructive-io/constructive/commit/cf436df711fb239c640a99655e0e1a572480feb7))

## [4.19.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.19.1...@constructive-io/graphql-server@4.19.2) (2026-04-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.19.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.19.0...@constructive-io/graphql-server@4.19.1) (2026-04-20)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.19.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.6...@constructive-io/graphql-server@4.19.0) (2026-04-20)

### Features

- **graphile:** propagate jwt.claims.session_id to pgSettings ([41ab24d](https://github.com/constructive-io/constructive/commit/41ab24dc07e5a54a4690570d801b743440f584f0)), closes [constructive-io/constructive-db#908](https://github.com/constructive-io/constructive-db/issues/908)

## [4.18.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.5...@constructive-io/graphql-server@4.18.6) (2026-04-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.18.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.4...@constructive-io/graphql-server@4.18.5) (2026-04-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.18.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.3...@constructive-io/graphql-server@4.18.4) (2026-04-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.18.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.2...@constructive-io/graphql-server@4.18.3) (2026-04-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.18.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.1...@constructive-io/graphql-server@4.18.2) (2026-04-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.18.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.18.0...@constructive-io/graphql-server@4.18.1) (2026-04-18)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.18.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.17.0...@constructive-io/graphql-server@4.18.0) (2026-04-18)

### Bug Fixes

- discover auth settings via metaschema modules, remove CORS migration ([28884c2](https://github.com/constructive-io/constructive/commit/28884c2f3497608c33533fce2a112fe838ba4d7e))
- use public metaschema tables for auth settings discovery ([17dbfc3](https://github.com/constructive-io/constructive/commit/17dbfc34d46df956c9e79a7f8bb40b2ce83b5c92))

### Features

- Part C server auth enforcement - access_level, cookie auth, CORS migration, reCAPTCHA ([a23123f](https://github.com/constructive-io/constructive/commit/a23123fe9e1733290e067503be5e0d18559e137b))
- propagate kind + access_level as JWT claims in pgSettings ([788fdfe](https://github.com/constructive-io/constructive/commit/788fdfed6ccae525e1ba8183b691df25d6e16f53))

# [4.17.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.16.2...@constructive-io/graphql-server@4.17.0) (2026-04-16)

### Features

- add missing SAFE_ERROR_CODES for rate limiting and auth errors ([1ca4712](https://github.com/constructive-io/constructive/commit/1ca4712cafe095755d430386e94b6d6048fd9c50))

## [4.16.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.16.1...@constructive-io/graphql-server@4.16.2) (2026-04-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.16.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.16.0...@constructive-io/graphql-server@4.16.1) (2026-04-11)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.16.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.16...@constructive-io/graphql-server@4.16.0) (2026-04-09)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.16](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.15...@constructive-io/graphql-server@4.15.16) (2026-04-04)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.15](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.14...@constructive-io/graphql-server@4.15.15) (2026-04-03)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.14](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.13...@constructive-io/graphql-server@4.15.14) (2026-04-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.13](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.12...@constructive-io/graphql-server@4.15.13) (2026-04-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.12](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.11...@constructive-io/graphql-server@4.15.12) (2026-04-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.11](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.10...@constructive-io/graphql-server@4.15.11) (2026-04-01)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.10](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.9...@constructive-io/graphql-server@4.15.10) (2026-03-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.8...@constructive-io/graphql-server@4.15.9) (2026-03-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.7...@constructive-io/graphql-server@4.15.8) (2026-03-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.6...@constructive-io/graphql-server@4.15.7) (2026-03-30)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.5...@constructive-io/graphql-server@4.15.6) (2026-03-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.4...@constructive-io/graphql-server@4.15.5) (2026-03-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.3...@constructive-io/graphql-server@4.15.4) (2026-03-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.2...@constructive-io/graphql-server@4.15.3) (2026-03-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.1...@constructive-io/graphql-server@4.15.2) (2026-03-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.15.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.15.0...@constructive-io/graphql-server@4.15.1) (2026-03-26)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.15.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.6...@constructive-io/graphql-server@4.15.0) (2026-03-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.5...@constructive-io/graphql-server@4.14.6) (2026-03-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.4...@constructive-io/graphql-server@4.14.5) (2026-03-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.3...@constructive-io/graphql-server@4.14.4) (2026-03-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.2...@constructive-io/graphql-server@4.14.3) (2026-03-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.1...@constructive-io/graphql-server@4.14.2) (2026-03-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.14.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.14.0...@constructive-io/graphql-server@4.14.1) (2026-03-24)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.14.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.13.2...@constructive-io/graphql-server@4.14.0) (2026-03-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.13.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.13.1...@constructive-io/graphql-server@4.13.2) (2026-03-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.13.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.13.0...@constructive-io/graphql-server@4.13.1) (2026-03-21)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.13.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.12.0...@constructive-io/graphql-server@4.13.0) (2026-03-20)

### Bug Fixes

- **graphql:** route makePgService pools through pg-cache in explorer and server ([ef2f40e](https://github.com/constructive-io/constructive/commit/ef2f40eb42729d9cca64f1f935b0f75fd046a143)), closes [#860](https://github.com/constructive-io/constructive/issues/860)

# [4.12.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.6...@constructive-io/graphql-server@4.12.0) (2026-03-20)

### Features

- wire BlueprintTypesPlugin into production schema build ([7addba2](https://github.com/constructive-io/constructive/commit/7addba2168ff3b75ae54492f5c011aa3ca146d40)), closes [#857](https://github.com/constructive-io/constructive/issues/857)

## [4.11.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.5...@constructive-io/graphql-server@4.11.6) (2026-03-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.11.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.4...@constructive-io/graphql-server@4.11.5) (2026-03-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.11.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.3...@constructive-io/graphql-server@4.11.4) (2026-03-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.11.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.2...@constructive-io/graphql-server@4.11.3) (2026-03-17)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.11.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.1...@constructive-io/graphql-server@4.11.2) (2026-03-16)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.11.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.11.0...@constructive-io/graphql-server@4.11.1) (2026-03-15)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.11.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.10.0...@constructive-io/graphql-server@4.11.0) (2026-03-15)

### Bug Fixes

- align all graphile ecosystem deps to latest compatible pinned RC versions ([d3f7761](https://github.com/constructive-io/constructive/commit/d3f7761182e0470cf992028155d1a5fa00cf9211))

### Features

- **graphql-server:** add local-only observability tooling ([ca89146](https://github.com/constructive-io/constructive/commit/ca891467df721224ae709f7b67392fb24e86004e))

# [4.10.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.9.0...@constructive-io/graphql-server@4.10.0) (2026-03-15)

### Features

- pass schema naming strategy env vars to pgSettings ([0ef5f37](https://github.com/constructive-io/constructive/commit/0ef5f37ed7cc671081d4b20c549e5b9fc9ccd5dc)), closes [#576](https://github.com/constructive-io/constructive/issues/576)

# [4.9.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.8.4...@constructive-io/graphql-server@4.9.0) (2026-03-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.8.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.8.3...@constructive-io/graphql-server@4.8.4) (2026-03-13)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.8.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.8.2...@constructive-io/graphql-server@4.8.3) (2026-03-13)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.8.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.8.1...@constructive-io/graphql-server@4.8.2) (2026-03-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.8.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.7.0...@constructive-io/graphql-server@4.8.1) (2026-03-12)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.8.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.7.0...@constructive-io/graphql-server@4.8.0) (2026-03-12)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.7.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.6.2...@constructive-io/graphql-server@4.7.0) (2026-03-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.6.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.6.1...@constructive-io/graphql-server@4.6.2) (2026-03-12)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.6.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.6.0...@constructive-io/graphql-server@4.6.1) (2026-03-04)

### Bug Fixes

- resolve PG schema names via JOIN instead of JSONB to fix dashes-vs-underscores mismatch ([2a9d836](https://github.com/constructive-io/constructive/commit/2a9d8363e7a7c3c7fd6a606c56aa54ae900042c7))
- simplify RLS module query - read schema names directly from JSONB ([84eb2a6](https://github.com/constructive-io/constructive/commit/84eb2a6d7498d4886190afe024372b7086cb3fc1))
- simplify upload.ts RLS queries - read schema names directly from JSONB ([1b20b00](https://github.com/constructive-io/constructive/commit/1b20b004a2348c56f7fa1cafdda5fa4832223387))
- switch RLS module query from metaschema table to services_public.api_modules ([0d26f90](https://github.com/constructive-io/constructive/commit/0d26f908acd048146f0abd821892d4901f860ef4))

# [4.6.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.5.2...@constructive-io/graphql-server@4.6.0) (2026-03-04)

### Bug Fixes

- update test expectations for keyword-aware quoting from @pgsql/quotes ([438d50c](https://github.com/constructive-io/constructive/commit/438d50c929187e62e73638a0e320a7c32eb2586f))

### Features

- replace manual identifier quoting with @pgsql/quotes across all plugins ([8a42a33](https://github.com/constructive-io/constructive/commit/8a42a33ccfcdbba146f2136c70152fd300ee2876))

## [4.5.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.5.1...@constructive-io/graphql-server@4.5.2) (2026-03-04)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.5.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.5.0...@constructive-io/graphql-server@4.5.1) (2026-03-03)

### Bug Fixes

- **graphql-server:** restore ApiOptions type for api middleware ([8e5e528](https://github.com/constructive-io/constructive/commit/8e5e5288c31e7181b132e5856d4c6eac2ff2c860))

# [4.5.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.4.0...@constructive-io/graphql-server@4.5.0) (2026-03-01)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.4.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.3.4...@constructive-io/graphql-server@4.4.0) (2026-03-01)

### Bug Fixes

- remove unused variable ([fbbc524](https://github.com/constructive-io/constructive/commit/fbbc524ab56bef142b0eaef569fc689dacbd29d3))

### Features

- **graphql-server:** add dev-only /debug/memory endpoint for OOM debugging ([88f7ca9](https://github.com/constructive-io/constructive/commit/88f7ca96183dee6fcf996cc10fd6e5ca46c94308)), closes [constructive-io/constructive-planning#654](https://github.com/constructive-io/constructive-planning/issues/654)

## [4.3.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.3.3...@constructive-io/graphql-server@4.3.4) (2026-02-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.3.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.3.2...@constructive-io/graphql-server@4.3.3) (2026-02-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.3.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.3.1...@constructive-io/graphql-server@4.3.2) (2026-02-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [4.3.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.3.0...@constructive-io/graphql-server@4.3.1) (2026-02-25)

### Bug Fixes

- pin all Graphile ecosystem RC versions and sync inconsistencies ([8f553c1](https://github.com/constructive-io/constructive/commit/8f553c10d0bdc868bc1ac34136a6dfdab76f61b5))

# [4.3.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.2.0...@constructive-io/graphql-server@4.3.0) (2026-02-24)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.2.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.1.1...@constructive-io/graphql-server@4.2.0) (2026-02-24)

### Features

- **graphql-server:** mask unexpected graphile errors ([27ce069](https://github.com/constructive-io/constructive/commit/27ce069e691022de209790084a90fdc03f72105f))
- **upload:** add authenticated /upload endpoint middleware ([75bf841](https://github.com/constructive-io/constructive/commit/75bf8412968e5c80649ea2e6dfb5661eab1d4861))

## [4.1.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.1.0...@constructive-io/graphql-server@4.1.1) (2026-02-19)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.1.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.0.1...@constructive-io/graphql-server@4.1.0) (2026-02-19)

### Features

- add graphile-schema package, README headers/footers, and --schema-only tests ([4587027](https://github.com/constructive-io/constructive/commit/458702780393dd4ca514e311d10f11143ee7a254))
- **codegen:** apiNames auto-expansion to multi-target, --schema-only flag, remove redundant commands ([b1396bc](https://github.com/constructive-io/constructive/commit/b1396bcf0d238ae425c3a771ab07e460833a8c2f))

## [4.0.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@4.0.0...@constructive-io/graphql-server@4.0.1) (2026-02-15)

**Note:** Version bump only for package @constructive-io/graphql-server

# [4.0.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.1.1...@constructive-io/graphql-server@4.0.0) (2026-02-13)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.1.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.1.0...@constructive-io/graphql-server@3.1.1) (2026-02-13)

**Note:** Version bump only for package @constructive-io/graphql-server

# [3.1.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.5...@constructive-io/graphql-server@3.1.0) (2026-02-09)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.0.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.4...@constructive-io/graphql-server@3.0.5) (2026-01-28)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.0.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.3...@constructive-io/graphql-server@3.0.4) (2026-01-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.0.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.2...@constructive-io/graphql-server@3.0.3) (2026-01-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.0.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.1...@constructive-io/graphql-server@3.0.2) (2026-01-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [3.0.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@3.0.0...@constructive-io/graphql-server@3.0.1) (2026-01-24)

**Note:** Version bump only for package @constructive-io/graphql-server

# [3.0.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.11...@constructive-io/graphql-server@3.0.0) (2026-01-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.11](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.10...@constructive-io/graphql-server@2.19.11) (2026-01-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.10](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.9...@constructive-io/graphql-server@2.19.10) (2026-01-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.8...@constructive-io/graphql-server@2.19.9) (2026-01-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.7...@constructive-io/graphql-server@2.19.8) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.6...@constructive-io/graphql-server@2.19.7) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.5...@constructive-io/graphql-server@2.19.6) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.4...@constructive-io/graphql-server@2.19.5) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.3...@constructive-io/graphql-server@2.19.4) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.2...@constructive-io/graphql-server@2.19.3) (2026-01-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.1...@constructive-io/graphql-server@2.19.2) (2026-01-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.19.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.19.0...@constructive-io/graphql-server@2.19.1) (2026-01-20)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.19.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.18.3...@constructive-io/graphql-server@2.19.0) (2026-01-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.18.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.18.2...@constructive-io/graphql-server@2.18.3) (2026-01-20)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.18.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.18.1...@constructive-io/graphql-server@2.18.2) (2026-01-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.18.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.18.0...@constructive-io/graphql-server@2.18.1) (2026-01-18)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.18.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.17.0...@constructive-io/graphql-server@2.18.0) (2026-01-18)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.17.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.5...@constructive-io/graphql-server@2.17.0) (2026-01-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.16.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.4...@constructive-io/graphql-server@2.16.5) (2026-01-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.16.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.3...@constructive-io/graphql-server@2.16.4) (2026-01-15)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.16.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.2...@constructive-io/graphql-server@2.16.3) (2026-01-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.16.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.1...@constructive-io/graphql-server@2.16.2) (2026-01-14)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.16.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.16.0...@constructive-io/graphql-server@2.16.1) (2026-01-14)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.16.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.5...@constructive-io/graphql-server@2.16.0) (2026-01-11)

### Features

- add @constructive-io/playwright-test package ([78a9c32](https://github.com/constructive-io/constructive/commit/78a9c32d203dd07417e1c64130c6abc3b0ceb25e))
- add Playwright test for playwright-test package ([21e8dce](https://github.com/constructive-io/constructive/commit/21e8dcecb7ef3a181a5ada27020902e945ba7e86))

## [2.15.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.4...@constructive-io/graphql-server@2.15.5) (2026-01-10)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.15.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.3...@constructive-io/graphql-server@2.15.4) (2026-01-09)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.15.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.2...@constructive-io/graphql-server@2.15.3) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.15.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.1...@constructive-io/graphql-server@2.15.2) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.15.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.15.0...@constructive-io/graphql-server@2.15.1) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.15.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.8...@constructive-io/graphql-server@2.15.0) (2026-01-08)

### Features

- improve loggings and type safe codegen ([#581](https://github.com/constructive-io/constructive/issues/581)) ([e0f103a](https://github.com/constructive-io/constructive/commit/e0f103ab21bd0dd7349a3952d5b19f8762864daa))

## [2.14.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.7...@constructive-io/graphql-server@2.14.8) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.6...@constructive-io/graphql-server@2.14.7) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.5...@constructive-io/graphql-server@2.14.6) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.4...@constructive-io/graphql-server@2.14.5) (2026-01-08)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.3...@constructive-io/graphql-server@2.14.4) (2026-01-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.2...@constructive-io/graphql-server@2.14.3) (2026-01-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.1...@constructive-io/graphql-server@2.14.2) (2026-01-07)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.14.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.14.0...@constructive-io/graphql-server@2.14.1) (2026-01-06)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.14.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.13.0...@constructive-io/graphql-server@2.14.0) (2026-01-05)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.13.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.12.0...@constructive-io/graphql-server@2.13.0) (2026-01-05)

### Bug Fixes

- **graphql-server:** use services_public.domains in flush service ([acc75b2](https://github.com/constructive-io/constructive/commit/acc75b265a2642cea56e72b91d11e709f114fbe8))

# [2.12.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.5...@constructive-io/graphql-server@2.12.0) (2026-01-05)

### Features

- **graphql-server:** add debug logging in development mode ([3740fce](https://github.com/constructive-io/constructive/commit/3740fcebc1e6fe7ef502d8dda4b6d7a75ad3d3e9))

## [2.11.5](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.4...@constructive-io/graphql-server@2.11.5) (2026-01-05)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.11.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.3...@constructive-io/graphql-server@2.11.4) (2026-01-03)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.11.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.2...@constructive-io/graphql-server@2.11.3) (2026-01-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.11.2](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.1...@constructive-io/graphql-server@2.11.2) (2026-01-02)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.11.1](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.11.0...@constructive-io/graphql-server@2.11.1) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

# [2.11.0](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.36...@constructive-io/graphql-server@2.11.0) (2025-12-31)

### Features

- **cdn:** add BUCKET_PROVIDER env var for explicit storage provider selection ([e305ba0](https://github.com/constructive-io/constructive/commit/e305ba06ef62406e60b83f5b5eb784ec9c20316a))

## [2.10.36](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.35...@constructive-io/graphql-server@2.10.36) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.35](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.34...@constructive-io/graphql-server@2.10.35) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.34](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.33...@constructive-io/graphql-server@2.10.34) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.33](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.32...@constructive-io/graphql-server@2.10.33) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.32](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.31...@constructive-io/graphql-server@2.10.32) (2025-12-31)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.31](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.30...@constructive-io/graphql-server@2.10.31) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.30](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.29...@constructive-io/graphql-server@2.10.30) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.29](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.28...@constructive-io/graphql-server@2.10.29) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.28](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.27...@constructive-io/graphql-server@2.10.28) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.27](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.26...@constructive-io/graphql-server@2.10.27) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.26](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.25...@constructive-io/graphql-server@2.10.26) (2025-12-27)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.25](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.24...@constructive-io/graphql-server@2.10.25) (2025-12-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.24](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.23...@constructive-io/graphql-server@2.10.24) (2025-12-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.23](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.22...@constructive-io/graphql-server@2.10.23) (2025-12-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.22](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.21...@constructive-io/graphql-server@2.10.22) (2025-12-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.21](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.20...@constructive-io/graphql-server@2.10.21) (2025-12-26)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.20](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.19...@constructive-io/graphql-server@2.10.20) (2025-12-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.19](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.18...@constructive-io/graphql-server@2.10.19) (2025-12-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.18](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.17...@constructive-io/graphql-server@2.10.18) (2025-12-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.17](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.16...@constructive-io/graphql-server@2.10.17) (2025-12-25)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.16](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.15...@constructive-io/graphql-server@2.10.16) (2025-12-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.15](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.14...@constructive-io/graphql-server@2.10.15) (2025-12-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.14](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.13...@constructive-io/graphql-server@2.10.14) (2025-12-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.13](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.12...@constructive-io/graphql-server@2.10.13) (2025-12-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.12](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.11...@constructive-io/graphql-server@2.10.12) (2025-12-24)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.11](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.10...@constructive-io/graphql-server@2.10.11) (2025-12-23)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.10](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.9...@constructive-io/graphql-server@2.10.10) (2025-12-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.9](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.8...@constructive-io/graphql-server@2.10.9) (2025-12-22)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.8](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.7...@constructive-io/graphql-server@2.10.8) (2025-12-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.7](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.6...@constructive-io/graphql-server@2.10.7) (2025-12-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.6](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.5...@constructive-io/graphql-server@2.10.6) (2025-12-21)

**Note:** Version bump only for package @constructive-io/graphql-server

## 2.10.5 (2025-12-19)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.4](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.3...@constructive-io/graphql-server@2.10.4) (2025-12-18)

**Note:** Version bump only for package @constructive-io/graphql-server

## [2.10.3](https://github.com/constructive-io/constructive/compare/@constructive-io/graphql-server@2.10.2...@constructive-io/graphql-server@2.10.3) (2025-12-17)

**Note:** Version bump only for package @constructive-io/graphql-server
