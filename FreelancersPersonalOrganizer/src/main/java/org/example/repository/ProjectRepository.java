package org.example.repository;

import org.example.model.entity.ProjectEntity;
import org.example.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity,Long> {

    List<ProjectEntity> findByOwner(UserEntity user);

    void removeByNameAndOwner(String name, UserEntity user);
}
