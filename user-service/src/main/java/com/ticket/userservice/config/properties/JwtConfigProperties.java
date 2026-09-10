package com.ticket.userservice.config.properties;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Getter
@Setter
public class JwtConfigProperties {

    @Value("${jwt.url}")
    public String url;
    @Value("${jwt.header}")
    public String header;
    @Value("${jwt.prefix}")
    public String prefix;
    @Value("${jwt.expiration}")
    public Long expiration;
    @Value("${jwt.refresh-token-expiration}")
    public Long refreshTokenExpiration;
    @Value("${jwt.secret}")
    public String secret;

    @PostConstruct
    public void validate() {
        if (!StringUtils.hasText(secret) || secret.length() < 32) {
            throw new IllegalStateException(
                    "jwt.secret must be configured via JWT_SECRET and be at least 32 characters.");
        }
    }
}