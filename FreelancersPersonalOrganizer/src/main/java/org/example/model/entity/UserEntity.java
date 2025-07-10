package org.example.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.model.entity.type.UserRole;
import org.hibernate.annotations.JdbcTypeCode;

import java.sql.Types;

@Entity
@Table(name = "\"user\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String username;

    @Column(length = 100, unique = true)
    private String email;

    private String password;

    private UserRole role;
}