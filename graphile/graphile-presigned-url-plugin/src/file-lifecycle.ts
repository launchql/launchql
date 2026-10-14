import { headObject } from './s3-signer';
import type { S3Config, StorageModuleConfig } from './types';

/**
 * The statuses in which a files row stands for bytes a reader can actually GET.
 * A `requested` row is a claim, not an object — its presigned PUT may never have
 * run — and `rejected`/`expired` are settled failures.
 */
export const LIVE_FILE_STATUSES = ['uploaded', 'processed'];

/**
 * The `status` column for splicing into a select list, when the module runs the
 * confirm-upload lifecycle that settles it.
 */
export function statusSelectFragment(storageConfig: StorageModuleConfig): string {
  return storageConfig.hasConfirmUpload ? ', status' : '';
}

/**
 * Whether an existing row may be handed back as a dedup hit: only once the bytes
 * it names are in S3.
 *
 * The row is written before the PUT. With confirm-upload, the confirm job moves
 * it out of `requested` only after inspecting the object, so its status is the
 * answer. Without it nothing ever moves the row, so `status` stays `requested`
 * whether or not the PUT ran, and the object at `key` is the only evidence.
 */
export async function isLiveFileRow(
  storageConfig: StorageModuleConfig,
  s3: S3Config,
  row: { key: string; status?: string }
): Promise<boolean> {
  if (storageConfig.hasConfirmUpload) return LIVE_FILE_STATUSES.includes(row.status as string);
  return (await headObject(s3, row.key)) !== null;
}
