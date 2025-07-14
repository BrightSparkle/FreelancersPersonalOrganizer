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
import org.springframework.scheduling.config.Task;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/task")
public class TaskController {

    private final TaskService taskService;
    private final ProjectService projectService;
    private final UserService userService;


    @PostMapping("/developer/create")
    public ResponseEntity<?> createTask(@RequestBody TaskRequest taskRequest) {

        UserEntity user = userService.findByUsername(taskRequest.username()).get();
        ProjectEntity project = projectService.findByNameAndOwner(taskRequest.projectName(), user).get();

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(taskRequest.title()));

        if (exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача с таким названием уже существует в проекте"), HttpStatus.BAD_REQUEST);
        }

        TaskEntity task = taskService.save(taskRequest.title(), TaskPriority.valueOf(taskRequest.priority()), taskRequest.description(), taskRequest.deadline(), project);

        return ResponseEntity.ok(new TaskResponse(task.getId(),task.getTitle(), task.getPriority().name(), task.getDescription(), task.getDeadline(), task.getStartTime(), null));
    }


    @DeleteMapping("/developer/delete")
    public ResponseEntity<?> deleteTask(@RequestParam String title, @RequestParam String projectName, @RequestParam String username) {

        UserEntity user = userService.findByUsername(username).get();

        ProjectEntity project = projectService.findByNameAndOwner(projectName,user).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(title));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.remove(title, project);

        return ResponseEntity.ok(Map.of("deletedTitle", title));
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getTasks(@RequestParam String projectName, @RequestParam String username) {

        UserEntity user = userService.findByUsername(username).get();

        ProjectEntity project = projectService.findByNameAndOwner(projectName,user).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        List<TaskResponse> tasks = taskService.findAll(project).stream()
                .map(task -> new TaskResponse(task.getId(),task.getTitle(), task.getPriority().name(), task.getDescription(), task.getDeadline(), task.getStartTime(), task.getEndTime()))
                .toList();

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/getTask")
    public ResponseEntity<?> getTask(@RequestParam Long taskId) {

        TaskEntity task = taskService.findById(taskId).get();
        return ResponseEntity.ok(task);
    }

    @GetMapping("/getAllDone")
    public ResponseEntity<?> getDoneTasks(@RequestParam String username) {

        UserEntity user = userService.findByUsername(username).get();

        List<ProjectEntity> projectEntities = projectService.findByOwner(user);

       List<TaskResponse> tasks = projectEntities.stream()
               .flatMap(prj->taskService.findAll(prj).stream()).filter(task->task.getEndTime()!=null)
               .map(task -> new TaskResponse(task.getId(),task.getTitle(), task.getPriority().name(), task.getDescription(), task.getDeadline(), task.getStartTime(), task.getEndTime()))
                .toList();


        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/developer/update/priority")
    public ResponseEntity<?> updatePriority(@RequestBody TaskRequest taskRequest) {

        UserEntity user = userService.findByUsername(taskRequest.username()).get();

        ProjectEntity project = projectService.findByNameAndOwner(taskRequest.projectName(),user).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(taskRequest.title()));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.setPriority(TaskPriority.valueOf(taskRequest.priority()), taskRequest.title(), project);

        return ResponseEntity.ok(taskRequest.priority());
    }


    @PutMapping("/developer/update/endtime")
    public ResponseEntity<?> updateEndTime(@RequestBody TaskRequest taskRequest) {

        UserEntity user = userService.findByUsername(taskRequest.username()).get();

        ProjectEntity project = projectService.findByNameAndOwner(taskRequest.projectName(),user).orElse(null);

        if (project == null) {
            return new ResponseEntity<>(new ErrorResponse("Проект не найден"), HttpStatus.BAD_REQUEST);
        }

        boolean exists = taskService.findAll(project).stream()
                .anyMatch(task -> task.getTitle().equals(taskRequest.title()));

        if (!exists) {
            return new ResponseEntity<>(new ErrorResponse("Задача не найдена в проекте"), HttpStatus.BAD_REQUEST);
        }

        taskService.setEndTime(taskRequest.endTime().plusHours(3),taskRequest.title(),project);

        return ResponseEntity.ok(taskRequest.endTime());
    }

}
