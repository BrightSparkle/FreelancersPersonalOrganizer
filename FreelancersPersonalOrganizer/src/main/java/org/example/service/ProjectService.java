package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectEntity save(String name, UserEntity user) {
        ProjectEntity projectEntity = ProjectEntity
                .builder()
                .name(name)
                .owner(user)
                .build();
        return projectRepository.saveAndFlush(projectEntity);
    }

    public void remove(String name,UserEntity user) {
         projectRepository.removeByNameAndOwner(name, user);
    }

    public List<ProjectEntity> findByOwner(UserEntity user) {
        return projectRepository.findByOwner(user);
    }
}
