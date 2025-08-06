-- app user
CREATE ROLE app_user LOGIN PASSWORD 'app_password';

GRANT anonymous TO app_user;

GRANT authenticated TO app_user;

-- admin user
CREATE ROLE app_admin LOGIN PASSWORD 'admin_password';

GRANT anonymous TO administrator;

GRANT authenticated TO administrator;

GRANT administrator TO app_admin;

