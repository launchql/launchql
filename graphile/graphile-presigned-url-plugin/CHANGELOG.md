# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.23.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.23.1...graphile-presigned-url-plugin@1.23.2) (2026-10-16)

### Bug Fixes

- no role switch anywhere; request-lane storage/i18n reads via claim-scoped SECURITY DEFINER readers; admin structure serves as the request role ([d41873d](https://github.com/constructive-io/constructive/commit/d41873d040aaecc3eba2ec48d85c7b045167c3a3))
- **presigned-url:** FILE_NOT_REPLACEABLE is a coded public error, not INTERNAL_SERVER_ERROR ([#2267](https://github.com/constructive-io/constructive/issues/2267)) ([f77a634](https://github.com/constructive-io/constructive/commit/f77a6346d204eb7c61d6839a22108666bcd04aaa))

## [1.23.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.23.0...graphile-presigned-url-plugin@1.23.1) (2026-10-14)

### Bug Fixes

- **presigned-url:** dedup only against rows whose bytes exist; expose maxBulkFiles on buckets ([2800576](https://github.com/constructive-io/constructive/commit/2800576f82924eadbabb473ebd6d05ed0b68ac89))
- **presigned-url:** HEAD the matched row's own key on hash dedup; check the staged-upload stale-row delete ([07602c9](https://github.com/constructive-io/constructive/commit/07602c95c47aa88cf5d11f0f9889c5db572f6eef))

# [1.23.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.22.2...graphile-presigned-url-plugin@1.23.0) (2026-10-14)

### Bug Fixes

- **storage:** invalidate schema metadata and allow private download CORS ([770f892](https://github.com/constructive-io/constructive/commit/770f892e5551245b738e3780942cb78aec6d138b))

## [1.22.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.22.1...graphile-presigned-url-plugin@1.22.2) (2026-10-14)

### Bug Fixes

- **storage:** re-read unreconciled buckets, expire cache entries on TTL, converge bucket CORS and stop swallowing S3 errors by message text ([6d61ab4](https://github.com/constructive-io/constructive/commit/6d61ab46dde25a4f4bac786a8f331962e99fe8e5))

## [1.22.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.22.0...graphile-presigned-url-plugin@1.22.1) (2026-10-13)

### Bug Fixes

- **storage:** resolve a visible file's bucket physical name on the system lane for downloadUrl ([6a27d6d](https://github.com/constructive-io/constructive/commit/6a27d6d986c55292cfac2f8b7b76185a0c1e325a))

# [1.22.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.21.1...graphile-presigned-url-plugin@1.22.0) (2026-10-13)

### Bug Fixes

- **presigned-url:** refuse storage_module rows that name their own endpoint/provider/region for the platform credentials ([16d15f4](https://github.com/constructive-io/constructive/commit/16d15f480265de3bb54b052fea0b2d76200d10c0))
- **presigned-url:** S3 client cache keys on credentials too; a missing platform row reports NOT_CONFIGURED, not OVERRIDE_REFUSED ([fa3f111](https://github.com/constructive-io/constructive/commit/fa3f111ff54652d2086b9d15c1f723be24b0cef2))

### Features

- **storage:** storage coordinates come only from storage_module; STORAGE_* credentials are the only env ([44c4516](https://github.com/constructive-io/constructive/commit/44c4516f347e7021067914f1148ebd87cb2131fb))

## [1.21.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.21.0...graphile-presigned-url-plugin@1.21.1) (2026-09-30)

### Bug Fixes

- **storage:** fail loudly when the caller cannot delete the row it would replace ([1c592d6](https://github.com/constructive-io/constructive/commit/1c592d6cfb039220601e1e4ee2586491fcf88361))
- **storage:** refuse a custom-key replace on a content-addressed module without versioning ([3616851](https://github.com/constructive-io/constructive/commit/3616851de2f6717d1860ff76967c166412c3d50f))
- **storage:** replace the row at a custom key when the module has no versioning ([abebe13](https://github.com/constructive-io/constructive/commit/abebe138c48903363ded7117ca01256ea40106e8))

# [1.21.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.20.0...graphile-presigned-url-plugin@1.21.0) (2026-09-17)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.20.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.19.1...graphile-presigned-url-plugin@1.20.0) (2026-09-17)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.19.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.19.0...graphile-presigned-url-plugin@1.19.1) (2026-09-15)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.19.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.18.2...graphile-presigned-url-plugin@1.19.0) (2026-09-04)

### Features

- **graphql-server:** authenticate /flush, bound the system lane, name the introspection role ([6493c16](https://github.com/constructive-io/constructive/commit/6493c164479bcb8c75b27a8a10fa922b21a7260c))

## [1.18.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.18.1...graphile-presigned-url-plugin@1.18.2) (2026-09-01)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.18.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.18.0...graphile-presigned-url-plugin@1.18.1) (2026-08-31)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.18.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.17.0...graphile-presigned-url-plugin@1.18.0) (2026-08-28)

### Bug Fixes

- **storage:** mirror generated bucket job shapes ([2b15ea4](https://github.com/constructive-io/constructive/commit/2b15ea466cf406c122169b75f45f8460e109833e))

### Features

- **storage:** make reconciler sole bucket minting driver ([e15c7b5](https://github.com/constructive-io/constructive/commit/e15c7b58e46490e157542874c07de0adb2d96479))

# [1.17.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.16.1...graphile-presigned-url-plugin@1.17.0) (2026-08-28)

### Bug Fixes

- **storage:** validate recorder capabilities ([fb0bb59](https://github.com/constructive-io/constructive/commit/fb0bb59bfebdc44fe87a137d37a4ea5cebb05acd))

### Features

- **storage:** use generated file recorder for uploads ([52f26b9](https://github.com/constructive-io/constructive/commit/52f26b9584e7491e95794c6102606f6697e5d218))

## [1.16.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.16.0...graphile-presigned-url-plugin@1.16.1) (2026-08-27)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.16.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.15.1...graphile-presigned-url-plugin@1.16.0) (2026-08-25)

### Bug Fixes

- **uploads:** report why a presigned upload failed instead of an empty reason ([1757988](https://github.com/constructive-io/constructive/commit/17579881320573fcaa6a8aad96dd623c20660b0e))

## [1.15.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.15.0...graphile-presigned-url-plugin@1.15.1) (2026-08-19)

### Bug Fixes

- **uploads:** default an unregistered upload column by plane shape, not scope name ([1e32120](https://github.com/constructive-io/constructive/commit/1e32120e423d0893fd73e5fc4bbfec66d95dd9f0))

# [1.15.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.14.1...graphile-presigned-url-plugin@1.15.0) (2026-08-19)

### Features

- **meta:** report each storage plane's full upload/download surface in _meta and add a dynamic storage client ([b88d592](https://github.com/constructive-io/constructive/commit/b88d592808b211ccd26c360137a34590eb55b303))
- **storage:** pair storage planes through registry FK relations, not table names ([186fd3d](https://github.com/constructive-io/constructive/commit/186fd3d85b31c7b6c13f1dd32649815e87e716ef))

## [1.14.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.14.0...graphile-presigned-url-plugin@1.14.1) (2026-08-18)

### Bug Fixes

- **uploads:** accept underscore-led keys, bound bucket names, dedup only live objects ([d10c9c3](https://github.com/constructive-io/constructive/commit/d10c9c3e68c376c8c197bf5f4b0c6f7af633f561))

# [1.14.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.13.1...graphile-presigned-url-plugin@1.14.0) (2026-08-18)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.13.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.13.0...graphile-presigned-url-plugin@1.13.1) (2026-08-14)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.13.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.12.0...graphile-presigned-url-plugin@1.13.0) (2026-08-10)

### Features

- **storage:** reject uploads whose extension, declared type and bytes disagree ([0560be0](https://github.com/constructive-io/constructive/commit/0560be0830f7d73e1bbdda442be8d3d4be359759))

# [1.12.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.11.4...graphile-presigned-url-plugin@1.12.0) (2026-08-08)

### Features

- **storage:** refuse multipart writes into path-keyed buckets ([d2b5438](https://github.com/constructive-io/constructive/commit/d2b54389cf7832a91509ca86b46d56f43ba148b0))
- **storage:** route uploads through managed files rows and tenant-resolved buckets ([a965f3a](https://github.com/constructive-io/constructive/commit/a965f3abe1f8e72d58ad042054fb98e28c4f4a19)), closes [constructive-planning#1476](https://github.com/constructive-planning/issues/1476)

## [1.11.4](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.11.3...graphile-presigned-url-plugin@1.11.4) (2026-08-07)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.11.3](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.11.2...graphile-presigned-url-plugin@1.11.3) (2026-08-06)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.11.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.11.1...graphile-presigned-url-plugin@1.11.2) (2026-08-05)

### Bug Fixes

- **deps:** widen graphile peer ranges and resolve connection-filter from the workspace ([a5f5b63](https://github.com/constructive-io/constructive/commit/a5f5b63580f91bdfc669a00cfe7f401ff3336d3e))

## [1.11.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.11.0...graphile-presigned-url-plugin@1.11.1) (2026-08-03)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.11.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.10.1...graphile-presigned-url-plugin@1.11.0) (2026-08-02)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.10.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.10.0...graphile-presigned-url-plugin@1.10.1) (2026-08-02)

### Bug Fixes

- **presigned-url:** apply request pgSettings inside a transaction so the database claim survives ([6bef3b6](https://github.com/constructive-io/constructive/commit/6bef3b676f4fe74fff64b9bd64d47f78de1c74d7))

# [1.10.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.9.3...graphile-presigned-url-plugin@1.10.0) (2026-08-01)

### Features

- persist physical S3 bucket name on the bucket row at provision time ([c1ac393](https://github.com/constructive-io/constructive/commit/c1ac3936bc3b2b46bb721afcf778e500e2278862))

## [1.9.3](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.9.2...graphile-presigned-url-plugin@1.9.3) (2026-08-01)

### Bug Fixes

- **lint:** resolve remaining non-autofixable lint errors ([8534366](https://github.com/constructive-io/constructive/commit/853436620e969d4ca53f5d2f6c5b369adb94f2a5))

## [1.9.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.9.1...graphile-presigned-url-plugin@1.9.2) (2026-07-31)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.9.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.9.0...graphile-presigned-url-plugin@1.9.1) (2026-07-31)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.9.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.8.1...graphile-presigned-url-plugin@1.9.0) (2026-07-31)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.8.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.8.0...graphile-presigned-url-plugin@1.8.1) (2026-07-30)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.8.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.7.0...graphile-presigned-url-plugin@1.8.0) (2026-07-29)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.7.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.6.0...graphile-presigned-url-plugin@1.7.0) (2026-07-29)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.6.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.5.0...graphile-presigned-url-plugin@1.6.0) (2026-07-28)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.5.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.4.1...graphile-presigned-url-plugin@1.5.0) (2026-07-28)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.4.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.4.0...graphile-presigned-url-plugin@1.4.1) (2026-07-28)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.4.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.3.0...graphile-presigned-url-plugin@1.4.0) (2026-07-27)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.3.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.2.0...graphile-presigned-url-plugin@1.3.0) (2026-07-27)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.2.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.1.2...graphile-presigned-url-plugin@1.2.0) (2026-07-27)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.1.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.1.1...graphile-presigned-url-plugin@1.1.2) (2026-07-26)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [1.1.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.1.0...graphile-presigned-url-plugin@1.1.1) (2026-07-26)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.1.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@1.0.0...graphile-presigned-url-plugin@1.1.0) (2026-07-26)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [1.0.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.22.1...graphile-presigned-url-plugin@1.0.0) (2026-07-21)

### Features

- upgrade parser stack to PG18 (pgsql-parser 18.1.1, libpg-query 18.1.2) ([5cccf91](https://github.com/constructive-io/constructive/commit/5cccf9136ec696ef356aa42c0b9a3e06caa101eb))

## [0.22.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.22.0...graphile-presigned-url-plugin@0.22.1) (2026-07-18)

### Bug Fixes

- **presigned-url:** resolve storage module config without the request role ([3996de5](https://github.com/constructive-io/constructive/commit/3996de5b083374d8beea9915b50608200aa3c2d5))

# [0.22.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.21.1...graphile-presigned-url-plugin@0.22.0) (2026-07-12)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.21.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.21.0...graphile-presigned-url-plugin@0.21.1) (2026-07-11)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.21.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.20.2...graphile-presigned-url-plugin@0.21.0) (2026-06-28)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.20.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.20.1...graphile-presigned-url-plugin@0.20.2) (2026-06-22)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.20.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.20.0...graphile-presigned-url-plugin@0.20.1) (2026-06-18)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.20.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.19.2...graphile-presigned-url-plugin@0.20.0) (2026-05-30)

### Bug Fixes

- rename membershipType to scope in storage plugin interfaces ([f7ffb26](https://github.com/constructive-io/constructive/commit/f7ffb26dc1924514a59f7f41a4f56d64556d0dd6))
- update storage plugins to use scope instead of membership_type ([5c4cd30](https://github.com/constructive-io/constructive/commit/5c4cd30c08d541f3e9b0c22d31cf39a977599615))

## [0.19.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.19.1...graphile-presigned-url-plugin@0.19.2) (2026-05-29)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.19.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.19.0...graphile-presigned-url-plugin@0.19.1) (2026-05-21)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.19.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.18.0...graphile-presigned-url-plugin@0.19.0) (2026-05-14)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.18.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.17.1...graphile-presigned-url-plugin@0.18.0) (2026-05-13)

### Bug Fixes

- scope BucketNameResolver to (databaseId, bucketKey) ([304d201](https://github.com/constructive-io/constructive/commit/304d201a03bd5fcc059566c373ccf6465b134489))

### BREAKING CHANGES

- custom resolveBucketName callbacks must now accept
  (databaseId: string, bucketKey: string) instead of (databaseId: string).

## [0.17.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.17.0...graphile-presigned-url-plugin@0.17.1) (2026-05-11)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.17.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.16.1...graphile-presigned-url-plugin@0.17.0) (2026-05-11)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.16.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.16.0...graphile-presigned-url-plugin@0.16.1) (2026-05-09)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.16.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.15.1...graphile-presigned-url-plugin@0.16.0) (2026-05-09)

### Features

- **presigned-url:** enforce bulk upload limits (maxBulkFiles + maxBulkTotalSize) ([8c0be4a](https://github.com/constructive-io/constructive/commit/8c0be4a0651793eb119e7770fc5942a3bdd00dc9))

## [0.15.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.15.0...graphile-presigned-url-plugin@0.15.1) (2026-05-08)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.15.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.14.1...graphile-presigned-url-plugin@0.15.0) (2026-05-08)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.14.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.14.0...graphile-presigned-url-plugin@0.14.1) (2026-05-08)

### Bug Fixes

- **presigned-url:** match files→buckets by table name prefix instead of schema name ([7fd3cca](https://github.com/constructive-io/constructive/commit/7fd3ccac49f313a98e9fbe98850426888f658869))

# [0.14.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.13.0...graphile-presigned-url-plugin@0.14.0) (2026-05-08)

### Bug Fixes

- **presigned-url:** rename createFile -> uploadFile to avoid CRUD naming conflict ([9b8fb0a](https://github.com/constructive-io/constructive/commit/9b8fb0ad3c9971c2a71527f4e9f78a8bf232fdee))

### Features

- **presigned-url:** add createFile mutations alongside bucket entry points ([b22fc31](https://github.com/constructive-io/constructive/commit/b22fc3138b5dbb01b737adf319fafa8535364763))

# [0.13.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.12.2...graphile-presigned-url-plugin@0.13.0) (2026-05-08)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.12.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.12.1...graphile-presigned-url-plugin@0.12.2) (2026-05-08)

### Bug Fixes

- **presigned-url:** use correct GraphQL type for ownerId argument ([22e5252](https://github.com/constructive-io/constructive/commit/22e52529a7c8d19d84f6b72866cafa09b7288fa5))
- **presigned-url:** use extensions.pg.name for codec table name matching ([b60a855](https://github.com/constructive-io/constructive/commit/b60a855c784809c564c62bc26823767cbeb792d2))

## [0.12.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.12.0...graphile-presigned-url-plugin@0.12.1) (2026-05-08)

### Bug Fixes

- **presigned-url:** return PgSelectSingleStep from mutation entry points ([c924768](https://github.com/constructive-io/constructive/commit/c924768d99fc413e8fcfbe9ae1a43a9aac60c4ff))

# [0.12.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.11.0...graphile-presigned-url-plugin@0.12.0) (2026-05-08)

### Features

- **presigned-url:** add per-bucket mutation entry points on root Mutation type ([a8811be](https://github.com/constructive-io/constructive/commit/a8811be6c48ba7008d78d2e3724df5000226db35))

# [0.11.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.10.0...graphile-presigned-url-plugin@0.11.0) (2026-05-07)

### Features

- per-table storage middleware — upload fields on bucket types, delete middleware on file tables ([5003dc5](https://github.com/constructive-io/constructive/commit/5003dc5d85d21d5042572071b22fad1654f36881))

# [0.10.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.9.0...graphile-presigned-url-plugin@0.10.0) (2026-05-06)

**Note:** Version bump only for package graphile-presigned-url-plugin

# [0.9.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.8.0...graphile-presigned-url-plugin@0.9.0) (2026-05-05)

### Features

- add allow_custom_keys support, requestBulkUploadUrls mutation, auto-path derivation ([3f2554e](https://github.com/constructive-io/constructive/commit/3f2554edccb12aee16eb7952a5928d1e7afac1cd))

# [0.8.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.7.0...graphile-presigned-url-plugin@0.8.0) (2026-05-03)

### Bug Fixes

- update snapshots, tests, and seeds for storage simplification ([9b1a48a](https://github.com/constructive-io/constructive/commit/9b1a48ae65add780c0d005f8912cf70a4d7af078))

### Features

- remove confirmUpload, upload_requests, files.status — simplify storage ([e3c516d](https://github.com/constructive-io/constructive/commit/e3c516d35fe05a35b5117c2756bd1363872eafe1))

# [0.7.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.5...graphile-presigned-url-plugin@0.7.0) (2026-04-29)

### Features

- add status field to RequestUploadUrlPayload ([c61b5e9](https://github.com/constructive-io/constructive/commit/c61b5e9eef9a4e2f86ab859bd7f599f4abf8264d))

## [0.6.5](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.4...graphile-presigned-url-plugin@0.6.5) (2026-04-28)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.6.4](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.3...graphile-presigned-url-plugin@0.6.4) (2026-04-27)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.6.3](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.2...graphile-presigned-url-plugin@0.6.3) (2026-04-20)

### Bug Fixes

- use Grafast plan() instead of resolve() for downloadUrl field ([b06932e](https://github.com/constructive-io/constructive/commit/b06932ecfc32426ceed822ced320728aed69eff0))

## [0.6.2](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.1...graphile-presigned-url-plugin@0.6.2) (2026-04-19)

### Bug Fixes

- also remove size from dedup upload_requests INSERT ([9e1579d](https://github.com/constructive-io/constructive/commit/9e1579ddc88272152185804b95bca971842d20c1))
- remove non-existent 'size' column from upload_requests INSERT ([da7d796](https://github.com/constructive-io/constructive/commit/da7d796be36a054864dc5bfa78c19f1c96e62dc2))

## [0.6.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.6.0...graphile-presigned-url-plugin@0.6.1) (2026-04-19)

### Bug Fixes

- align plugin SQL with actual DB schema (mime_type, no content_hash on files) ([7e9f539](https://github.com/constructive-io/constructive/commit/7e9f5391b801b46ee7c05ac5eaebe85806fa48c0))

# [0.6.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.5.0...graphile-presigned-url-plugin@0.6.0) (2026-04-19)

### Bug Fixes

- backward-compatible SQL queries for legacy schema (no membership_type column) ([348e408](https://github.com/constructive-io/constructive/commit/348e408ccac7444793dcd148a67b6490cf6dc9fd))
- use SAVEPOINT for schema probe queries to avoid poisoning PG transactions ([3865697](https://github.com/constructive-io/constructive/commit/3865697ea7a0271f1e8a25963c071fb1ff3f9a92))

### Features

- multi-scope bucket resolution (Option C: bucketKey + ownerId) ([9968adf](https://github.com/constructive-io/constructive/commit/9968adf8dd53d41cca7875f4008b8992cc53cc82)), closes [#876](https://github.com/constructive-io/constructive/issues/876)

# [0.5.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.4.1...graphile-presigned-url-plugin@0.5.0) (2026-04-18)

**Note:** Version bump only for package graphile-presigned-url-plugin

## [0.4.1](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.4.0...graphile-presigned-url-plugin@0.4.1) (2026-04-11)

### Bug Fixes

- use @dataplan/pg query object format and withTransaction for presigned URL plugin ([1a55e6a](https://github.com/constructive-io/constructive/commit/1a55e6aa0856c589c7d6e0ca8c8b339736e029da))

# [0.4.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.3.0...graphile-presigned-url-plugin@0.4.0) (2026-04-09)

### Bug Fixes

- wire per-database allowed_origins into lazy bucket provisioner ([eea70d2](https://github.com/constructive-io/constructive/commit/eea70d23c64a4ee063348700acaa5f5e4bbebb00))

### Features

- lazy S3 bucket provisioning on first upload ([a03ee0f](https://github.com/constructive-io/constructive/commit/a03ee0faa28d4dd63f3781e3e8c453d263ee8a1a))
- wire per-database S3 bucket name and publicUrlPrefix into presigned URL plugin ([526d676](https://github.com/constructive-io/constructive/commit/526d676a10b25b5bbdf653cd114fc31263435c3b))

# [0.3.0](https://github.com/constructive-io/constructive/compare/graphile-presigned-url-plugin@0.2.0...graphile-presigned-url-plugin@0.3.0) (2026-04-04)

### Bug Fixes

- make S3Config lazy — resolve on first use, not at import time ([4194c45](https://github.com/constructive-io/constructive/commit/4194c45d53c58a8f6a03637cce68e72c049cf430))
- remove --experimental-vm-modules, rely on @smithy/node-http-handler pin from PR [#951](https://github.com/constructive-io/constructive/issues/951) ([84daae9](https://github.com/constructive-io/constructive/commit/84daae924f6e18f3e1570dcfdde72086ba6073c1))

### Features

- read endpoint, public_url_prefix, provider from storage_module ([122eb8e](https://github.com/constructive-io/constructive/commit/122eb8e4ff0765c521395bc67634044805164e8e))

# 0.2.0 (2026-04-01)

### Bug Fixes

- add explicit transaction management (BEGIN/COMMIT/ROLLBACK) + sanitize filename in Content-Disposition ([a17dec9](https://github.com/constructive-io/constructive/commit/a17dec99130b8bcfb2f7b945f1c9387c8d18fdac))
- replace duck-typing with [@storage](https://github.com/storage)Files smart tag for downloadUrl detection ([b677569](https://github.com/constructive-io/constructive/commit/b6775696914a78646813c7a3a65b169e06e6779f))
- Use jwt_private.current_database_id() instead of querying metaschema_public.database ([ebea118](https://github.com/constructive-io/constructive/commit/ebea1183c5061235b5c58293fa1b365b5d3fcb6c))

### Features

- add LRU bucket metadata cache to presigned-url-plugin ([c015745](https://github.com/constructive-io/constructive/commit/c015745a92439206e348517d9fe941ea7c7a7833))
- graphile-presigned-url-plugin — requestUploadUrl, confirmUpload mutations + downloadUrl field ([7276344](https://github.com/constructive-io/constructive/commit/7276344a85273d7c99a92fc8addfcb782b76237d))
