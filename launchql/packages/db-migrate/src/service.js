export default (rows) => {
  return rows.reduce((m, svc) => {
    return (
      m +
      `
INSERT INTO services_public.services 
(
  subdomain,
  domain,
  dbname,
  data
) VALUES 
(
  '${svc.subdomain}',
  '${svc.domain}',
  current_database(), -- potentially update this if svc db is not same
  '${JSON.stringify(svc.data)}'::jsonb
);
      
        `
    );
  }, '');
};
