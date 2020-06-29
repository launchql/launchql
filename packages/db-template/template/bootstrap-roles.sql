CREATE ROLE administrator;
CREATE ROLE anonymous;
CREATE ROLE authenticated;
CREATE ROLE app_user LOGIN PASSWORD 'app_password';
GRANT anonymous TO app_user;
GRANT authenticated TO app_user;
