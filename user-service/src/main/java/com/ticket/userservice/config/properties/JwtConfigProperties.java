package com.ticket.userservice.config.properties;

import com.ticket.userservice.jwt.JwtSecret;
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
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException(
                    "jwt.secret must be configured via JWT_SECRET.");
        }
        // The secret is Base64-decoded before use, so length alone is not enough:
        // a 48-character plain-text value passes a length check but fails to
        // decode and turns every authenticated request into a 500.
        if (!JwtSecret.isValidSecretKey(secret)) {
            throw new IllegalStateException(
                    "jwt.secret (JWT_SECRET) must be a Base64-encoded key decoding to 32-64 bytes. "
                            + "Generate one with: openssl rand -base64 32");
        }
    }
}