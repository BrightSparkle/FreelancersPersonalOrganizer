package org.example.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.model.entity.type.TaskPriority;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.LocalDateTime;

@Entity
@Table(name = "task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, nullable = false)
    private String title;

    // Связь с проектом
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "task_project_fk"))
    private ProjectEntity project;

    @Enumerated
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "task_priority")
    private TaskPriority priority;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime deadline;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
