package com.urbanlens.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "urbanlens.jwt")
public record JwtProperties(
        String secret,
        long expirationMs
) {
}
