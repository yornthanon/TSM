package com.ticket.userservice.dto.response;

import java.time.LocalDateTime;

public record TenantWorkspaceResponse(
        Long id,
        String name,
        String status,
        Long ownerUserId,
        LocalDateTime createdAt) {
}
