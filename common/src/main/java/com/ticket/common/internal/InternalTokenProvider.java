package com.ticket.common.internal;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Shared secret used for authenticated module-to-module HTTP calls within the
 * single monolith process. Requests carrying the matching token are trusted and
 * allowed to bypass the JWT security filter (the token is never exposed outward).
 */
@Slf4j
@Component
public class InternalTokenProvider {

    public static final String INTERNAL_TOKEN_HEADER = "X-Internal-Token";

    @Getter
    private final String token;

    public InternalTokenProvider(@Value("${internal.auth.token:}") String configuredToken) {
        boolean generated = configuredToken == null || configuredToken.isBlank();
        this.token = generated ? UUID.randomUUID().toString() : configuredToken;
        if (generated) {
            log.warn("INTERNAL_AUTH_TOKEN is not set; generated random token {} (single-process only)", token);
        }
    }

    public String headerName() {
        return INTERNAL_TOKEN_HEADER;
    }
}