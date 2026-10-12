# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.22.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.21.0...@constructive-io/errors@0.22.0) (2026-10-12)

### Features

- **errors:** regenerate registry against combined [#2194](https://github.com/constructive-io/constructive/issues/2194) branch (DECLARED_GRANT_DRIFT, JOB_DEFERRAL_ARRAYS_MISMATCH) ([782bfb9](https://github.com/constructive-io/constructive/commit/782bfb9fc7e3d9d5c100ae7138584d8d2cd7010d))
- **errors:** register BILLING_PAYER_UNRESOLVED (regenerated from constructive-db feat/billing-payer-org) ([10d1ef3](https://github.com/constructive-io/constructive/commit/10d1ef30f4dd5d88de079ed17e30755487ef877f))

# [0.21.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.20.1...@constructive-io/errors@0.21.0) (2026-10-02)

### Features

- **errors:** register billing refusal codes (BILLING_SUBSCRIPTION_ACTIVE, BILLING_QUOTA_EXCEEDED) ([fc65ee6](https://github.com/constructive-io/constructive/commit/fc65ee67443138d76986ece14c7b46db169b3c45))
- **step-up:** password_or_mfa is a distinct kind with its own error code ([2896778](https://github.com/constructive-io/constructive/commit/28967781b35c4413e3b124aa94929c98a7501f66))

## [0.20.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.20.0...@constructive-io/errors@0.20.1) (2026-09-24)

**Note:** Version bump only for package @constructive-io/errors

# [0.20.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.19.0...@constructive-io/errors@0.20.0) (2026-09-19)

### Features

- **errors:** register verified-only identifier claim codes (IDENTIFIER_VERIFIED_ELSEWHERE, IDENTIFIER_UNVERIFIED_AMBIGUOUS, IDENTIFIER_CLAIM_LIMIT, MFA_IDENTIFIER_UNVERIFIED) ([c2bc7a6](https://github.com/constructive-io/constructive/commit/c2bc7a607cac65754eb1fb41362e75ecf4635623)), closes [#3830](https://github.com/constructive-io/constructive/issues/3830)

# [0.19.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.18.0...@constructive-io/errors@0.19.0) (2026-09-17)

### Features

- **errors:** register IDENTIFIER_CONFLICT, INVITE_ACCOUNT_EXISTS_UNVERIFIED, ALREADY_AUTHENTICATED_USE_LINK ([3b72fcf](https://github.com/constructive-io/constructive/commit/3b72fcf529a31b27d55bfe87b0d57c98237ab373)), closes [constructive-db#3806](https://github.com/constructive-db/issues/3806)

# [0.18.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.17.0...@constructive-io/errors@0.18.0) (2026-09-17)

**Note:** Version bump only for package @constructive-io/errors

# [0.17.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.16.1...@constructive-io/errors@0.17.0) (2026-09-17)

### Features

- **errors:** register GUARD_STEP_UP_MIN_AGE_ANCHOR condition codes ([1bc15c2](https://github.com/constructive-io/constructive/commit/1bc15c2dee77c4a3f40f48c17eb0f00d6f947ee0)), closes [constructive-io/constructive-db#3765](https://github.com/constructive-io/constructive-db/issues/3765)

## [0.16.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.16.0...@constructive-io/errors@0.16.1) (2026-09-15)

**Note:** Version bump only for package @constructive-io/errors

# [0.16.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.14.0...@constructive-io/errors@0.16.0) (2026-09-15)

### Features

- **errors:** register INVITE_ADDRESS_REQUIRED and INVITE_USERS_INVALID ([a7af570](https://github.com/constructive-io/constructive/commit/a7af570f135be4b062db1aa9d3b55f2a9701ff67))
- **errors:** register SIGN_UP_REQUIRES_INVITE and INVITE_PHONE_NOT_FOUND ([ea074ed](https://github.com/constructive-io/constructive/commit/ea074ed85e6a014925c3688c46bbc082ce9d5246)), closes [constructive-db#3730](https://github.com/constructive-db/issues/3730)
- **errors:** register storage file processing lifecycle errors ([ecf19ca](https://github.com/constructive-io/constructive/commit/ecf19ca29074321d4752e6315bb900cf56308751))

# [0.14.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.13.0...@constructive-io/errors@0.14.0) (2026-09-08)

### Features

- **errors:** register database suspension codes (ACCESS_SUSPENDED, SUSPENSION_*) ([fe752ed](https://github.com/constructive-io/constructive/commit/fe752edef90dc260ef90dc9cfbeb5b0d5b4c831f))

# [0.13.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.12.0...@constructive-io/errors@0.13.0) (2026-09-04)

### Features

- **auth:** agent-auth error codes + intent/session-lineage claims ([2f53a6b](https://github.com/constructive-io/constructive/commit/2f53a6bf0083a59a69fe28cced0f8f3e3babbade)), closes [#3668](https://github.com/constructive-io/constructive/issues/3668)

# [0.12.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.11.2...@constructive-io/errors@0.12.0) (2026-09-03)

### Features

- **graphql:** admit GraphQL requests against the tenant's concurrency and rate bounds ([745f137](https://github.com/constructive-io/constructive/commit/745f1377949a1b2e1c217bc87f39bd0c4b5b36e9))

## [0.11.2](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.11.1...@constructive-io/errors@0.11.2) (2026-09-01)

**Note:** Version bump only for package @constructive-io/errors

## [0.11.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.11.0...@constructive-io/errors@0.11.1) (2026-08-28)

### Bug Fixes

- **storage:** align integration fixtures with reconciliation ([50c2322](https://github.com/constructive-io/constructive/commit/50c232207dc1377eac169d1ec7626e65999a9713))

# [0.11.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.10.0...@constructive-io/errors@0.11.0) (2026-08-18)

**Note:** Version bump only for package @constructive-io/errors

# [0.10.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.9.0...@constructive-io/errors@0.10.0) (2026-08-04)

### Features

- **errors:** canonical code->HTTP status resolver, loud on unmapped codes ([611757e](https://github.com/constructive-io/constructive/commit/611757e783e6919bf44809be3fd157822affa5af))

# [0.9.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.8.2...@constructive-io/errors@0.9.0) (2026-08-02)

**Note:** Version bump only for package @constructive-io/errors

## [0.8.2](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.8.1...@constructive-io/errors@0.8.2) (2026-07-31)

**Note:** Version bump only for package @constructive-io/errors

## [0.8.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.8.0...@constructive-io/errors@0.8.1) (2026-07-31)

**Note:** Version bump only for package @constructive-io/errors

# [0.8.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.7.3...@constructive-io/errors@0.8.0) (2026-07-31)

**Note:** Version bump only for package @constructive-io/errors

## [0.7.3](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.7.2...@constructive-io/errors@0.7.3) (2026-07-31)

### Bug Fixes

- **server:** route middleware GraphQL errors through the error registry ([4057d45](https://github.com/constructive-io/constructive/commit/4057d45929091ddc3c0a3a5be5d43c11984fd17b))

## [0.7.2](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.7.1...@constructive-io/errors@0.7.2) (2026-07-30)

**Note:** Version bump only for package @constructive-io/errors

## [0.7.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.7.0...@constructive-io/errors@0.7.1) (2026-07-30)

### Bug Fixes

- **errors:** propagate the step-up codes and fresh_auth posture from constructive-db ([8c821b9](https://github.com/constructive-io/constructive/commit/8c821b9f020e428be3fcd4c7508d0903d1cae052))

# [0.7.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.6.0...@constructive-io/errors@0.7.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/errors

# [0.6.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.5.0...@constructive-io/errors@0.6.0) (2026-07-29)

**Note:** Version bump only for package @constructive-io/errors

# [0.5.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.4.0...@constructive-io/errors@0.5.0) (2026-07-29)

### Features

- **errors:** regenerate registry from current constructive-db (class-aware audit) ([45f9a49](https://github.com/constructive-io/constructive/commit/45f9a49ceb7388521c889ebb40e0d79281fcdce8))

# [0.4.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.3.0...@constructive-io/errors@0.4.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/errors

# [0.3.0](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.2.1...@constructive-io/errors@0.3.0) (2026-07-28)

**Note:** Version bump only for package @constructive-io/errors

## [0.2.1](https://github.com/constructive-io/constructive/compare/@constructive-io/errors@0.2.0...@constructive-io/errors@0.2.1) (2026-07-28)

**Note:** Version bump only for package @constructive-io/errors

# 0.2.0 (2026-07-28)

### Features

- **errors:** add @constructive-io/errors + server code normalization ([896ab3b](https://github.com/constructive-io/constructive/commit/896ab3b3d359731aafaaafeff1617e0e18ce205f))
- **errors:** client adapter + registry-based server masking ([ab48163](https://github.com/constructive-io/constructive/commit/ab48163f5430c3cc92374a4a9d3e05776b4928d2))
- **errors:** generate full 287-code constructive-db registry ([8bd0417](https://github.com/constructive-io/constructive/commit/8bd0417f2e89fecc0b65fefc5821a537eeadb3fe))
- **errors:** refresh registry snapshot to 289 constructive-db codes ([8e75608](https://github.com/constructive-io/constructive/commit/8e756086fe4b0ab9ef933404e768d251789d5693))
