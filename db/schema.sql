DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS advisors_clients;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dob date NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'advisor'))
);

CREATE TABLE advisors_clients (
    id          serial      PRIMARY KEY,
    advisor_id  integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id   integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (advisor_id, client_id)
);

CREATE TABLE goals (
    id          serial      PRIMARY KEY,
    client_id   integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        text        NOT NULL,
    target_amount numeric(12, 2) NOT NULL CHECK (target_amount >= 0),
    target_date date        NOT NULL
);

CREATE TABLE investments (
    id          serial      PRIMARY KEY,
    client_id   integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        text        NOT NULL,
    asset_class text        NOT NULL,
    quantity    integer     NOT NULL CHECK (quantity >= 0),
    unit_price  numeric(12, 2) NOT NULL CHECK (unit_price >= 0)
);
CREATE TABLE recommendations (
    id          serial      PRIMARY KEY,
    client_id   integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    advisor_id  integer     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id     integer     REFERENCES goals(id) ON DELETE CASCADE,
    content     text        NOT NULL,
    status      text        NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    client_note  text
);

