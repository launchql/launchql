import type { ApiOptions } from '@constructive-io/graphql-types';

/**
 * The role control-plane queries run as (`api.controlRole` / `API_CONTROL_ROLE`).
 * The login role is NOINHERIT and holds no privileges, so there is no default.
 */
export const getControlRole = (opts: { api?: ApiOptions }): string => {
  const role = opts.api?.controlRole;
  if (!role) {
    throw new Error(
      'GraphQL server: api.controlRole (API_CONTROL_ROLE) is required — control-plane queries run as that role'
    );
  }
  return role;
};
