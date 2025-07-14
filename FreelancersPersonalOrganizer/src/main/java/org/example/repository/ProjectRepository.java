package org.example.repository;

import org.example.model.entity.ProjectEntity;
import org.example.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity,Long> {

    List<ProjectEntity> findByOwner(UserEntity user);

    Optional<ProjectEntity> findByNameAndOwner(String name, UserEntity user);

    @Transactional
    @Modifying
    void removeByNameAndOwner(String name, UserEntity user);
}
