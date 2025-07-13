package org.example.model.request;

import org.example.model.entity.type.TaskPriority;

import java.time.LocalDateTime;

public record TaskRequest(
        String title,
        String priority,
        String description,
        LocalDateTime deadline,
        String projectName,
        String username,
        LocalDateTime endTime
) {}