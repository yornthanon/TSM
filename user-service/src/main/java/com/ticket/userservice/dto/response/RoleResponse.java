package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ticket.userservice.entity.Role;

import java.time.LocalDateTime;

public record RoleResponse(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String name,
        @JsonProperty("description") String description,
        @JsonProperty("status") String status,
        @JsonProperty("created_by") String createdBy,
        @JsonProperty("created_at") LocalDateTime createdAt,
        @JsonProperty("updated_by") String updatedBy,
        @JsonProperty("updated_at") LocalDateTime updatedAt
) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.getStatus(),
                role.getCreatedBy(),
                role.getCreatedAt(),
                role.getUpdatedBy(),
                role.getUpdatedAt()
        );
    }
}