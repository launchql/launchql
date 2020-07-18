const psqlArray = (array) => {
  return `{${array.join(',')}}`;
};

export default (rows) => {
  return rows.reduce((m, svc) => {
    if (svc.pubkey_challenge && svc.pubkey_challenge.length) {
      return (
        m +
        `
INSERT INTO services_public.services 
(
    subdomain,
    domain,
    dbname,
    role_name,
    anon_role,
    schemas,
    role_key,
    auth,
    pubkey_challenge
) VALUES 
(
    '${svc.subdomain}',
    '${svc.domain}',
    current_database(), -- potentially update this if svc db is not same
    '${svc.role_name}',
    '${svc.anon_role}',
    ${psqlArray(svc.schemas.map((s) => `'${s}'`))},
    '${svc.role_key}',
    ${psqlArray(svc.auth.map((s) => `'${s}'`))},
    ${psqlArray(svc.pubkey_challenge.map((s) => `'${s}'`))}

);

          `
      );
    } else if (svc.auth && svc.auth.length) {
      return (
        m +
        `
INSERT INTO services_public.services 
(
    subdomain,
    domain,
    dbname,
    role_name,
    anon_role,
    schemas,
    role_key,
    auth
) VALUES 
(
    '${svc.subdomain}',
    '${svc.domain}',
    current_database(), -- potentially update this if svc db is not same
    '${svc.role_name}',
    '${svc.anon_role}',
    ${psqlArray(svc.schemas.map((s) => `'${s}'`))},
    '${svc.role_key}',
    ${psqlArray(svc.auth.map((s) => `'${s}'`))},

);
        
          `
      );
    } else {
      return (
        m +
        `
INSERT INTO services_public.services 
(
    subdomain,
    domain,
    dbname,
    role_name,
    anon_role,
    schemas
) VALUES 
(
    '${svc.subdomain}',
    '${svc.domain}',
    current_database(), -- potentially update this if svc db is not same
    '${svc.role_name}',
    '${svc.anon_role}',
    ${psqlArray(svc.schemas.map((s) => `'${s}'`))}
);
        
          `
      );
    }
  }, '');
};
