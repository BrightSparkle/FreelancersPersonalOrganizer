package org.example.repository;

import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity,Long> {

    List<TaskEntity> findByProject(ProjectEntity project);

}
