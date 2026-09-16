package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ticket.userservice.entity.Permission;

import java.util.Set;
import java.util.stream.Collectors;


public record PermissionResponse(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String name,
        @JsonProperty("description") String description,
        @JsonProperty("status") String status,
        @JsonProperty("roles") Set<String> roles,
        @JsonProperty("groups") Set<String> groups
) {
    public static PermissionResponse from(Permission permission) {
        Set<String> roleNames = permission.getRoles() != null
                ? permission.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet())
                : Set.of();

        Set<String> groupNames = permission.getGroups() != null
                ? permission.getGroups().stream().map(group -> group.getName()).collect(Collectors.toSet())
                : Set.of();

        return new PermissionResponse(
                permission.getId(),
                permission.getName(),
                permission.getDescription(),
                permission.getStatus(),
                roleNames,
                groupNames
        );
    }
}
