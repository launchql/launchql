# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.34.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.7...@constructive-io/express-context@0.34.0) (2026-10-14)

### Features

- **server:** run every control-plane query as api.controlRole (SET LOCAL ROLE) ([0c06623](https://github.com/constructive-io/constructive/commit/0c06623fd6796c37e19c962fb29e11fe88b733cc))

## [0.33.7](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.6...@constructive-io/express-context@0.33.7) (2026-10-13)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.6](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.5...@constructive-io/express-context@0.33.6) (2026-10-13)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.5](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.4...@constructive-io/express-context@0.33.5) (2026-10-12)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.4](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.3...@constructive-io/express-context@0.33.4) (2026-10-02)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.3](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.2...@constructive-io/express-context@0.33.3) (2026-09-24)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.1...@constructive-io/express-context@0.33.2) (2026-09-19)

**Note:** Version bump only for package @constructive-io/express-context

## [0.33.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.33.0...@constructive-io/express-context@0.33.1) (2026-09-17)

**Note:** Version bump only for package @constructive-io/express-context

# [0.33.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.32.0...@constructive-io/express-context@0.33.0) (2026-09-17)

**Note:** Version bump only for package @constructive-io/express-context

# [0.32.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.31.1...@constructive-io/express-context@0.32.0) (2026-09-17)

**Note:** Version bump only for package @constructive-io/express-context

## [0.31.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.31.0...@constructive-io/express-context@0.31.1) (2026-09-15)

**Note:** Version bump only for package @constructive-io/express-context

# [0.31.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.30.0...@constructive-io/express-context@0.31.0) (2026-09-08)

### Bug Fixes

- **express-context:** isolate bounded loader caches ([ca37b7c](https://github.com/constructive-io/constructive/commit/ca37b7c0f389bfb0ed837e479f87f16d48ef74b7))
- **express-context:** preserve invalidation and absence semantics ([8950eaf](https://github.com/constructive-io/constructive/commit/8950eaf6824fa129801391345f5c98b497373669))
- **express-context:** retain logical loader cache keys ([724b440](https://github.com/constructive-io/constructive/commit/724b4400183a0ef7debf17615be874ad3aea60ab))

### Features

- **graphql:** refuse requests to suspended databases via a standing loader ([ecb3659](https://github.com/constructive-io/constructive/commit/ecb3659a04c52c38e82cb28c1bd955ea8e43d071))

# [0.30.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.29.0...@constructive-io/express-context@0.30.0) (2026-09-06)

### Features

- **graphql-server:** record refusals as their error code via events record_error ([c0a1208](https://github.com/constructive-io/constructive/commit/c0a1208e83052dd28c819a15c68b906aac1af32a))

# [0.29.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.28.0...@constructive-io/express-context@0.29.0) (2026-09-05)

### Features

- **graphql-server:** record principal.widening_refused after PRINCIPAL_CHILD_WIDENS ([37a6476](https://github.com/constructive-io/constructive/commit/37a64763a01485677fb89dc7de77b1c0473f87fc))

# [0.28.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.27.0...@constructive-io/express-context@0.28.0) (2026-09-04)

### Features

- **auth:** agent-auth error codes + intent/session-lineage claims ([2f53a6b](https://github.com/constructive-io/constructive/commit/2f53a6bf0083a59a69fe28cced0f8f3e3babbade)), closes [#3668](https://github.com/constructive-io/constructive/issues/3668)

# [0.27.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.26.2...@constructive-io/express-context@0.27.0) (2026-09-03)

### Bug Fixes

- **express-context:** fall back to the socket peer when the forwarded chain is too short ([6625613](https://github.com/constructive-io/constructive/commit/6625613e9c38dd786293fc171f7e40246b53ab97))
- **refusals:** target generated constructive_usage_private.record_refusals, flush as system role type ([74c9ce2](https://github.com/constructive-io/constructive/commit/74c9ce24b7729dee9be544aff8363a31c01011cf))

### Features

- **express-context:** bounded counter + batch flusher, RefusalRecorder; GraphQL refusal emitters ([#1950](https://github.com/constructive-io/constructive/issues/1950)) ([ede1788](https://github.com/constructive-io/constructive/commit/ede17888b4cd671e1cb3b9111a648178a1a3d521)), closes [#1947](https://github.com/constructive-io/constructive/issues/1947)
- **graphql:** admit GraphQL requests against the tenant's concurrency and rate bounds ([745f137](https://github.com/constructive-io/constructive/commit/745f1377949a1b2e1c217bc87f39bd0c4b5b36e9))

## [0.26.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.26.1...@constructive-io/express-context@0.26.2) (2026-09-01)

**Note:** Version bump only for package @constructive-io/express-context

## [0.26.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.26.0...@constructive-io/express-context@0.26.1) (2026-08-28)

**Note:** Version bump only for package @constructive-io/express-context

# [0.26.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.25.1...@constructive-io/express-context@0.26.0) (2026-08-18)

**Note:** Version bump only for package @constructive-io/express-context

## [0.25.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.25.0...@constructive-io/express-context@0.25.1) (2026-08-15)

**Note:** Version bump only for package @constructive-io/express-context

# [0.25.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.7...@constructive-io/express-context@0.25.0) (2026-08-14)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.7](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.6...@constructive-io/express-context@0.24.7) (2026-08-14)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.6](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.5...@constructive-io/express-context@0.24.6) (2026-08-13)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.5](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.4...@constructive-io/express-context@0.24.5) (2026-08-13)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.4](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.3...@constructive-io/express-context@0.24.4) (2026-08-06)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.3](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.2...@constructive-io/express-context@0.24.3) (2026-08-05)

**Note:** Version bump only for package @constructive-io/express-context

## [0.24.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.1...@constructive-io/express-context@0.24.2) (2026-08-04)

### Bug Fixes

- **express-context:** key tenant-DB module discovery by database_id, ship auth loaders ([7b01640](https://github.com/constructive-io/constructive/commit/7b016405acb26bc471c7600a999daa4bee5b4a5a)), closes [constructive-planning#1403](https://github.com/constructive-planning/issues/1403) [constructive-planning#1414](https://github.com/constructive-planning/issues/1414)

## [0.24.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.24.0...@constructive-io/express-context@0.24.1) (2026-08-03)

**Note:** Version bump only for package @constructive-io/express-context

# [0.24.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.23.3...@constructive-io/express-context@0.24.0) (2026-08-02)

**Note:** Version bump only for package @constructive-io/express-context

## [0.23.3](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.23.2...@constructive-io/express-context@0.23.3) (2026-08-01)

**Note:** Version bump only for package @constructive-io/express-context

## [0.23.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.23.1...@constructive-io/express-context@0.23.2) (2026-07-31)

**Note:** Version bump only for package @constructive-io/express-context

## [0.23.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.23.0...@constructive-io/express-context@0.23.1) (2026-07-31)

**Note:** Version bump only for package @constructive-io/express-context

# [0.23.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.5...@constructive-io/express-context@0.23.0) (2026-07-31)

**Note:** Version bump only for package @constructive-io/express-context

## [0.22.5](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.4...@constructive-io/express-context@0.22.5) (2026-07-31)

**Note:** Version bump only for package @constructive-io/express-context

## [0.22.4](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.3...@constructive-io/express-context@0.22.4) (2026-07-30)

**Note:** Version bump only for package @constructive-io/express-context

## [0.22.3](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.2...@constructive-io/express-context@0.22.3) (2026-07-30)

**Note:** Version bump only for package @constructive-io/express-context

## [0.22.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.1...@constructive-io/express-context@0.22.2) (2026-07-30)

**Note:** Version bump only for package @constructive-io/express-context

## [0.22.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.22.0...@constructive-io/express-context@0.22.1) (2026-07-30)

**Note:** Version bump only for package @constructive-io/express-context

# [0.22.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.21.0...@constructive-io/express-context@0.22.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/express-context

# [0.21.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.20.1...@constructive-io/express-context@0.21.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/express-context

## [0.20.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.20.0...@constructive-io/express-context@0.20.1) (2026-07-29)

**Note:** Version bump only for package @constructive-io/express-context

# [0.20.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.19.0...@constructive-io/express-context@0.20.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/express-context

# [0.19.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.18.2...@constructive-io/express-context@0.19.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/express-context

## [0.18.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.18.1...@constructive-io/express-context@0.18.2) (2026-07-28)

**Note:** Version bump only for package @constructive-io/express-context

## [0.18.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.18.0...@constructive-io/express-context@0.18.1) (2026-07-28)

**Note:** Version bump only for package @constructive-io/express-context

# [0.18.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.17.0...@constructive-io/express-context@0.18.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/express-context

# [0.17.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.16.0...@constructive-io/express-context@0.17.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/express-context

# [0.16.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.15.0...@constructive-io/express-context@0.16.0) (2026-07-27)

**Note:** Version bump only for package @constructive-io/express-context

# [0.15.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.14.2...@constructive-io/express-context@0.15.0) (2026-07-27)

### Features

- remove untyped api_modules fallback readers and dead CORS branch ([1d14751](https://github.com/constructive-io/constructive/commit/1d1475144716c4769d5677216788c574c33fe0ad))
- **server:** default the scoped routing plane to logical routing_public ([08ef699](https://github.com/constructive-io/constructive/commit/08ef699a1155788e58a840e9a624329ab095fca7))

## [0.14.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.14.1...@constructive-io/express-context@0.14.2) (2026-07-26)

**Note:** Version bump only for package @constructive-io/express-context

## [0.14.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.14.0...@constructive-io/express-context@0.14.1) (2026-07-26)

**Note:** Version bump only for package @constructive-io/express-context

# [0.14.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.13.1...@constructive-io/express-context@0.14.0) (2026-07-26)

**Note:** Version bump only for package @constructive-io/express-context

## [0.13.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.13.0...@constructive-io/express-context@0.13.1) (2026-07-26)

**Note:** Version bump only for package @constructive-io/express-context

# [0.13.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.12.2...@constructive-io/express-context@0.13.0) (2026-07-25)

### Features

- **server:** hard-break GraphQL runtime off services_public onto scoped routing plane ([d3059ef](https://github.com/constructive-io/constructive/commit/d3059efecb32fc128da04059688bd48ad24b74a5))

## [0.12.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.12.1...@constructive-io/express-context@0.12.2) (2026-07-18)

**Note:** Version bump only for package @constructive-io/express-context

## [0.12.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.12.0...@constructive-io/express-context@0.12.1) (2026-07-18)

**Note:** Version bump only for package @constructive-io/express-context

# [0.12.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.11.1...@constructive-io/express-context@0.12.0) (2026-07-18)

**Note:** Version bump only for package @constructive-io/express-context

## [0.11.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.11.0...@constructive-io/express-context@0.11.1) (2026-07-15)

### Bug Fixes

- **express-context:** read auth_settings_table_name directly ([560530d](https://github.com/constructive-io/constructive/commit/560530d688a3b2fa3bf6dc9854be51867d2ed5a7)), closes [constructive-db#2194](https://github.com/constructive-db/issues/2194)

# [0.11.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.10.0...@constructive-io/express-context@0.11.0) (2026-07-14)

### Bug Fixes

- **express-context:** read renamed auth_settings_table_name column ([ee8f4de](https://github.com/constructive-io/constructive/commit/ee8f4defaf406dc9bf77e110d2a73127f9e4a46e))

# [0.10.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.9.0...@constructive-io/express-context@0.10.0) (2026-07-13)

### Features

- consume finalized DB invocation model (loader-resolved tables, provenance inserts) ([60a9b6e](https://github.com/constructive-io/constructive/commit/60a9b6e2347e286a68207f940a3384ede098734c))
- inject jwt.claims.api_id provenance claim and add REST /fn routes ([0aa60ee](https://github.com/constructive-io/constructive/commit/0aa60ee7ccf2066a419301e1ec553119cde61bfb)), closes [constructive-io/constructive-planning#1149](https://github.com/constructive-io/constructive-planning/issues/1149)

# [0.9.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.6...@constructive-io/express-context@0.9.0) (2026-07-12)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.6](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.5...@constructive-io/express-context@0.8.6) (2026-07-12)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.5](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.4...@constructive-io/express-context@0.8.5) (2026-07-11)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.4](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.3...@constructive-io/express-context@0.8.4) (2026-07-11)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.3](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.2...@constructive-io/express-context@0.8.3) (2026-07-10)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.2](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.1...@constructive-io/express-context@0.8.2) (2026-07-10)

**Note:** Version bump only for package @constructive-io/express-context

## [0.8.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.8.0...@constructive-io/express-context@0.8.1) (2026-07-08)

**Note:** Version bump only for package @constructive-io/express-context

# [0.8.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.7.0...@constructive-io/express-context@0.8.0) (2026-06-28)

**Note:** Version bump only for package @constructive-io/express-context

# [0.7.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.6.1...@constructive-io/express-context@0.7.0) (2026-06-27)

### Features

- propagate principal_id through Express middleware and PostGraphile pgSettings ([59e2eda](https://github.com/constructive-io/constructive/commit/59e2edae80134b8f5275ed699ba1eb57a199676d)), closes [constructive-planning#1074](https://github.com/constructive-planning/issues/1074)

## [0.6.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.6.0...@constructive-io/express-context@0.6.1) (2026-06-22)

**Note:** Version bump only for package @constructive-io/express-context

# [0.6.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.5.0...@constructive-io/express-context@0.6.0) (2026-06-14)

### Features

- **express-context, agentic-server, graphile-llm:** centralize LLM provider config via express-context loaders ([534b05d](https://github.com/constructive-io/constructive/commit/534b05d507f358fa7b462993f70fec466d8a89f0))
- **express-context:** add shared BillingClient abstraction ([7f3a1cb](https://github.com/constructive-io/constructive/commit/7f3a1cbf71e2b14017661e48168082863df2f75d)), closes [constructive-io/constructive-planning#1054](https://github.com/constructive-io/constructive-planning/issues/1054)

# [0.5.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.4.0...@constructive-io/express-context@0.5.0) (2026-05-31)

### Features

- wire enableI18n through DatabaseSettings, loader, and ConstructivePreset ([7b709b9](https://github.com/constructive-io/constructive/commit/7b709b9069e462da77e5d1cda9e7c1df9d8569ea))

# [0.4.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.3.1...@constructive-io/express-context@0.4.0) (2026-05-30)

**Note:** Version bump only for package @constructive-io/express-context

## [0.3.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.3.0...@constructive-io/express-context@0.3.1) (2026-05-29)

**Note:** Version bump only for package @constructive-io/express-context

# [0.3.0](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.2.1...@constructive-io/express-context@0.3.0) (2026-05-24)

### Features

- add billing/inferenceLog/agentChat module loaders + wire into agentic-server ([03394bd](https://github.com/constructive-io/constructive/commit/03394bdcb121de00c84618b3f09b5309536417f5))

## [0.2.1](https://github.com/constructive-io/constructive/compare/@constructive-io/express-context@0.2.0...@constructive-io/express-context@0.2.1) (2026-05-23)

### Bug Fixes

- **loaders:** use composite cache key (databaseId:apiId) ([9649164](https://github.com/constructive-io/constructive/commit/96491643e58e341626c5dafe845009663642ad3e))

# 0.2.0 (2026-05-23)

### Bug Fixes

- add back Express.Request properties that express-context reads ([35af13a](https://github.com/constructive-io/constructive/commit/35af13a33e7d0bb5a087584a8f8a3fdd94ada17d))
- restore original server types, remove re-exports from express-context ([f4e7624](https://github.com/constructive-io/constructive/commit/f4e7624a36145b01f5d438a6177bf389cba80ae6))

### Features

- add @constructive-io/express-context package + wire into server ([2d46e0b](https://github.com/constructive-io/constructive/commit/2d46e0b419654c161ae90140b47515df16897ae4)), closes [constructive-io/constructive-planning#917](https://github.com/constructive-io/constructive-planning/issues/917)
- **express-context:** add modular per-database cached lookup system ([1356633](https://github.com/constructive-io/constructive/commit/135663385951e72da5a8d0644122f21e4650c228))
- **pg-query-context:** add callback-based withPgClient API ([8f13b6d](https://github.com/constructive-io/constructive/commit/8f13b6d620ffdb001c017798c7deed6c8776bee0))
