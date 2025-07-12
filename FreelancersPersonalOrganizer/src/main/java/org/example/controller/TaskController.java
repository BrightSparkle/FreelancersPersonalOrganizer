package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.entity.ProjectEntity;
import org.example.model.entity.TaskEntity;
import org.example.model.entity.UserEntity;
import org.example.model.entity.type.TaskPriority;
import org.example.model.request.TaskRequest;
import org.example.model.response.ErrorResponse;
import org.example.model.response.TaskResponse;
import org.example.service.ProjectService;
import org.example.service.TaskService;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class TaskController {
    private final TaskService taskService;
    private final ProjectService projectService;
    private final UserService userService;

    // Создать новую задачу
    @PostMapping("/developer/create")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest) {

        UserEntity user = userService.findByUsername(taskRequest.username()).get();
        ProjectEntity project = projectService.findByNameAndOwner(taskRequest.projectName(), user).get();

        // Проверка на дубликат задачи с таким же названием в проекте
        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(taskRequest.title()));

        if (exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача с таким названием уже существует в проекте"), HttpStatus.BAD_REQUEST);
        }

        TaskEntity task = taskService.save(taskRequest.title(), TaskPriority.valueOf(taskRequest.priority()), taskRequest.description(), taskRequest.deadline(), project);

        return ResponseEntity.ok(new TaskResponse(task.getTitle(), task.getPriority().name(), task.getDescription(), task.getDeadline(), task.getStartTime(), null));
    }

    // Удалить задачу по названию и проекту
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteTask(@RequestParam String title, @RequestParam String projectName) {

        ProjectEntity project = projectService.findByName(projectName).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(title));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.remove(title, project);

        return ResponseEntity.ok(new TaskResponse(title, null, null));
    }

    // Получить все задачи проекта
    @GetMapping("/all")
    public ResponseEntity<?> getTasks(@RequestParam String projectName) {

        ProjectEntity project = projectService.findByName(projectName).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        List<TaskResponse> tasks = taskService.findAll(project).stream()
                .map(task -> new TaskResponse(task.getTitle(), task.getPriority(), task.getDeadline()))
                .toList();

        return ResponseEntity.ok(tasks);
    }

    // Обновить приоритет задачи
    @PutMapping("/update/priority")
    public ResponseEntity<?> updatePriority(@RequestBody TaskUpdatePriorityRequest request) {

        ProjectEntity project = projectService.findByName(request.projectName()).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(request.title()));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.setPriority(request.priority(), request.title(), project);

        return ResponseEntity.ok(new TaskResponse(request.title(), request.priority(), null));
    }

    // Обновить время окончания задачи
    @PutMapping("/update/endtime")
    public ResponseEntity<?> updateEndTime(@RequestBody TaskUpdateEndTimeRequest request) {

        ProjectEntity project = projectService.findByName(request.projectName()).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(request.title()));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.setEndTime(request.endTime(), request.title(), project);

        return ResponseEntity.ok(new TaskResponse(request.title(), null, request.endTime()));
    }
}
