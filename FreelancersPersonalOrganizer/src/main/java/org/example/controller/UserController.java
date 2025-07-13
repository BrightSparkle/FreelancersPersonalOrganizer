package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.entity.UserEntity;
import org.example.model.request.SignInRequest;
import org.example.model.request.SignUpRequest;
import org.example.model.response.ErrorResponse;
import org.example.model.response.SignInResponse;
import org.example.model.response.SignUpResponse;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;

@Controller
@AllArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {

        if (userService.findByEmail(signUpRequest.email()).isPresent()) {
            return new ResponseEntity<>(new ErrorResponse("Пользователь с указанным email уже существует"), HttpStatus.BAD_REQUEST);
        }

        if (userService.findByUsername(signUpRequest.username()).isPresent()) {
            return new ResponseEntity<>(new ErrorResponse("Пользователь с указанным username уже существует"), HttpStatus.BAD_REQUEST);
        }

        UserEntity user = userService.save(signUpRequest.username(), signUpRequest.email(), signUpRequest.password(), signUpRequest.role());

        return ResponseEntity.ok(new SignUpResponse(user.getUsername(),user.getUserRole().name()));

    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest signInRequest) {

        Optional<UserEntity> user = userService.findByUsername(signInRequest.username());

        if (user.isEmpty()) {
            return new ResponseEntity<>(new ErrorResponse("Пользователь с указанным username не существует"), HttpStatus.BAD_REQUEST);
        }

        if (!user.get().getPassword().equals(String.valueOf(signInRequest.password().hashCode()))) {
            return new ResponseEntity<>(new ErrorResponse("Неверный пароль"), HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(new SignInResponse(user.get().getUsername(), user.get().getUserRole().name()));

    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll(){
        return ResponseEntity.ok(userService.findAllDevelopers());
    }

}
