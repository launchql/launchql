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
| `useAppAdminGrantsQuery` | Query | Records of admin role grants and revocations between members |
| `useAppAdminGrantQuery` | Query | Records of admin role grants and revocations between members |
| `useCreateAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useUpdateAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useDeleteAppAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useAppCapabilityDefaultCapabilitiesQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useAppCapabilityDefaultCapabilityQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useCreateAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useUpdateAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useDeleteAppCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useAppCapabilityDefaultGrantsQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useAppCapabilityDefaultGrantQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useCreateAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useUpdateAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useDeleteAppCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useAppClaimedInvitesQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useAppClaimedInviteQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useCreateAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useUpdateAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useDeleteAppClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useAppGrantsQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useAppGrantQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useCreateAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useUpdateAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useDeleteAppGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useAppInvitesQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useAppInviteQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useCreateAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useUpdateAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useDeleteAppInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useAppMembershipsQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useAppMembershipQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useCreateAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useUpdateAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useDeleteAppMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useAppMembershipDefaultsQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useAppMembershipDefaultQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useCreateAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useUpdateAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useDeleteAppMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useAppOwnerGrantsQuery` | Query | Records of ownership transfers and grants between members |
| `useAppOwnerGrantQuery` | Query | Records of ownership transfers and grants between members |
| `useCreateAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useUpdateAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useDeleteAppOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useMembershipTypesQuery` | Query | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useMembershipTypeQuery` | Query | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useCreateMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useUpdateMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useDeleteMembershipTypeMutation` | Mutation | Defines the different scopes of membership (e.g. App Member, Organization Member, Group Member) |
| `useMyPendingAppInvitesQuery` | Query | List all myPendingAppInvites |
| `useMyPendingAppInvitesRecordQuery` | Query | Get one myPendingAppInvitesRecord |
| `useCreateMyPendingAppInvitesRecordMutation` | Mutation | Create a myPendingAppInvitesRecord |
| `useUpdateMyPendingAppInvitesRecordMutation` | Mutation | Update a myPendingAppInvitesRecord |
| `useDeleteMyPendingAppInvitesRecordMutation` | Mutation | Delete a myPendingAppInvitesRecord |
| `useMyPendingOrgInvitesQuery` | Query | List all myPendingOrgInvites |
| `useMyPendingOrgInvitesRecordQuery` | Query | Get one myPendingOrgInvitesRecord |
| `useCreateMyPendingOrgInvitesRecordMutation` | Mutation | Create a myPendingOrgInvitesRecord |
| `useUpdateMyPendingOrgInvitesRecordMutation` | Mutation | Update a myPendingOrgInvitesRecord |
| `useDeleteMyPendingOrgInvitesRecordMutation` | Mutation | Delete a myPendingOrgInvitesRecord |
| `useOrgAdminGrantsQuery` | Query | Records of admin role grants and revocations between members |
| `useOrgAdminGrantQuery` | Query | Records of admin role grants and revocations between members |
| `useCreateOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useUpdateOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useDeleteOrgAdminGrantMutation` | Mutation | Records of admin role grants and revocations between members |
| `useOrgCapabilityDefaultCapabilitiesQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useOrgCapabilityDefaultCapabilityQuery` | Query | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useCreateOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useUpdateOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useDeleteOrgCapabilityDefaultCapabilityMutation` | Mutation | Join table linking capability defaults to individual capabilities; recompute trigger rebuilds the defaults bitmask |
| `useOrgCapabilityDefaultGrantsQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useOrgCapabilityDefaultGrantQuery` | Query | Audit log of capability additions and removals from the defaults bitmask |
| `useCreateOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useUpdateOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useDeleteOrgCapabilityDefaultGrantMutation` | Mutation | Audit log of capability additions and removals from the defaults bitmask |
| `useOrgChartEdgesQuery` | Query | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useOrgChartEdgeQuery` | Query | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useCreateOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useUpdateOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useDeleteOrgChartEdgeMutation` | Mutation | Organizational chart edges defining parent-child reporting relationships between members within an entity |
| `useOrgChartEdgeGrantsQuery` | Query | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useOrgChartEdgeGrantQuery` | Query | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useCreateOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useUpdateOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useDeleteOrgChartEdgeGrantMutation` | Mutation | Append-only log of hierarchy edge grants and revocations; triggers apply changes to the edges table |
| `useOrgClaimedInvitesQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useOrgClaimedInviteQuery` | Query | Records of successfully claimed invitations, linking senders to receivers |
| `useCreateOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useUpdateOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useDeleteOrgClaimedInviteMutation` | Mutation | Records of successfully claimed invitations, linking senders to receivers |
| `useOrgGetManagersQuery` | Query | List all orgGetManagers |
| `useCreateOrgGetManagersRecordMutation` | Mutation | Create a orgGetManagersRecord |
| `useOrgGetSubordinatesQuery` | Query | List all orgGetSubordinates |
| `useCreateOrgGetSubordinatesRecordMutation` | Mutation | Create a orgGetSubordinatesRecord |
| `useOrgGrantsQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useOrgGrantQuery` | Query | Records of individual capability grants and revocations for members via bitmask |
| `useCreateOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useUpdateOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useDeleteOrgGrantMutation` | Mutation | Records of individual capability grants and revocations for members via bitmask |
| `useOrgInvitesQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useOrgInviteQuery` | Query | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useCreateOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useUpdateOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useDeleteOrgInviteMutation` | Mutation | Invitation records sent to prospective members via email, with token-based redemption and expiration |
| `useOrgMembersQuery` | Query | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useOrgMemberQuery` | Query | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useCreateOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useUpdateOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useDeleteOrgMemberMutation` | Mutation | Simplified view of active members in an entity, used for listing who belongs to an org or group |
| `useOrgMemberProfilesQuery` | Query | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useOrgMemberProfileQuery` | Query | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useCreateOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useUpdateOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useDeleteOrgMemberProfileMutation` | Mutation | Per-membership profile information visible to other entity members (display name, email, title, bio, avatar) |
| `useOrgMembershipsQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useOrgMembershipQuery` | Query | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useCreateOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useUpdateOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useDeleteOrgMembershipMutation` | Mutation | Tracks membership records linking actors to entities with capability bitmasks, ownership, and admin status |
| `useOrgMembershipDefaultsQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useOrgMembershipDefaultQuery` | Query | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useCreateOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useUpdateOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useDeleteOrgMembershipDefaultMutation` | Mutation | Default membership settings per entity, controlling initial approval and verification state for new members |
| `useOrgMembershipSettingsQuery` | Query | Per-entity settings for the memberships module |
| `useOrgMembershipSettingQuery` | Query | Per-entity settings for the memberships module |
| `useCreateOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useUpdateOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useDeleteOrgMembershipSettingMutation` | Mutation | Per-entity settings for the memberships module |
| `useOrgOwnerGrantsQuery` | Query | Records of ownership transfers and grants between members |
| `useOrgOwnerGrantQuery` | Query | Records of ownership transfers and grants between members |
| `useCreateOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useUpdateOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useDeleteOrgOwnerGrantMutation` | Mutation | Records of ownership transfers and grants between members |
| `useGetOrganizationIdQuery` | Query | getOrganizationId |
| `useOrgIsManagerOfQuery` | Query | orgIsManagerOf |
| `useAcceptAppInviteMutation` | Mutation | acceptAppInvite |
| `useAcceptOrgInviteMutation` | Mutation | acceptOrgInvite |
| `useProvisionAppUserMutation` | Mutation | provisionAppUser |
| `useProvisionAppUsersBulkMutation` | Mutation | provisionAppUsersBulk |
| `useProvisionBucketMutation` | Mutation | Reconcile an S3 bucket for a logical bucket in the database.
Records the request on the bucket row via RLS; the bucket's job
trigger then enqueues the same storage:provision_bucket job used on
INSERT, and repeated requests collapse into one pending job. This is
idempotent for an already-reconciled bucket; failures become GraphQL
errors. |
| `useProvisionOrgUserMutation` | Mutation | provisionOrgUser |
| `useProvisionOrgUsersBulkMutation` | Mutation | provisionOrgUsersBulk |
| `useSubmitAppInviteCodeMutation` | Mutation | submitAppInviteCode |
| `useSubmitOrgInviteCodeMutation` | Mutation | submitOrgInviteCode |

## Table Hooks

### AppAdminGrant

```typescript
// List all appAdminGrants
const { data, isLoading } = useAppAdminGrantsQuery({
  selection: { fields: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one appAdminGrant
const { data: item } = useAppAdminGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a appAdminGrant
const { mutate: create } = useCreateAppAdminGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### AppCapabilityDefaultCapability

```typescript
// List all appCapabilityDefaultCapabilities
const { data, isLoading } = useAppCapabilityDefaultCapabilitiesQuery({
  selection: { fields: { capabilityId: true, createdAt: true, id: true, updatedAt: true } },
});

// Get one appCapabilityDefaultCapability
const { data: item } = useAppCapabilityDefaultCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { capabilityId: true, createdAt: true, id: true, updatedAt: true } },
});

// Create a appCapabilityDefaultCapability
const { mutate: create } = useCreateAppCapabilityDefaultCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>' });
```

### AppCapabilityDefaultGrant

```typescript
// List all appCapabilityDefaultGrants
const { data, isLoading } = useAppCapabilityDefaultGrantsQuery({
  selection: { fields: { capabilityId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one appCapabilityDefaultGrant
const { data: item } = useAppCapabilityDefaultGrantQuery({
  id: '<UUID>',
  selection: { fields: { capabilityId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a appCapabilityDefaultGrant
const { mutate: create } = useCreateAppCapabilityDefaultGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### AppClaimedInvite

```typescript
// List all appClaimedInvites
const { data, isLoading } = useAppClaimedInvitesQuery({
  selection: { fields: { createdAt: true, data: true, id: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Get one appClaimedInvite
const { data: item } = useAppClaimedInviteQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, id: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Create a appClaimedInvite
const { mutate: create } = useCreateAppClaimedInviteMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', receiverId: '<UUID>', senderId: '<UUID>' });
```

### AppGrant

```typescript
// List all appGrants
const { data, isLoading } = useAppGrantsQuery({
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one appGrant
const { data: item } = useAppGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a appGrant
const { mutate: create } = useCreateAppGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', capabilities: '<BitString>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### AppInvite

```typescript
// List all appInvites
const { data, isLoading } = useAppInvitesQuery({
  selection: { fields: { channel: true, createdAt: true, data: true, email: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, multiple: true, phone: true, profileId: true, senderId: true, updatedAt: true } },
});

// Get one appInvite
const { data: item } = useAppInviteQuery({
  id: '<UUID>',
  selection: { fields: { channel: true, createdAt: true, data: true, email: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, multiple: true, phone: true, profileId: true, senderId: true, updatedAt: true } },
});

// Create a appInvite
const { mutate: create } = useCreateAppInviteMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', data: '<JSON>', email: '<Email>', expiresAt: '<Datetime>', inviteCount: '<Int>', inviteLimit: '<Int>', inviteToken: '<String>', inviteValid: '<Boolean>', multiple: '<Boolean>', phone: '<String>', profileId: '<UUID>', senderId: '<UUID>' });
```

### AppMembership

```typescript
// List all appMemberships
const { data, isLoading } = useAppMembershipsQuery({
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isOwner: true, isVerified: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one appMembership
const { data: item } = useAppMembershipQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isOwner: true, isVerified: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a appMembership
const { mutate: create } = useCreateAppMembershipMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', capabilities: '<BitString>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', granted: '<BitString>', isActive: '<Boolean>', isAdmin: '<Boolean>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isOwner: '<Boolean>', isVerified: '<Boolean>', profileId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### AppMembershipDefault

```typescript
// List all appMembershipDefaults
const { data, isLoading } = useAppMembershipDefaultsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, isApproved: true, isVerified: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one appMembershipDefault
const { data: item } = useAppMembershipDefaultQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, id: true, isApproved: true, isVerified: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a appMembershipDefault
const { mutate: create } = useCreateAppMembershipDefaultMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', isApproved: '<Boolean>', isVerified: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### AppOwnerGrant

```typescript
// List all appOwnerGrants
const { data, isLoading } = useAppOwnerGrantsQuery({
  selection: { fields: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one appOwnerGrant
const { data: item } = useAppOwnerGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a appOwnerGrant
const { mutate: create } = useCreateAppOwnerGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### MembershipType

```typescript
// List all membershipTypes
const { data, isLoading } = useMembershipTypesQuery({
  selection: { fields: { description: true, hasUsersTableEntry: true, id: true, name: true, parentMembershipType: true, scope: true } },
});

// Get one membershipType
const { data: item } = useMembershipTypeQuery({
  id: '<Int>',
  selection: { fields: { description: true, hasUsersTableEntry: true, id: true, name: true, parentMembershipType: true, scope: true } },
});

// Create a membershipType
const { mutate: create } = useCreateMembershipTypeMutation({
  selection: { fields: { id: true } },
});
create({ description: '<String>', hasUsersTableEntry: '<Boolean>', name: '<String>', parentMembershipType: '<Int>', scope: '<String>' });
```

### MyPendingAppInvitesRecord

```typescript
// List all myPendingAppInvites
const { data, isLoading } = useMyPendingAppInvitesQuery({
  selection: { fields: { channel: true, createdAt: true, expiresAt: true, id: true, senderId: true } },
});

// Get one myPendingAppInvitesRecord
const { data: item } = useMyPendingAppInvitesRecordQuery({
  id: '<UUID>',
  selection: { fields: { channel: true, createdAt: true, expiresAt: true, id: true, senderId: true } },
});

// Create a myPendingAppInvitesRecord
const { mutate: create } = useCreateMyPendingAppInvitesRecordMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', expiresAt: '<Datetime>', senderId: '<UUID>' });
```

### MyPendingOrgInvitesRecord

```typescript
// List all myPendingOrgInvites
const { data, isLoading } = useMyPendingOrgInvitesQuery({
  selection: { fields: { channel: true, createdAt: true, entityId: true, expiresAt: true, id: true, senderId: true } },
});

// Get one myPendingOrgInvitesRecord
const { data: item } = useMyPendingOrgInvitesRecordQuery({
  id: '<UUID>',
  selection: { fields: { channel: true, createdAt: true, entityId: true, expiresAt: true, id: true, senderId: true } },
});

// Create a myPendingOrgInvitesRecord
const { mutate: create } = useCreateMyPendingOrgInvitesRecordMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', entityId: '<UUID>', expiresAt: '<Datetime>', senderId: '<UUID>' });
```

### OrgAdminGrant

```typescript
// List all orgAdminGrants
const { data, isLoading } = useOrgAdminGrantsQuery({
  selection: { fields: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one orgAdminGrant
const { data: item } = useOrgAdminGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a orgAdminGrant
const { mutate: create } = useCreateOrgAdminGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### OrgCapabilityDefaultCapability

```typescript
// List all orgCapabilityDefaultCapabilities
const { data, isLoading } = useOrgCapabilityDefaultCapabilitiesQuery({
  selection: { fields: { capabilityId: true, createdAt: true, entityId: true, id: true, updatedAt: true } },
});

// Get one orgCapabilityDefaultCapability
const { data: item } = useOrgCapabilityDefaultCapabilityQuery({
  id: '<UUID>',
  selection: { fields: { capabilityId: true, createdAt: true, entityId: true, id: true, updatedAt: true } },
});

// Create a orgCapabilityDefaultCapability
const { mutate: create } = useCreateOrgCapabilityDefaultCapabilityMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', entityId: '<UUID>' });
```

### OrgCapabilityDefaultGrant

```typescript
// List all orgCapabilityDefaultGrants
const { data, isLoading } = useOrgCapabilityDefaultGrantsQuery({
  selection: { fields: { capabilityId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one orgCapabilityDefaultGrant
const { data: item } = useOrgCapabilityDefaultGrantQuery({
  id: '<UUID>',
  selection: { fields: { capabilityId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a orgCapabilityDefaultGrant
const { mutate: create } = useCreateOrgCapabilityDefaultGrantMutation({
  selection: { fields: { id: true } },
});
create({ capabilityId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### OrgChartEdge

```typescript
// List all orgChartEdges
const { data, isLoading } = useOrgChartEdgesQuery({
  selection: { fields: { childId: true, createdAt: true, entityId: true, id: true, parentId: true, positionLevel: true, positionTitle: true, updatedAt: true } },
});

// Get one orgChartEdge
const { data: item } = useOrgChartEdgeQuery({
  id: '<UUID>',
  selection: { fields: { childId: true, createdAt: true, entityId: true, id: true, parentId: true, positionLevel: true, positionTitle: true, updatedAt: true } },
});

// Create a orgChartEdge
const { mutate: create } = useCreateOrgChartEdgeMutation({
  selection: { fields: { id: true } },
});
create({ childId: '<UUID>', entityId: '<UUID>', parentId: '<UUID>', positionLevel: '<Int>', positionTitle: '<String>' });
```

### OrgChartEdgeGrant

```typescript
// List all orgChartEdgeGrants
const { data, isLoading } = useOrgChartEdgeGrantsQuery({
  selection: { fields: { childId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, parentId: true, positionLevel: true, positionTitle: true } },
});

// Get one orgChartEdgeGrant
const { data: item } = useOrgChartEdgeGrantQuery({
  id: '<UUID>',
  selection: { fields: { childId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, parentId: true, positionLevel: true, positionTitle: true } },
});

// Create a orgChartEdgeGrant
const { mutate: create } = useCreateOrgChartEdgeGrantMutation({
  selection: { fields: { id: true } },
});
create({ childId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>', parentId: '<UUID>', positionLevel: '<Int>', positionTitle: '<String>' });
```

### OrgClaimedInvite

```typescript
// List all orgClaimedInvites
const { data, isLoading } = useOrgClaimedInvitesQuery({
  selection: { fields: { createdAt: true, data: true, entityId: true, id: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Get one orgClaimedInvite
const { data: item } = useOrgClaimedInviteQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, data: true, entityId: true, id: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Create a orgClaimedInvite
const { mutate: create } = useCreateOrgClaimedInviteMutation({
  selection: { fields: { id: true } },
});
create({ data: '<JSON>', entityId: '<UUID>', receiverId: '<UUID>', senderId: '<UUID>' });
```

### OrgGetManagersRecord

```typescript
// List all orgGetManagers
const { data, isLoading } = useOrgGetManagersQuery({
  selection: { fields: { depth: true, userId: true } },
});

// Create a orgGetManagersRecord
const { mutate: create } = useCreateOrgGetManagersRecordMutation({
  selection: { fields: { id: true } },
});
create({ depth: '<Int>', userId: '<UUID>' });
```

### OrgGetSubordinatesRecord

```typescript
// List all orgGetSubordinates
const { data, isLoading } = useOrgGetSubordinatesQuery({
  selection: { fields: { depth: true, userId: true } },
});

// Create a orgGetSubordinatesRecord
const { mutate: create } = useCreateOrgGetSubordinatesRecordMutation({
  selection: { fields: { id: true } },
});
create({ depth: '<Int>', userId: '<UUID>' });
```

### OrgGrant

```typescript
// List all orgGrants
const { data, isLoading } = useOrgGrantsQuery({
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one orgGrant
const { data: item } = useOrgGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a orgGrant
const { mutate: create } = useCreateOrgGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', capabilities: '<BitString>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

### OrgInvite

```typescript
// List all orgInvites
const { data, isLoading } = useOrgInvitesQuery({
  selection: { fields: { channel: true, createdAt: true, data: true, email: true, entityId: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, isReadOnly: true, multiple: true, phone: true, profileId: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Get one orgInvite
const { data: item } = useOrgInviteQuery({
  id: '<UUID>',
  selection: { fields: { channel: true, createdAt: true, data: true, email: true, entityId: true, expiresAt: true, id: true, inviteCount: true, inviteLimit: true, inviteToken: true, inviteValid: true, isReadOnly: true, multiple: true, phone: true, profileId: true, receiverId: true, senderId: true, updatedAt: true } },
});

// Create a orgInvite
const { mutate: create } = useCreateOrgInviteMutation({
  selection: { fields: { id: true } },
});
create({ channel: '<String>', data: '<JSON>', email: '<Email>', entityId: '<UUID>', expiresAt: '<Datetime>', inviteCount: '<Int>', inviteLimit: '<Int>', inviteToken: '<String>', inviteValid: '<Boolean>', isReadOnly: '<Boolean>', multiple: '<Boolean>', phone: '<String>', profileId: '<UUID>', receiverId: '<UUID>', senderId: '<UUID>' });
```

### OrgMember

```typescript
// List all orgMembers
const { data, isLoading } = useOrgMembersQuery({
  selection: { fields: { actorId: true, entityId: true, id: true, isAdmin: true } },
});

// Get one orgMember
const { data: item } = useOrgMemberQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, entityId: true, id: true, isAdmin: true } },
});

// Create a orgMember
const { mutate: create } = useCreateOrgMemberMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entityId: '<UUID>', isAdmin: '<Boolean>' });
```

### OrgMemberProfile

```typescript
// List all orgMemberProfiles
const { data, isLoading } = useOrgMemberProfilesQuery({
  selection: { fields: { actorId: true, bio: true, createdAt: true, displayName: true, email: true, entityId: true, id: true, membershipId: true, profilePicture: true, title: true, updatedAt: true } },
});

// Get one orgMemberProfile
const { data: item } = useOrgMemberProfileQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, bio: true, createdAt: true, displayName: true, email: true, entityId: true, id: true, membershipId: true, profilePicture: true, title: true, updatedAt: true } },
});

// Create a orgMemberProfile
const { mutate: create } = useCreateOrgMemberProfileMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', bio: '<String>', displayName: '<String>', email: '<String>', entityId: '<UUID>', membershipId: '<UUID>', profilePicture: '<Image>', title: '<String>' });
```

### OrgMembership

```typescript
// List all orgMemberships
const { data, isLoading } = useOrgMembershipsQuery({
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isExternal: true, isOwner: true, isReadOnly: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one orgMembership
const { data: item } = useOrgMembershipQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, capabilities: true, createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, granted: true, id: true, isActive: true, isAdmin: true, isApproved: true, isBanned: true, isDisabled: true, isExternal: true, isOwner: true, isReadOnly: true, profileId: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a orgMembership
const { mutate: create } = useCreateOrgMembershipMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', capabilities: '<BitString>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', granted: '<BitString>', isActive: '<Boolean>', isAdmin: '<Boolean>', isApproved: '<Boolean>', isBanned: '<Boolean>', isDisabled: '<Boolean>', isExternal: '<Boolean>', isOwner: '<Boolean>', isReadOnly: '<Boolean>', profileId: '<UUID>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### OrgMembershipDefault

```typescript
// List all orgMembershipDefaults
const { data, isLoading } = useOrgMembershipDefaultsQuery({
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, id: true, isApproved: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one orgMembershipDefault
const { data: item } = useOrgMembershipDefaultQuery({
  id: '<UUID>',
  selection: { fields: { createdAt: true, createdBy: true, createdByPrincipal: true, entityId: true, id: true, isApproved: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a orgMembershipDefault
const { mutate: create } = useCreateOrgMembershipDefaultMutation({
  selection: { fields: { id: true } },
});
create({ createdBy: '<UUID>', createdByPrincipal: '<UUID>', entityId: '<UUID>', isApproved: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### OrgMembershipSetting

```typescript
// List all orgMembershipSettings
const { data, isLoading } = useOrgMembershipSettingsQuery({
  selection: { fields: { allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, createChildCascadeOwners: true, createdAt: true, createdBy: true, createdByPrincipal: true, deleteMemberCascadeChildren: true, entityId: true, id: true, inviteProfileAssignmentMode: true, limitAllocationMode: true, populateMemberEmail: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Get one orgMembershipSetting
const { data: item } = useOrgMembershipSettingQuery({
  id: '<UUID>',
  selection: { fields: { allowExternalMembers: true, allowPrincipalOwnedApiKeys: true, apiKeyMaxDuration: true, createChildCascadeAdmins: true, createChildCascadeMembers: true, createChildCascadeOwners: true, createdAt: true, createdBy: true, createdByPrincipal: true, deleteMemberCascadeChildren: true, entityId: true, id: true, inviteProfileAssignmentMode: true, limitAllocationMode: true, populateMemberEmail: true, updatedAt: true, updatedBy: true, updatedByPrincipal: true } },
});

// Create a orgMembershipSetting
const { mutate: create } = useCreateOrgMembershipSettingMutation({
  selection: { fields: { id: true } },
});
create({ allowExternalMembers: '<Boolean>', allowPrincipalOwnedApiKeys: '<Boolean>', apiKeyMaxDuration: '<Interval>', createChildCascadeAdmins: '<Boolean>', createChildCascadeMembers: '<Boolean>', createChildCascadeOwners: '<Boolean>', createdBy: '<UUID>', createdByPrincipal: '<UUID>', deleteMemberCascadeChildren: '<Boolean>', entityId: '<UUID>', inviteProfileAssignmentMode: '<String>', limitAllocationMode: '<String>', populateMemberEmail: '<Boolean>', updatedBy: '<UUID>', updatedByPrincipal: '<UUID>' });
```

### OrgOwnerGrant

```typescript
// List all orgOwnerGrants
const { data, isLoading } = useOrgOwnerGrantsQuery({
  selection: { fields: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Get one orgOwnerGrant
const { data: item } = useOrgOwnerGrantQuery({
  id: '<UUID>',
  selection: { fields: { actorId: true, createdAt: true, entityId: true, grantorId: true, id: true, isGrant: true, updatedAt: true } },
});

// Create a orgOwnerGrant
const { mutate: create } = useCreateOrgOwnerGrantMutation({
  selection: { fields: { id: true } },
});
create({ actorId: '<UUID>', entityId: '<UUID>', grantorId: '<UUID>', isGrant: '<Boolean>' });
```

## Custom Operation Hooks

### `useGetOrganizationIdQuery`

getOrganizationId

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `entityId` | UUID |
  | `entityType` | String |

### `useOrgIsManagerOfQuery`

orgIsManagerOf

- **Type:** query
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `managerId` | UUID |
  | `maxDepth` | Int |
  | `targetEntityId` | UUID |
  | `userId` | UUID |

### `useAcceptAppInviteMutation`

acceptAppInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptAppInviteInput (required) |

### `useAcceptOrgInviteMutation`

acceptOrgInvite

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | AcceptOrgInviteInput (required) |

### `useProvisionAppUserMutation`

provisionAppUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUserInput (required) |

### `useProvisionAppUsersBulkMutation`

provisionAppUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionAppUsersBulkInput (required) |

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

### `useProvisionOrgUserMutation`

provisionOrgUser

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUserInput (required) |

### `useProvisionOrgUsersBulkMutation`

provisionOrgUsersBulk

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | ProvisionOrgUsersBulkInput (required) |

### `useSubmitAppInviteCodeMutation`

submitAppInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitAppInviteCodeInput (required) |

### `useSubmitOrgInviteCodeMutation`

submitOrgInviteCode

- **Type:** mutation
- **Arguments:**

  | Argument | Type |
  |----------|------|
  | `input` | SubmitOrgInviteCodeInput (required) |
