package org.example.service;

import lombok.AllArgsConstructor;
import org.example.model.entity.UserEntity;
import org.example.model.entity.type.UserRole;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public boolean findByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public boolean findByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public void save(String username, String email, String password,String role) {
//ХЭШ ПАРОЛЬ!!!
        UserEntity user = UserEntity.builder()
                .username(username)
                .email(email)
                .password(String.valueOf(password.hashCode()))
                .role(UserRole.valueOf(role.toUpperCase()))
                .build();

        userRepository.saveAndFlush(user);
    }

}
