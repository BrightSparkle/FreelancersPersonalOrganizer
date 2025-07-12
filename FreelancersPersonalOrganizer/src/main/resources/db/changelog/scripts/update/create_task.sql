create table task
(
    id           BIGSERIAL     primary key,
    title        VARCHAR(100),
    project_id   BIGINT,
    priority     task_priority,
    description  TEXT,
    deadline     TIMESTAMP,
    start_time   TIMESTAMP default current_timestamp,
    end_time     TIMESTAMP
);

alter table task
    add constraint task_project_fk
        foreign key (project_id) references project(id);