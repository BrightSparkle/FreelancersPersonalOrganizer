package org.example.controller;

import lombok.AllArgsConstructor;
import org.example.model.request.SignUpRequest;
import org.example.model.response.SignUpResponse;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@AllArgsConstructor
@RequestMapping("/api")
public class OrganizerController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest signUpRequest) {

        if (userService.findByEmail(signUpRequest.email())) {
            return new ResponseEntity<>(new IllegalArgumentException("Пользователь с указанным email уже существует"), HttpStatus.BAD_REQUEST);
        }

        if (userService.findByUsername(signUpRequest.username())) {
            return new ResponseEntity<>(new IllegalArgumentException("Пользователь с указанным username уже существует"), HttpStatus.BAD_REQUEST);
        }

        userService.save(signUpRequest.username(), signUpRequest.email(), signUpRequest.password(), signUpRequest.role());

        return ResponseEntity.ok(new SignUpResponse(signUpRequest.username()));

    }

}
