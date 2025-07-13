package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.type.TaskPriority;
import org.example.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskEntity save(String title, TaskPriority priority, String description, LocalDateTime deadline, ProjectEntity projectEntity) {
        TaskEntity taskEntity = TaskEntity
                .builder()
                .title(title)
                .priority(priority)
                .description(description)
                .deadline(deadline)
                .project(projectEntity)
                .build();
        return taskRepository.saveAndFlush(taskEntity);
    }

    public void remove(String title, ProjectEntity project) {
        taskRepository.deleteByTitleAndProject(title, project);
    }

    public List<TaskEntity> findAll(ProjectEntity project) {
        return taskRepository.findByProject(project);
    }

    public void setPriority(TaskPriority priority, String title,ProjectEntity project) {
        taskRepository.setPriorityByTitleAndProject(priority, title, project);
    }

    public void setEndTime(LocalDateTime endTime, String title, ProjectEntity project) {
        taskRepository.setEndTimeByTitleAndProject(endTime, title, project);
    }

    public Optional<TaskEntity> findById(Long id){
        return taskRepository.findById(id);
    }
}
