package com.ticket.userservice.dto.response;

import java.time.Instant;

public record ActAsAuditResponse(
        Long id,
        Long sessionId,
        Long actorUserId,
        String actorEmail,
        Long targetUserId,
        String targetEmail,
        String action,
        String httpMethod,
        String requestPath,
        Integer responseStatus,
        Instant occurredAt) {
}
