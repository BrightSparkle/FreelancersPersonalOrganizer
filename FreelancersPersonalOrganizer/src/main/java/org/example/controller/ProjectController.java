package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.entity.ProjectEntity;
import org.example.model.entity.UserEntity;
import org.example.model.request.ProjectRequest;
import org.example.model.response.ProjectResponse;
import org.example.model.response.ErrorResponse;
import org.example.service.ProjectService;
import org.example.service.UserService;
import org.example.utils.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class ProjectController {

    private final UserService userService;
    private final ProjectService projectService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/developer/create")
    public ResponseEntity<?> createNewProject(@RequestHeader("Authorization") String token, @RequestBody ProjectRequest projectRequest) {

        String username = jwtTokenProvider.getUsernameFromToken(token);

        UserEntity user = userService.findByUsername(username).get();

        if(projectService.findByOwner(user).stream().
                anyMatch(prj->prj.getName().equals(projectRequest.name()))) {
            return new ResponseEntity<>(new ErrorResponse("Проект с таким названием уже существует"), HttpStatus.BAD_REQUEST);
        }

        ProjectEntity project = projectService.save(projectRequest.name(), user);

        return ResponseEntity.ok(new ProjectResponse(project.getName()));

    }

    @DeleteMapping("/developer/delete")
    public ResponseEntity<?> deleteProject(@RequestHeader("Authorization") String token, @RequestBody ProjectRequest projectRequest) {

        String username = jwtTokenProvider.getUsernameFromToken(token);

        UserEntity user = userService.findByUsername(username).get();

        if(projectService.findByOwner(user).stream()
                .noneMatch(prj->prj.getName().equals(projectRequest.name()))) {
            return new ResponseEntity<>(new ErrorResponse("Проект с таким названием не существует"), HttpStatus.BAD_REQUEST);
        }

        projectService.remove(projectRequest.name(), user);


        return ResponseEntity.ok(new ProjectResponse(projectRequest.name()));

    }


    @DeleteMapping("/developer/getAll")
    public ResponseEntity<?> getProjects(@RequestHeader("Authorization") String token) {

        String username = jwtTokenProvider.getUsernameFromToken(token);

        UserEntity user = userService.findByUsername(username).get();

        return ResponseEntity.ok(projectService.findByOwner(user)
                .stream().map(x->new ProjectResponse(x.getName())).toList());
    }
}
