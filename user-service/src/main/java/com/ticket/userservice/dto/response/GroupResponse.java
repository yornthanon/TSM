package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ticket.userservice.entity.Group;

import java.util.Set;
import java.util.stream.Collectors;

public record GroupResponse(
        @JsonProperty("id") Long id,
        @JsonProperty("name") String name,
        @JsonProperty("description") String description,
        @JsonProperty("status") String status,
        @JsonProperty("permissions") Set<String> permissions,
        @JsonProperty("roles") Set<String> roles,
        @JsonProperty("memberCount") int memberCount
) {
    public static GroupResponse from(Group group) {
        Set<String> permissionNames = group.getPermissions() != null
                ? group.getPermissions().stream().map(p -> p.getName()).collect(Collectors.toSet())
                : Set.of();

        Set<String> roleNames = group.getRoles() != null
                ? group.getRoles().stream().map(r -> r.getName()).collect(Collectors.toSet())
                : Set.of();

        int memberCount = group.getUsers() != null ? group.getUsers().size() : 0;

        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getStatus(),
                permissionNames,
                roleNames,
                memberCount
        );
    }
}
