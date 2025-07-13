package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.entity.CommentEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.model.request.CommentRequest;
import org.example.model.response.CommentResponse;
import org.example.model.response.ErrorResponse;
import org.example.service.CommentService;
import org.example.service.TaskService;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/comment")
public class CommentController {

    private final UserService userService;
    private final TaskService taskService;
    private final CommentService commentService;


    @PostMapping("/create")
    public ResponseEntity<?> createComment(@RequestBody CommentRequest commentRequest) {

        TaskEntity task = taskService.findById(commentRequest.taskId()).get();
        UserEntity author = userService.findByUsername(commentRequest.author()).get();

        CommentEntity comment = commentService.save(commentRequest.text(), task, author);

        return ResponseEntity.ok(new CommentResponse(comment.getId(), comment.getText(), comment.getText(),comment.getCreatedAt()));
    }


    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteComment(@RequestParam Long commentId, @RequestParam String username) {

        UserEntity user = userService.findByUsername(username)
                .orElse(null);

        CommentEntity comment = commentService.findById(commentId).get();

        if (!comment.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>(new ErrorResponse("Нет прав на удаление комментария"), HttpStatus.FORBIDDEN);
        }

        commentService.remove(commentId);

        return ResponseEntity.ok("комментарий удален");
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getCommentsByTask(@RequestParam Long taskId) {

        TaskEntity task = taskService.findById(taskId).get();

        List<CommentEntity> comments = commentService.findAll(task);

        List<CommentResponse> response = comments.stream()
                .map(c -> new CommentResponse(c.getId(), c.getText(), c.getUser().getUsername(), c.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(response);
    }
}