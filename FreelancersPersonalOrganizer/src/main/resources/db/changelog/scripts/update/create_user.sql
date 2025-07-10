create table "user"
(
  id         BIGSERIAL     primary key,
  username   VARCHAR(100),
  email   VARCHAR(100)     unique,
  role    user_role
);

create index user_username_idx on "user" using hash (username);