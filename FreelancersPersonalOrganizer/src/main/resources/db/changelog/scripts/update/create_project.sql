create table project
(
    id         BIGSERIAL     primary key,
    name       VARCHAR(100),
    owner_id   BIGINT
);

alter table project
    add constraint project_owner_fk
        foreign key (owner_id) references "user"(id)
            ON DELETE CASCADE;