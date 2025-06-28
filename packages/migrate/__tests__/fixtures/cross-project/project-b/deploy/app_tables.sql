CREATE TABLE app.users (
  id SERIAL PRIMARY KEY,
  status base.status DEFAULT 'active'
);