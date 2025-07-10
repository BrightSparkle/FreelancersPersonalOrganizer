create table comment
(
    id         BIGSERIAL     primary key,
    text       TEXT,
    task_id    BIGINT,
    user_id    BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

alter table comment
    add constraint comment_task_fk
        foreign key (task_id) references task(id);

alter table comment
    add constraint comment_user_fk
        foreign key (user_id) references "user"(id);