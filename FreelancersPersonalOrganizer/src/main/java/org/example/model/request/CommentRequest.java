package org.example.model.request;

public record CommentRequest(Long taskId, String author, String text) {
}
