import PublicKeySignature from './plugins/PublicKeySignature';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

export const getGraphileSettings = ({
  host,
  port,
  schema,
  simpleInflection,
  oppositeBaseNames,
  svc
}) => {
  const options = getSettings({
    host,
    port,
    schema,
    simpleInflection,
    oppositeBaseNames
  });

  const { anon_role, role_name, role_key } = svc;
  if (svc.pubkey_challenge?.length == 6) {
    options.appendPlugins.push(PublicKeySignature(svc));
  }

  options.pgSettings = async function pgSettings(req) {
    // TODO both role_ids and role_id
    if (req?.token?.user_id) {
      return {
        role: role_name,
        [`jwt.claims.${role_key}`]: req.token.user_id,
        [`jwt.claims.role_ids`]: '{' + req.token.user_id + '}'
      };
    }
    return { role: anon_role };
  };
};
