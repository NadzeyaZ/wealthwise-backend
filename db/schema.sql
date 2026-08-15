DROP TABLE IF EXISTS advisors_clients;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'advisor'))
);

CREATE TABLE advisors_clients (
    id          serial      PRIMARY KEY,
    advisor_id  integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id   integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (advisor_id, client_id)
);