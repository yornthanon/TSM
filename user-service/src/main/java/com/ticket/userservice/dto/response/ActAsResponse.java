package com.ticket.userservice.dto.response;

import java.time.Instant;
import java.util.List;

public record ActAsResponse(
        String accessToken,
        Long sessionId,
        Instant expiresAt,
        TargetUser target) {

    public record TargetUser(
            Long id,
            String username,
            String email,
            String firstName,
            String lastName,
            Long tenantId,
            List<String> roles) {
    }
}
