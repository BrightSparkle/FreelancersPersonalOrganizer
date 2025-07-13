package org.example.model.response;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String priority,
        String description,
        LocalDateTime deadline,
        LocalDateTime startTime,
        LocalDateTime endTime
) { }
