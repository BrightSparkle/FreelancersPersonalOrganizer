package org.example.repository;

import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.model.entity.type.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface
TaskRepository extends JpaRepository<TaskEntity,Long> {

    List<TaskEntity> findByProject(ProjectEntity project);

    void deleteByTitleAndProject(String title, ProjectEntity project);

    void setPriorityByTitleAndProject(TaskPriority priority, String title,ProjectEntity project);

    void setEndTimeByTitleAndProject(LocalDateTime endTime, String title, ProjectEntity project);
}
