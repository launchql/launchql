/**
 * Types for the bucket provisioner plugin.
 */

/**
 * Input for the provisionBucket mutation.
 */
export interface ProvisionBucketInput {
  /** The logical bucket key (e.g., "public", "private") */
  bucketKey: string;
  /**
   * Owner entity ID for entity-scoped bucket provisioning.
   * Omit for app-level (database-wide) storage.
   */
  ownerId?: string;
}

/**
 * Result of the provisionBucket mutation: the bucket row it stamped.
 */
export interface ProvisionBucketPayload {
  /** The logical bucket row whose reconciliation was requested */
  bucketId: string;
  /** The logical bucket key */
  bucketKey: string;
  /** The physical name already recorded, or null while reconciliation is pending */
  physicalName: string | null;
  /** When reconciliation was last requested */
  provisionRequestedAt: string;
}
