package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.entity.CommentEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CommentService {

    private CommentRepository commentRepository;

    public CommentEntity save(String text, TaskEntity task, UserEntity author) {
        CommentEntity commentEntity = CommentEntity.builder().text(text).user(author).task(task).build();
        return commentRepository.save(commentEntity);
    }

    public void remove(Long id) {
        commentRepository.deleteById(id);
    }

    public List<CommentEntity> findAll(TaskEntity task) {
        return commentRepository.findByTask(task);
    }

    public Optional<CommentEntity> findById(Long id) {
     return commentRepository.findById(id);
    }
}
