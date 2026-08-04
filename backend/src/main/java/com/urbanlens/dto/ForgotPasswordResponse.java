package com.urbanlens.dto;

public record ForgotPasswordResponse(
        String message,
        String resetToken
) {
}
