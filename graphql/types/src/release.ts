/**
 * The deployed release tuple. The cloud operator injects it from
 * ConstructiveApp.spec.release as CONSTRUCTIVE_RELEASE_* and the server serves
 * it at /.well-known/constructive-release for live acceptance.
 */
export interface ReleaseOptions {
  hub: string;
  constructive: string;
  constructiveDb: string;
  dashboard: string;
  functions: string;
}
