package org.example.repository;

import org.example.model.entity.CommentEntity;
import org.example.model.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity,Long> {

    List<CommentEntity> findByTask(TaskEntity task);

    void removeById(Long id);
}
