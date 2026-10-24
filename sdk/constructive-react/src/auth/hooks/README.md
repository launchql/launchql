# React Query Hooks

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<!-- @constructive-io/graphql-codegen - DO NOT EDIT -->

## Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configure } from './hooks';

configure({
  endpoint: 'https://api.example.com/graphql',
  headers: { Authorization: 'Bearer <token>' },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

## Hooks

| Hook | Type | Description |
|------|------|-------------|
| `useAuditLogAuthsQuery` | Query | Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.) |
| `useAuditLogAuthQuery` | Query | Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.) |
| `useCreateAuditLogAuthMutation` | Mutation | Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.) |
| `useUpdateAuditLogAuthMutation` | Mutation | Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.) |
| `useDeleteAuditLogAuthMutation` | Mutation | Partitioned append-only audit log of authentication events (sign-in, sign-up, password changes, etc.) |
| `useCryptoAddressesQuery` | Query | Cryptocurrency wallet addresses owned by users, with network-specific validation and verification |
| `useCryptoAddressQuery` | Query | Cryptocurrency wallet addresses owned by users, with network-specific validation and verification |
| `useCreateCryptoAddressMutation` | Mutation | Cryptocurrency wallet addresses owned by users, with network-specific validation and verification |
| `useUpdateCryptoAddressMutation` | Mutation | Cryptocurrency wallet addresses owned by users, with network-specific validation and verification |
| `useDeleteCryptoAddressMutation` | Mutation | Cryptocurrency wallet addresses owned by users, with network-specific validation and verification |
| `useEmailsQuery` | Query | User email addresses with verification and primary-email management |
| `useEmailQuery` | Query | User email addresses with verification and primary-email management |
| `useCreateEmailMutation` | Mutation | User email addresses with verification and primary-email management |
| `useUpdateEmailMutation` | Mutation | User email addresses with verification and primary-email management |
| `useDeleteEmailMutation` | Mutation | User email addresses with verification and primary-email management |
| `useIdentityProvidersQuery` | Query | List all identityProviders |
| `useCreateIdentityProviderMutation` | Mutation | Create a identityProvider |
| `useOrgApiKeyListsQuery` | Query | List all orgApiKeyLists |
| `useOrgApiKeyListQuery` | Query | Get one orgApiKeyList |
| `useCreateOrgApiKeyListMutation` | Mutation | Create a orgApiKeyList |
| `useUpdateOrgApiKeyListMutation` | Mutation | Update a orgApiKeyList |
| `useDeleteOrgApiKeyListMutation` | Mutation | Delete a orgApiKeyList |
| `usePhoneNumbersQuery` | Query | User phone numbers with country code, verification, and primary-number management |
| `usePhoneNumberQuery` | Query | User phone numbers with country code, verification, and primary-number management |
| `useCreatePhoneNumberMutation` | Mutation | User phone numbers with country code, verification, and primary-number management |
| `useUpdatePhoneNumberMutation` | Mutation | User phone numbers with country code, verification, and primary-number management |
| `useDeletePhoneNumberMutation` | Mutation | User phone numbers with country code, verification, and primary-number management |
| `usePrincipalsQuery` | Query | Scoped sub-identities (API keys and agents) with precomputed SPRT |
| `usePrincipalQuery` | Query | Scoped sub-identities (API keys and agents) with precomputed SPRT |
| `useCreatePrincipalMutation` | Mutation | Scoped sub-identities (API keys and agents) with precomputed SPRT |
| `useUpdatePrincipalMutation` | Mutation | Scoped sub-identities (API keys and agents) with precomputed SPRT |
| `useDeletePrincipalMutation` | Mutation | Scoped sub-identities (API keys and agents) with precomputed SPRT |
| `usePrincipalEntitiesQuery` | Query | Association table scoping principals to specific organizations |
| `usePrincipalEntityQuery` | Query | Association table scoping principals to specific organizations |
| `useCreatePrincipalEntityMutation` | Mutation | Association table scoping principals to specific organizations |
| `useUpdatePrincipalEntityMutation` | Mutation | Association table scoping principals to specific organizations |
| `useDeletePrincipalEntityMutation` | Mutation | Association table scoping principals to specific organizations |
| `usePrincipalScopeOverridesQuery` | Query | Per-scope capability overrides for principals. No row = full access; row exists = apply restrictions. |
| `usePrincipalScopeOverrideQuery` | Query | Per-scope capability overrides for principals. No row = full access; row exists = apply restrictions. |
| `useCreatePrincipalScopeOverrideMutation` | Mutation | Per-scope capability overrides for principals. No row = full access; row exists = apply restrictions. |
| `useUpdatePrincipalScopeOverrideMutation` | Mutation | Per-scope capability overrides for principals. No row = full access; row exists = apply restrictions. |
| `useDeletePrincipalScopeOverrideMutation` | Mutation | Per-scope capability overrides for principals. No row = full access; row exists = apply restrictions. |
| `useRoleTypesQuery` | Query | List all roleTypes |
| `useRoleTypeQuery` | Query | Get one roleType |
| `useCreateRoleTypeMutation` | Mutation | Create a roleType |
| `useUpdateRoleTypeMutation` | Mutation | Update a roleType |
| `useDeleteRoleTypeMutation` | Mutation | Delete a roleType |
| `useUserConnectedAccountsQuery` | Query | List all userConnectedAccounts |
| `useUserConnectedAccountQuery` | Query | Get one userConnectedAccount |
| `useCreateUserConnectedAccountMutation` | Mutation | Create a userConnectedAccount |
| `useUpdateUserConnectedAccountMutation` | Mutation | Update a userConnectedAccount |
| `useDeleteUserConnectedAccountMutation` | Mutation | Delete a userConnectedAccount |
| `useUsersQuery` | Query | List all users |
| `useUserQuery` | Query | Get one user |
| `useCreateUserMutation` | Mutation | Create a user |
| `useUpdateUserMutation` | Mutation | Update a user |
| `useDeleteUserMutation` | Mutation | Delete a user |
| `useUserSettingsQuery` | Query | Per-user settings and preferences. Extended by other modules (i18n, notifications, MFA) via metaschema.create_field(). |
| `useUserSettingQuery` | Query | Per-user settings and preferences. Extended by other modules (i18n, notifications, MFA) via metaschema.create_field(). |
| `useCreateUserSettingMutation` | Mutation | Per-user settings and preferences. Extended by other modules (i18n, notifications, MFA) via metaschema.create_field(). |
| `useUpdateUserSettingMutation` | Mutation | Per-user settings and preferences. Extended by other modules (i18n, notifications, MFA) via metaschema.create_field(). |
| `useDeleteUserSettingMutation` | Mutation | Per-user settings and preferences. Extended by other modules (i18n, notifications, MFA) via metaschema.create_field(). |
| `useUserSettingsSecuritiesQuery` | Query | Per-user security settings for MFA configuration (separate from user_settings preferences) |
| `useUserSettingsSecurityQuery` | Query | Per-user security settings for MFA configuration (separate from user_settings preferences) |
| `useCreateUserSettingsSecurityMutation` | Mutation | Per-user security settings for MFA configuration (separate from user_settings preferences) |
| `useUpdateUserSettingsSecurityMutation` | Mutation | Per-user security settings for MFA configuration (separate from user_settings preferences) |
| `useDeleteUserSettingsSecurityMutation` | Mutation | Per-user security settings for MFA configuration (separate from user_settings preferences) |
| `useWebauthnCredentialsQuery` | Query | WebAuthn/passkey credentials owned by users. One row per registered authenticator (security key, device biometric, synced passkey). Schema mirrors SimpleWebAuthn's canonical Passkey object. |
| `useWebauthnCredentialQuery` | Query | WebAuthn/passkey credentials owned by users. One row per registered authenticator (security key, device biometric, synced passkey). Schema mirrors SimpleWebAuthn's canonical Passkey object. |
| `useCreateWebauthnCredentialMutation` | Mutation | WebAuthn/passkey credentials owned by users. One row per registered authenticator (security key, device biometric, synced passkey). Schema mirrors SimpleWebAuthn's canonical Passkey object. |
| `useUpdateWebauthnCredentialMutation` | Mutation | WebAuthn/passkey credentials owned by users. One row per registered authenticator (security key, device biometric, synced passkey). Schema mirrors SimpleWebAuthn's canonical Passkey object. |
| `useDeleteWebauthnCredentialMutation` | Mutation | WebAuthn/passkey credentials owned by users. One row per registered authenticator (security key, device biometric, synced passkey). Schema mirrors SimpleWebAuthn's canonical Passkey object. |
| `useCurrentIpAddressQuery` | Query | currentIpAddress |
| `useCurrentUserQuery` | Query | currentUser |
| `useCurrentUserAgentQuery` | Query | currentUserAgent |
| `useCurrentUserIdQuery` | Query | currentUserId |
| `useGetMfaStatusQuery` | Query | getMfaStatus |
| `useRequireStepUpQuery` | Query | requireStepUp |
| `useApproveDeviceMutation` | Mutation | approveDevice |
| `useCheckPasswordMutation` | Mutation | checkPassword |
| `useCompleteMfaChallengeMutation` | Mutation | completeMfaChallenge |
| `useConfirmDeleteAccountMutation` | Mutation | confirmDeleteAccount |
| `useConfirmTotpSetupMutation` | Mutation | confirmTotpSetup |
| `useCreateApiKeyMutation` | Mutation | Mint an API key for the current user; the plaintext key is returned once. access_level: full_access (default) or read_only. mfa_level: none (default) or verified; verified needs a fresh MFA proof on the calling session. A key minted while authenticated by another API key never outlives that key. |
| `useCreateChildPrincipalMutation` | Mutation | createChildPrincipal |
| `useCreateOrgApiKeyMutation` | Mutation | createOrgApiKey |
| `useCreateOrgPrincipalMutation` | Mutation | createOrgPrincipal |
| `useCreatePrincipalFromPresetMutation` | Mutation | createPrincipalFromPreset |
| `useDeleteOrgPrincipalMutation` | Mutation | deleteOrgPrincipal |
| `useDeletePrincipalMutation` | Mutation | deletePrincipal |
| `useDisableEmailMfaMutation` | Mutation | disableEmailMfa |
| `useDisableSmsMfaMutation` | Mutation | disableSmsMfa |
| `useDisableTotpMutation` | Mutation | disableTotp |
| `useDisconnectAccountMutation` | Mutation | disconnectAccount |
| `useEnableEmailMfaMutation` | Mutation | enableEmailMfa |
| `useEnableSmsMfaMutation` | Mutation | enableSmsMfa |
| `useEnableTotpMutation` | Mutation | enableTotp |
| `useExchangeNativeHandoffMutation` | Mutation | exchangeNativeHandoff |
| `useExtendTokenExpiresMutation` | Mutation | extendTokenExpires |
| `useForgotPasswordMutation` | Mutation | forgotPassword |
| `useGenerateBackupCodesMutation` | Mutation | generateBackupCodes |
| `useLinkIdentityMutation` | Mutation | linkIdentity |
| `useMintAccessTokenMutation` | Mutation | mintAccessToken |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |
| `useRefreshAccessTokenMutation` | Mutation | refreshAccessToken |
| `useRequestCrossOriginTokenMutation` | Mutation | requestCrossOriginToken |
| `useRequestMagicLinkMutation` | Mutation | requestMagicLink |
| `useResetPasswordMutation` | Mutation | resetPassword |
| `useRevokeApiKeyMutation` | Mutation | revokeApiKey |
| `useRevokeOrgApiKeyMutation` | Mutation | revokeOrgApiKey |
| `useRevokeSessionMutation` | Mutation | revokeSession |
| `useSendAccountDeletionEmailMutation` | Mutation | sendAccountDeletionEmail |
| `useSendMfaChallengeCodeMutation` | Mutation | sendMfaChallengeCode |
| `useSendPhoneVerificationCodeMutation` | Mutation | sendPhoneVerificationCode |
| `useSendSmsOtpMutation` | Mutation | sendSmsOtp |
| `useSendStepUpCodeMutation` | Mutation | sendStepUpCode |
| `useSendVerificationEmailMutation` | Mutation | sendVerificationEmail |
| `useSetPasswordMutation` | Mutation | setPassword |
| `useSetPrincipalEntitiesMutation` | Mutation | setPrincipalEntities |
| `useSetPrincipalScopeMutation` | Mutation | setPrincipalScope |
| `useSignInMutation` | Mutation | signIn |
| `useSignInCrossOriginMutation` | Mutation | signInCrossOrigin |
| `useSignInMagicLinkMutation` | Mutation | signInMagicLink |
| `useSignInSmsOtpMutation` | Mutation | signInSmsOtp |
| `useSignOutMutation` | Mutation | signOut |
| `useSignUpMutation` | Mutation | signUp |
| `useSignUpMagicLinkMutation` | Mutation | signUpMagicLink |
| `useSignUpSmsMutation` | Mutation | signUpSms |
| `useUpdatePrincipalMutation` | Mutation | updatePrincipal |
| `useVerifyEmailMutation` | Mutation | verifyEmail |
| `useVerifyPasswordMutation` | Mutation | verifyPassword |
| `useVerifyPhoneMutation` | Mutation | verifyPhone |
| `useVerifyStepUpCodeMutation` | Mutation | verifyStepUpCode |
| `useVerifyTotpMutation` | Mutation | verifyTotp |

## Table Hooks

### AuditLogAuth

```typescript
// List all auditLogAuths
const { data, isLoading } = useAuditLogAuthsQuery({
  selection: { fields: { actorId: true, createdAt: true, details: true, event: true, id: true, ipAddress: true, origin: true, success: true, userAgent: true } },
});

// Get one auditLogAuth
const { data: item } = useAuditLogAuthQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, details: true, event: true, id: true, ipAddress: true, origin: true, success: true, userAgent: true } },
});

// Create a auditLogAuth
const { mutate: create } = useCreateAuditLogAuthMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', details: '<JSON>', event: '<String>', ipAddress: '<InternetAddress>', origin: '<Origin>', success: '<Boolean>', userAgent: '<String>' });
```

### CryptoAddress

```typescript
// List all cryptoAddresses
const { data, isLoading } = useCryptoAddressesQuery({
  selection: { fields: { address: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } },
});

// Get one cryptoAddress
const { data: item } = useCryptoAddressQuery({
  id: '<UUID>',
  selection: { fields: { address: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } },
});

// Create a cryptoAddress
const { mutate: create } = useCreateCryptoAddressMutation({
  selection: { fields: { id: true } },
});
create({ address: '<String>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', ownerId: '<UUID>' });
```

### Email

```typescript
// List all emails
const { data, isLoading } = useEmailsQuery({
  selection: { fields: { createdAt: true, email: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } },
});

// Get one email
const { data: item } = useEmailQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, email: true, id: true, isPrimary: true, isVerified: true, name: true, ownerId: true, updatedAt: true } },
});

// Create a email
const { mutate: create } = useCreateEmailMutation({
  selection: { fields: { id: true } },
});
create({ email: '<Email>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', ownerId: '<UUID>' });
```

### IdentityProvider

```typescript
// List all identityProviders
const { data, isLoading } = useIdentityProvidersQuery({
  selection: { fields: { displayName: true, enabled: true, kind: true, slug: true } },
});

// Create a identityProvider
const { mutate: create } = useCreateIdentityProviderMutation({
  selection: { fields: { id: true } },
});
create({ displayName: '<String>', enabled: '<Boolean>', kind: '<String>', slug: '<String>' });
```

### OrgApiKeyList

```typescript
// List all orgApiKeyLists
const { data, isLoading } = useOrgApiKeyListsQuery({
  selection: { fields: { accessLevel: true, createdAt: true, expiresAt: true, id: true, keyId: true, lastUsedAt: true, mfaLevel: true, name: true, orgId: true, principalId: true, revokedAt: true, updatedAt: true } },
});

// Get one orgApiKeyList
const { data: item } = useOrgApiKeyListQuery({
  id: '<UUID>',
  selection: { fields: { accessLevel: true, createdAt: true, expiresAt: true, id: true, keyId: true, lastUsedAt: true, mfaLevel: true, name: true, orgId: true, principalId: true, revokedAt: true, updatedAt: true } },
});

// Create a orgApiKeyList
const { mutate: create } = useCreateOrgApiKeyListMutation({
  selection: { fields: { id: true } },
});
create({ accessLevel: '<String>', expiresAt: '<Datetime>', keyId: '<String>', lastUsedAt: '<Datetime>', mfaLevel: '<String>', name: '<String>', orgId: '<UUID>', principalId: '<UUID>', revokedAt: '<Datetime>' });
```

### PhoneNumber

```typescript
// List all phoneNumbers
const { data, isLoading } = usePhoneNumbersQuery({
  selection: { fields: { cc: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, number: true, ownerId: true, updatedAt: true } },
});

// Get one phoneNumber
const { data: item } = usePhoneNumberQuery({
  id: '<UUID>',
  selection: { fields: { cc: true, createdAt: true, id: true, isPrimary: true, isVerified: true, name: true, number: true, ownerId: true, updatedAt: true } },
});

// Create a phoneNumber
const { mutate: create } = useCreatePhoneNumberMutation({
  selection: { fields: { id: true } },
});
create({ cc: '<String>', isPrimary: '<Boolean>', isVerified: '<Boolean>', name: '<String>', number: '<String>', ownerId: '<UUID>' });
```

### Principal

```typescript
// List all principals
const { data, isLoading } = usePrincipalsQuery({
  selection: { fields: { apiKeyMaxDuration: true, bypassStepUp: true, createdAt: true, createdBySessionId: true, depth: true, expiresAt: true, id: true, isReadOnly: true, name: true, ownerId: true, parentPrincipalId: true, updatedAt: true, useAdminOwner: true, userId: true } },
});

// Get one principal
const { data: item } = usePrincipalQuery({
  principalId: '<UUID>',
  selection: { fields: { apiKeyMaxDuration: true, bypassStepUp: true, createdAt: true, createdBySessionId: true, depth: true, expiresAt: true, id: true, isReadOnly: true, name: true, ownerId: true, parentPrincipalId: true, updatedAt: true, useAdminOwner: true, userId: true } },
});

// Create a principal
const { mutate: create } = useCreatePrincipalMutation({
  selection: { fields: { principalId: true } },
});
create({ apiKeyMaxDuration: '<Interval>', bypassStepUp: '<Boolean>', createdBySessionId: '<UUID>', depth: '<Int>', expiresAt: '<Datetime>', id: '<UUID>', isReadOnly: '<Boolean>', name: '<String>', ownerId: '<UUID>', parentPrincipalId: '<UUID>', useAdminOwner: '<Boolean>', userId: '<UUID>' });
```

### PrincipalEntity

```typescript
// List all principalEntities
const { data, isLoading } = usePrincipalEntitiesQuery({
  selection: { fields: { createdAt: true, entityId: true, id: true, ownerId: true, principalId: true, updatedAt: true } },
});

// Get one principalEntity
const { data: item } = usePrincipalEntityQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, entityId: true, id: true, ownerId: true, principalId: true, updatedAt: true } },
});

// Create a principalEntity
const { mutate: create } = useCreatePrincipalEntityMutation({
  selection: { fields: { id: true } },
});
create({ entityId: '<UUID>', ownerId: '<UUID>', principalId: '<UUID>' });
```

### PrincipalScopeOverride

```typescript
// List all principalScopeOverrides
const { data, isLoading } = usePrincipalScopeOverridesQuery({
  selection: { fields: { allowedMask: true, createdAt: true, id: true, isActive: true, isReadOnly: true, membershipType: true, principalId: true, updatedAt: true, useAdminOwner: true } },
});

// Get one principalScopeOverride
const { data: item } = usePrincipalScopeOverrideQuery({
  id: '<UUID>',
  selection: { fields: { allowedMask: true, createdAt: true, id: true, isActive: true, isReadOnly: true, membershipType: true, principalId: true, updatedAt: true, useAdminOwner: true } },
});

// Create a principalScopeOverride
const { mutate: create } = useCreatePrincipalScopeOverrideMutation({
  selection: { fields: { id: true } },
});
create({ allowedMask: '<BitString>', isActive: '<Boolean>', isReadOnly: '<Boolean>', membershipType: '<Int>', principalId: '<UUID>', useAdminOwner: '<Boolean>' });
```

### RoleType

```typescript
// List all roleTypes
const { data, isLoading } = useRoleTypesQuery({
  selection: { fields: { id: true, name: true } },
});

// Get one roleType
const { data: item } = useRoleTypeQuery({
  id: '<Int>',
  selection: { fields: { id: true, name: true } },
});

// Create a roleType
const { mutate: create } = useCreateRoleTypeMutation({
  selection: { fields: { id: true } },
});
create({ name: '<String>' });
```

### UserConnectedAccount

```typescript
// List all userConnectedAccounts
const { data, isLoading } = useUserConnectedAccountsQuery({
  selection: { fields: { createdAt: true, details: true, id: true, identifier: true, isVerified: true, ownerId: true, service: true, updatedAt: true } },
});

// Get one userConnectedAccount
const { data: item } = useUserConnectedAccountQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, details: true, id: true, identifier: true, isVerified: true, ownerId: true, service: true, updatedAt: true } },
});

// Create a userConnectedAccount
const { mutate: create } = useCreateUserConnectedAccountMutation({
  selection: { fields: { id: true } },
});
create({ details: '<JSON>', identifier: '<String>', isVerified: '<Boolean>', ownerId: '<UUID>', service: '<String>' });
```

### User

```typescript
// List all users
const { data, isLoading } = useUsersQuery({
  selection: { fields: { createdAt: true, displayName: true, displayNameTrgmSimilarity: true, id: true, profilePicture: true, searchScore: true, searchTsv: true, searchTsvRank: true, type: true, updatedAt: true, username: true } },
});

// Get one user
const { data: item } = useUserQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, displayName: true, displayNameTrgmSimilarity: true, id: true, profilePicture: true, searchScore: true, searchTsv: true, searchTsvRank: true, type: true, updatedAt: true, username: true } },
});

// Create a user
const { mutate: create } = useCreateUserMutation({
  selection: { fields: { id: true } },
});
create({ displayName: '<String>', displayNameTrgmSimilarity: '<Float>', profilePicture: '<Image>', searchScore: '<Float>', searchTsv: '<FullText>', searchTsvRank: '<Float>', type: '<Int>', username: '<String>' });
```

### UserSetting

```typescript
// List all userSettings
const { data, isLoading } = useUserSettingsQuery({
  selection: { fields: { createdAt: true, id: true, ownerId: true, updatedAt: true } },
});

// Get one userSetting
const { data: item } = useUserSettingQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, id: true, ownerId: true, updatedAt: true } },
});

// Create a userSetting
const { mutate: create } = useCreateUserSettingMutation({
  selection: { fields: { id: true } },
});
create({ ownerId: '<UUID>' });
```

### UserSettingsSecurity

```typescript
// List all userSettingsSecurities
const { data, isLoading } = useUserSettingsSecuritiesQuery({
  selection: { fields: { backupCodesCount: true, createdAt: true, emailMfaEnabled: true, id: true, mfaEnrolledAt: true, mfaLastUsedAt: true, ownerId: true, smsMfaEnabled: true, totpEnabled: true, updatedAt: true } },
});

// Get one userSettingsSecurity
const { data: item } = useUserSettingsSecurityQuery({
  id: '<UUID>',
  selection: { fields: { backupCodesCount: true, createdAt: true, emailMfaEnabled: true, id: true, mfaEnrolledAt: true, mfaLastUsedAt: true, ownerId: true, smsMfaEnabled: true, totpEnabled: true, updatedAt: true } },
});

// Create a userSettingsSecurity
const { mutate: create } = useCreateUserSettingsSecurityMutation({
  selection: { fields: { id: true } },
});
create({ backupCodesCount: '<Int>', emailMfaEnabled: '<Boolean>', mfaEnrolledAt: '<Datetime>', mfaLastUsedAt: '<Datetime>', ownerId: '<UUID>', smsMfaEnabled: '<Boolean>', totpEnabled: '<Boolean>' });
```

### WebauthnCredential

```typescript
// List all webauthnCredentials
const { data, isLoading } = useWebauthnCredentialsQuery({
  selection: { fields: { backupEligible: true, backupState: true, createdAt: true, credentialDeviceType: true, credentialId: true, id: true, lastUsedAt: true, name: true, ownerId: true, publicKey: true, signCount: true, transports: true, updatedAt: true, webauthnUserId: true } },
});

// Get one webauthnCredential
const { data: item } = useWebauthnCredentialQuery({
  id: '<UUID>',
  selection: { fields: { backupEligible: true, backupState: true, createdAt: true, credentialDeviceType: true, credentialId: true, id: true, lastUsedAt: true, name: true, ownerId: true, publicKey: true, signCount: true, transports: true, updatedAt: true, webauthnUserId: true } },
});

// Create a webauthnCredential
const { mutate: create } = useCreateWebauthnCredentialMutation({
  selection: { fields: { id: true } },
});
create({ backupEligible: '<Boolean>', backupState: '<Boolean>', credentialDeviceType: '<String>', credentialId: '<String>', lastUsedAt: '<Datetime>', name: '<String>', ownerId: '<UUID>', publicKey: '<Base64EncodedBinary>', signCount: '<BigInt>', transports: '<String>', webauthnUserId: '<String>' });
```

## Custom Operation Hooks

### `useCurrentIpAddressQuery`

currentIpAddress

- **Type:** query
- **Arguments:** none

### `useCurrentUserQuery`

currentUser

- **Type:** query
- **Arguments:** none

### `useCurrentUserAgentQuery`

currentUserAgent

- **Type:** query
- **Arguments:** none

### `useCurrentUserIdQuery`

currentUserId

- **Type:** query
- **Arguments:** none

### `useGetMfaStatusQuery`

getMfaStatus

- **Type:** query
- **Arguments:** none

### `useRequireStepUpQuery`

requireStepUp

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `stepUpType` | String |

### `useApproveDeviceMutation`

approveDevice

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ApproveDeviceInput (required) |

### `useCheckPasswordMutation`

checkPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CheckPasswordInput (required) |

### `useCompleteMfaChallengeMutation`

completeMfaChallenge

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CompleteMfaChallengeInput (required) |

### `useConfirmDeleteAccountMutation`

confirmDeleteAccount

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ConfirmDeleteAccountInput (required) |

### `useConfirmTotpSetupMutation`

confirmTotpSetup

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ConfirmTotpSetupInput (required) |

### `useCreateApiKeyMutation`

Mint an API key for the current user; the plaintext key is returned once. access_level: full_access (default) or read_only. mfa_level: none (default) or verified; verified needs a fresh MFA proof on the calling session. A key minted while authenticated by another API key never outlives that key.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateApiKeyInput (required) |

### `useCreateChildPrincipalMutation`

createChildPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateChildPrincipalInput (required) |

### `useCreateOrgApiKeyMutation`

createOrgApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateOrgApiKeyInput (required) |

### `useCreateOrgPrincipalMutation`

createOrgPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreateOrgPrincipalInput (required) |

### `useCreatePrincipalFromPresetMutation`

createPrincipalFromPreset

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | CreatePrincipalFromPresetInput (required) |

### `useDeleteOrgPrincipalMutation`

deleteOrgPrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DeleteOrgPrincipalInput (required) |

### `useDeletePrincipalMutation`

deletePrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DeletePrincipalInput (required) |

### `useDisableEmailMfaMutation`

disableEmailMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableEmailMfaInput (required) |

### `useDisableSmsMfaMutation`

disableSmsMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableSmsMfaInput (required) |

### `useDisableTotpMutation`

disableTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisableTotpInput (required) |

### `useDisconnectAccountMutation`

disconnectAccount

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | DisconnectAccountInput (required) |

### `useEnableEmailMfaMutation`

enableEmailMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableEmailMfaInput (required) |

### `useEnableSmsMfaMutation`

enableSmsMfa

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableSmsMfaInput (required) |

### `useEnableTotpMutation`

enableTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | EnableTotpInput (required) |

### `useExchangeNativeHandoffMutation`

exchangeNativeHandoff

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ExchangeNativeHandoffInput (required) |

### `useExtendTokenExpiresMutation`

extendTokenExpires

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ExtendTokenExpiresInput (required) |

### `useForgotPasswordMutation`

forgotPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ForgotPasswordInput (required) |

### `useGenerateBackupCodesMutation`

generateBackupCodes

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | GenerateBackupCodesInput (required) |

### `useLinkIdentityMutation`

linkIdentity

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | LinkIdentityInput (required) |

### `useMintAccessTokenMutation`

mintAccessToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | MintAccessTokenInput (required) |

### `useProvisionBucketMutation`

Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors.

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionBucketInput (required) |

### `useRefreshAccessTokenMutation`

refreshAccessToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RefreshAccessTokenInput (required) |

### `useRequestCrossOriginTokenMutation`

requestCrossOriginToken

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RequestCrossOriginTokenInput (required) |

### `useRequestMagicLinkMutation`

requestMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RequestMagicLinkInput (required) |

### `useResetPasswordMutation`

resetPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ResetPasswordInput (required) |

### `useRevokeApiKeyMutation`

revokeApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeApiKeyInput (required) |

### `useRevokeOrgApiKeyMutation`

revokeOrgApiKey

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeOrgApiKeyInput (required) |

### `useRevokeSessionMutation`

revokeSession

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | RevokeSessionInput (required) |

### `useSendAccountDeletionEmailMutation`

sendAccountDeletionEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendAccountDeletionEmailInput (required) |

### `useSendMfaChallengeCodeMutation`

sendMfaChallengeCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendMfaChallengeCodeInput (required) |

### `useSendPhoneVerificationCodeMutation`

sendPhoneVerificationCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendPhoneVerificationCodeInput (required) |

### `useSendSmsOtpMutation`

sendSmsOtp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendSmsOtpInput (required) |

### `useSendStepUpCodeMutation`

sendStepUpCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendStepUpCodeInput (required) |

### `useSendVerificationEmailMutation`

sendVerificationEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SendVerificationEmailInput (required) |

### `useSetPasswordMutation`

setPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPasswordInput (required) |

### `useSetPrincipalEntitiesMutation`

setPrincipalEntities

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPrincipalEntitiesInput (required) |

### `useSetPrincipalScopeMutation`

setPrincipalScope

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SetPrincipalScopeInput (required) |

### `useSignInMutation`

signIn

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInInput (required) |

### `useSignInCrossOriginMutation`

signInCrossOrigin

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInCrossOriginInput (required) |

### `useSignInMagicLinkMutation`

signInMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInMagicLinkInput (required) |

### `useSignInSmsOtpMutation`

signInSmsOtp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignInSmsOtpInput (required) |

### `useSignOutMutation`

signOut

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignOutInput (required) |

### `useSignUpMutation`

signUp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpInput (required) |

### `useSignUpMagicLinkMutation`

signUpMagicLink

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpMagicLinkInput (required) |

### `useSignUpSmsMutation`

signUpSms

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SignUpSmsInput (required) |

### `useUpdatePrincipalMutation`

updatePrincipal

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | UpdatePrincipalInput (required) |

### `useVerifyEmailMutation`

verifyEmail

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyEmailInput (required) |

### `useVerifyPasswordMutation`

verifyPassword

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyPasswordInput (required) |

### `useVerifyPhoneMutation`

verifyPhone

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyPhoneInput (required) |

### `useVerifyStepUpCodeMutation`

verifyStepUpCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyStepUpCodeInput (required) |

### `useVerifyTotpMutation`

verifyTotp

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | VerifyTotpInput (required) |
