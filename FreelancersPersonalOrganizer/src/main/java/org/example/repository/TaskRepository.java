package org.example.repository;

import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.model.entity.type.TaskPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface
TaskRepository extends JpaRepository<TaskEntity,Long> {

    List<TaskEntity> findByProject(ProjectEntity project);

    @Transactional
    @Modifying
    @Query("delete from TaskEntity t where t.title = :title and t.project = :project")
    void deleteByTitleAndProject(String title, ProjectEntity project);

    @Modifying
    @Transactional
    @Query("UPDATE TaskEntity t SET t.priority = :priority WHERE t.title = :title AND t.project = :project")
    void updatePriorityByTitleAndProject(@Param("priority") TaskPriority priority,
                                         @Param("title") String title,
                                         @Param("project") ProjectEntity project);

    @Modifying
    @Transactional
    @Query("UPDATE TaskEntity t SET t.endTime = :endTime WHERE t.title = :title AND t.project = :project")
    void updateEndTimeByTitleAndProject(@Param("endTime") LocalDateTime endTime,
                                        @Param("title") String title,
                                        @Param("project") ProjectEntity project);

}
