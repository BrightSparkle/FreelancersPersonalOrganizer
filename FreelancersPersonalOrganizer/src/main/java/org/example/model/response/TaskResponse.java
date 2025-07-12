package org.example.model.response;

import java.time.LocalDateTime;

public record TaskResponse(
        String title,
        String priority,
        String description,
        LocalDateTime deadline,
        LocalDateTime startTime,
        LocalDateTime endTime
) { }
