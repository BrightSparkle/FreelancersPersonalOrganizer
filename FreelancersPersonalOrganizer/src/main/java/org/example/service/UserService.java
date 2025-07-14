package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.entity.UserEntity;
import org.example.model.entity.type.UserRole;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Optional<UserEntity> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<UserEntity> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity save(String username, String email, String password, String role) {
//ХЭШ ПАРОЛЬ!!!
        UserEntity user = UserEntity.builder()
                .username(username)
                .email(email)
                .password(String.valueOf(password.hashCode()))
                .role(UserRole.valueOf(role.toUpperCase()))
                .build();

        return userRepository.saveAndFlush(user);
    }

    public List<UserEntity> findAllDevelopers() {
        return userRepository.findAllByRole(UserRole.DEVELOPER);
    }

}
