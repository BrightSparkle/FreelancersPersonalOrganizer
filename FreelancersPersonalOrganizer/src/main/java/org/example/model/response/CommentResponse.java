package org.example.model.response;

import java.time.LocalDateTime;

public record CommentResponse(Long id, String text, String author, LocalDateTime createdAt) {
}
