# createApiKey

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

Mint an API key for the current user; the plaintext key is returned once. access_level: full_access (default) or read_only. mfa_level: none (default) or verified; verified needs a fresh MFA proof on the calling session. A key minted while authenticated by another API key never outlives that key.

## Usage

```bash
csdk create-api-key --input.accessLevel <String> --input.clientMutationId <String> --input.expiresIn <IntervalInput> --input.keyName <String> --input.mfaLevel <String> --input.principalId <UUID>
```

## Examples

### Run createApiKey

```bash
csdk create-api-key --input.accessLevel <String> --input.clientMutationId <String> --input.expiresIn <IntervalInput> --input.keyName <String> --input.mfaLevel <String> --input.principalId <UUID>
```
